import { useEffect, useState } from 'react';

export default function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('es-CR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Costa_Rica',
      });
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span style={styles.clock}>{time}</span>;
}

const styles = {
  clock: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
    padding: '6px 12px',
    background: 'var(--bg-soft)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
};