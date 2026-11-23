import { useAuth } from '../context/AuthContext';

export default function LeaderDashboard() {
  const { profile, logout } = useAuth();

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Líder</h1>
      <p>Bienvenido, {profile?.name}</p>
      <p style={{ color: '#7a9ac0' }}>Esta pantalla se diseñará en el Sub-paso 9.</p>
      <button onClick={logout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  );
}