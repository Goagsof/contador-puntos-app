import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

// Helper: fecha de hoy a medianoche
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Helper: fecha de hoy YYYY-MM-DD (para downtime)
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useTeamData() {
  const { user, profile } = useAuth();

  const [leaders, setLeaders] = useState([]);
  const [selectedLeaderUid, setSelectedLeaderUid] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [casesToday, setCasesToday] = useState([]);
  const [downtimeToday, setDowntimeToday] = useState({});
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // 1. Cargar todos los líderes (para los tabs)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users'), where('role', '==', 'lider'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Ordenar por nombre
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setLeaders(list);
        setLoadingLeaders(false);

        // Por defecto, seleccionar el líder logueado (si es líder) o el primero
        if (!selectedLeaderUid && list.length > 0) {
          const myUid = profile?.role === 'lider' ? user.uid : list[0].id;
          setSelectedLeaderUid(myUid);
        }
      },
      (err) => {
        console.error('Error cargando líderes:', err);
        setLoadingLeaders(false);
      }
    );
    return () => unsub();
  }, [user, profile]);

  // 2. Cargar empleados del equipo seleccionado
  useEffect(() => {
    if (!selectedLeaderUid) return;

    setLoadingTeam(true);
    const q = query(
      collection(db, 'users'),
      where('leader', '==', selectedLeaderUid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setEmployees(list);
        setLoadingTeam(false);
      },
      (err) => {
        console.error('Error cargando empleados:', err);
        setLoadingTeam(false);
      }
    );
    return () => unsub();
  }, [selectedLeaderUid]);

  // 3. Cargar casos de HOY de los empleados del equipo
  useEffect(() => {
    if (employees.length === 0) {
      setCasesToday([]);
      return;
    }

    // Firestore `in` acepta hasta 30 elementos
    const employeeIds = employees.slice(0, 30).map((e) => e.id);
    const start = startOfToday();

    const q = query(
      collection(db, 'cases'),
      where('userId', 'in', employeeIds)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => {
            const ts = c.timestamp?.toMillis?.() ?? 0;
            return ts >= start;
          });
        setCasesToday(list);
      },
      (err) => {
        console.error('Error cargando casos de hoy:', err);
      }
    );
    return () => unsub();
  }, [employees]);

  // 4. Cargar downtime de HOY de los empleados
  useEffect(() => {
    if (employees.length === 0) {
      setDowntimeToday({});
      return;
    }

    const key = todayKey();
    const unsubs = [];
    const map = {};

    employees.forEach((emp) => {
      const docRef = query(
        collection(db, 'downtime', emp.id, 'days'),
        where('date', '==', key)
      );
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          snap.docs.forEach((d) => {
            map[emp.id] = d.data().hours || 0;
          });
          setDowntimeToday({ ...map });
        },
        (err) => {
          console.error('Error cargando downtime:', err);
        }
      );
      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [employees]);

  // 5. Calcular stats por empleado
  const employeeStats = useMemo(() => {
    return employees.map((emp) => {
      const empCases = casesToday.filter((c) => c.userId === emp.id);

      // Producción del día (excluye rework nuevo)
      const modelingCases = empCases.filter(
        (c) => c.type === 'Modeling' || c.type === 'DI' || c.type === 'QC'
      );
      const ptsCases = empCases.filter((c) => c.type === 'PTS');

      const modelingTotal = modelingCases.reduce((acc, c) => {
        if (c.isRework && c.reworkType === 'nuevo') return acc;
        return acc + (c.points || 0);
      }, 0);
      const ptsTotal = ptsCases.reduce((acc, c) => acc + (c.points || 0), 0);
      const dt = downtimeToday[emp.id] || 0;
      const total = modelingTotal + ptsTotal + dt;

      // Calidad
      const reworkNuevo = modelingCases.filter(
        (c) => c.isRework && c.reworkType === 'nuevo'
      ).length;
      const reworkRepetido = modelingCases.filter(
        (c) => c.isRework && c.reworkType === 'repetido'
      ).length;
      let quality = 100;
      if (modelingCases.length > 0) {
        const approved = modelingCases.length - reworkNuevo;
        quality = Math.max(0, (approved / modelingCases.length) * 100);
        quality = Math.max(0, quality - reworkRepetido * 0.1);
      }

      return {
        ...emp,
        casesCount: empCases.length,
        total,
        quality,
        downtime: dt,
        reachedGoal: total >= 8,
        hasData: empCases.length > 0 || dt > 0,
      };
    });
  }, [employees, casesToday, downtimeToday]);

  return {
    leaders,
    selectedLeaderUid,
    setSelectedLeaderUid,
    employees,
    employeeStats,
    loadingLeaders,
    loadingTeam,
  };
}