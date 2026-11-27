import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { PERIOD_START, PERIOD_END } from '../utils/metricsHelpers';
import { useConfig } from './ConfigContext';
import { useNavigate } from 'react-router-dom';

const CasesContext = createContext();

// Helpers de fecha
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateKeyFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CasesProvider({ children }) {
  const { user, profile } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downtime, setDowntime] = useState(0);
  const { config } = useConfig();
  const navigate = useNavigate();
  // Si hay mantenimiento y no es admin, redirigir
  useEffect(() => {
    if (config.maintenance && profile?.role !== 'admin') {
      navigate('/maintenance');
    }
  }, [config.maintenance, profile, navigate]);
  // --- Casos ---
  useEffect(() => {
    if (!user) {
      setCases([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'cases'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        list.sort((a, b) => {
          const ta = a.timestamp?.toMillis?.() ?? 0;
          const tb = b.timestamp?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setCases(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error en onSnapshot casos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // --- Downtime del DÍA ACTUAL ---
  useEffect(() => {
    if (!user) {
      setDowntime(0);
      return;
    }

    const key = todayKey();
    const docRef = doc(db, 'downtime', user.uid, 'days', key);

    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        setDowntime(snap.data().hours || 0);
      } else {
        setDowntime(0);
      }
    });

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setDowntime(snap.data().hours || 0);
      } else {
        setDowntime(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // --- Operaciones ---
  const addCase = async (caseData) => {
    if (!user) return;
    await addDoc(collection(db, 'cases'), {
      ...caseData,
      userId: user.uid,
      userEmail: user.email,
      timestamp: serverTimestamp(),
      isRework: false,
      reworkType: null,
      notes: '',
    });
  };

  const removeCase = async (caseId) => {
    await deleteDoc(doc(db, 'cases', caseId));
  };

  const updateDowntime = async (hours) => {
    if (!user) return;
    const clamped = Math.max(0, Math.min(8, Number(hours) || 0));
    const key = todayKey();
    await setDoc(
      doc(db, 'downtime', user.uid, 'days', key),
      { hours: clamped, date: key },
      { merge: true }
    );
  };

  const undoLastCase = async () => {
    if (cases.length === 0) return;
    await removeCase(cases[0].id);
  };

  const markAsRework = async (caseId, reworkType) => {
    if (!caseId) return;
    await setDoc(
      doc(db, 'cases', caseId),
      { isRework: true, reworkType },
      { merge: true }
    );
  };

  const resetAll = async () => {
    if (!user) return;
    await Promise.all(cases.map((c) => deleteDoc(doc(db, 'cases', c.id))));
    const key = todayKey();
    await setDoc(
      doc(db, 'downtime', user.uid, 'days', key),
      { hours: 0, date: key },
      { merge: true }
    );
  };

  const updateNotes = async (caseId, notes) => {
    if (!caseId) return;
    await setDoc(
      doc(db, 'cases', caseId),
      { notes: notes || '' },
      { merge: true }
    );
  };

  // --- Leer downtime de un rango de fechas (para Métricas) ---
  const getDowntimeRange = async (startDate, endDate) => {
    if (!user) return {};
    const daysCol = collection(db, 'downtime', user.uid, 'days');
    const snap = await getDocs(daysCol);
    const map = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const key = data.date || docSnap.id;
      if (key >= startDate && key <= endDate) {
        map[key] = data.hours || 0;
      }
    });
    return map;
  };

  // --- Asegurar 8 hrs en días laborales PASADOS y vacíos ---
  const ensureDowntimeForEmptyDays = async (startDate, endDate, existingCases) => {
    if (!user) return;

    // 1. Obtener downtime existente del rango
    const existingDowntime = await getDowntimeRange(startDate, endDate);

    // 2. Agrupar casos por día (YYYY-MM-DD)
    const casesByDay = {};
    existingCases.forEach((c) => {
      const ts = c.timestamp?.toDate?.();
      if (!ts) return;
      const key = dateKeyFromDate(ts);
      casesByDay[key] = (casesByDay[key] || 0) + 1;
    });

    // 3. Recorrer días del rango (solo los que ya pasaron)
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    // Fecha de hoy a medianoche (para comparar solo por día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const writes = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 0=dom, 6=sáb
      // Solo lunes-viernes (1-5)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // 👇 SOLO días estrictamente anteriores a hoy (ayer o antes)
      const dayOnly = new Date(d);
      dayOnly.setHours(0, 0, 0, 0);
      if (dayOnly >= today) continue;

      const key = dateKeyFromDate(d);
      const hasCases = !!casesByDay[key];
      const hasDowntime = existingDowntime[key] !== undefined;

      // Si no hay casos y no hay downtime registrado → guardar 8 hrs
      if (!hasCases && !hasDowntime) {
        writes.push(
          setDoc(
            doc(db, 'downtime', user.uid, 'days', key),
            { hours: 8, date: key },
            { merge: true }
          )
        );
      }
    }

    await Promise.all(writes);
  };

  // --- Ejecutar ensureDowntimeForEmptyDays al cargar (global) ---
  // ⚠️ Este useEffect va DESPUÉS de la definición de ensureDowntimeForEmptyDays
  useEffect(() => {
    if (!user || cases.length === 0) return;
    // Evitar ejecuciones múltiples en la misma sesión
    const key = `ensure-downtime-${user.uid}-${new Date().toDateString()}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    ensureDowntimeForEmptyDays(PERIOD_START, PERIOD_END, cases).catch((err) =>
      console.error('Error asegurando downtime:', err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cases.length]);

  return (
    <CasesContext.Provider
      value={{
        cases,
        loading,
        downtime,
        addCase,
        removeCase,
        updateDowntime,
        undoLastCase,
        resetAll,
        markAsRework,
        updateNotes,
        getDowntimeRange,
        ensureDowntimeForEmptyDays,
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  return useContext(CasesContext);
}