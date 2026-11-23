import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const snap = await getDoc(doc(db, 'users', uid));

      if (snap.exists()) {
        const role = snap.data().role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'lider') navigate('/lider');
        else navigate('/empleado');
      } else {
        navigate('/empleado');
      }
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Contador de Puntos</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p style={styles.registerText}>
            ¿No tienes cuenta?{' '}
            <a href="/register" style={styles.registerLink}>
              Regístrate
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    margin: 0,
    color: 'var(--text-h)',
    fontSize: '1.8rem',
    textAlign: 'center',
  },
  subtitle: {
    color: 'var(--text-soft)',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    outline: 'none',
  },
  button: {
    padding: '12px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.15s',
  },
  error: {
    color: 'var(--danger-text)',
    background: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    textAlign: 'center',
    margin: 0,
  },
  registerText: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
  },
  registerLink: {
    color: 'var(--primary)',
    fontWeight: 600,
  },
};