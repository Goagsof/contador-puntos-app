import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const CasesContext = createContext();

export function CasesProvider({ children }) {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downtime, setDowntime] = useState(0);

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

  // --- Downtime (tiempo muerto) ---
  useEffect(() => {
    if (!user) {
      setDowntime(0);
      return;
    }

    const docRef = doc(db, 'downtime', user.uid);

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
    await setDoc(doc(db, 'downtime', user.uid), { hours: clamped }, { merge: true });
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
    await setDoc(doc(db, 'downtime', user.uid), { hours: 0 }, { merge: true });
  };

  const updateNotes = async (caseId, notes) => {
    if (!caseId) return;
    await setDoc(
      doc(db, 'cases', caseId),
      { notes: notes || '' },
      { merge: true }
    );
  };

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
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  return useContext(CasesContext);
}