import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('modeling');
  const [leaderId, setLeaderId] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar la lista de líderes
  useEffect(() => {
    const loadLeaders = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'lider'));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          uid: d.id,
          name: d.data().name,
          email: d.data().email,
        }));
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setLeaders(list);
      } catch (err) {
        console.error('Error al cargar líderes:', err);
        setError('No se pudieron cargar los líderes. Intenta de nuevo.');
      } finally {
        setLoadingLeaders(false);
      }
    };
    loadLeaders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!leaderId) {
      setError('Debes seleccionar un líder.');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Crear documento en Firestore
      await setDoc(doc(db, 'users', uid), {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        leader: leaderId,
        mustChangePassword: false,
        createdAt: serverTimestamp(),
        preferences: {
          theme: 'light',
          color: 'blue',
        },
      });

      // 3. Redirigir
      navigate('/empleado');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El email no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.');
      } else if (err.code === 'permission-denied') {
        setError('No se pudo crear el perfil. Contacta al administrador.');
      } else {
        setError('Error al registrarse: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear Cuenta</h1>
        <p style={styles.subtitle}>Contador de Puntos</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
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
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
            autoComplete="new-password"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
            required
          >
            <option value="modeling">Modeling / PTS</option>
            <option value="di">DI</option>
            <option value="qc">QC</option>
          </select>

          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            style={styles.input}
            required
            disabled={loadingLeaders}
          >
            <option value="">
              {loadingLeaders ? 'Cargando líderes...' : 'Selecciona tu líder'}
            </option>
            {leaders.map((l) => (
              <option key={l.uid} value={l.uid}>
                {l.name}
              </option>
            ))}
          </select>

          {leaders.length === 0 && !loadingLeaders && (
            <p style={styles.warn}>
              No se encontraron líderes disponibles. Contacta al administrador.
            </p>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading || loadingLeaders}
            style={styles.button}
          >
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={styles.link}>
            Inicia sesión
          </Link>
        </p>
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
    padding: '36px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    margin: 0,
    color: 'var(--text-h)',
    fontSize: '1.6rem',
    textAlign: 'center',
  },
  subtitle: {
    color: 'var(--text-soft)',
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.92rem',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
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
    transition: 'all 0.15s ease',
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
  warn: {
    color: 'var(--text-soft)',
    fontSize: '0.8rem',
    textAlign: 'center',
    margin: 0,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: '18px',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
};