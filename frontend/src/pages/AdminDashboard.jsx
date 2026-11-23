import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Admin</h1>
      <p>Bienvenido, {user?.email}</p>
      <button onClick={logout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  );
}
