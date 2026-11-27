import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ConfigContext = createContext();

const DEFAULT_CONFIG = {
  periodStart: '2026-11-23',
  periodEnd: '2026-12-05',
  goal: 80,
  qualityThreshold: 83,
  maintenance: false,
  maintenanceMessage: '',
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'config', 'general');
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...snap.data() });
        } else {
          setConfig(DEFAULT_CONFIG);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error cargando config:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const updateConfig = async (partial) => {
    await setDoc(
      doc(db, 'config', 'general'),
      { ...partial, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
