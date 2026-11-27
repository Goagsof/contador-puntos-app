import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CasesProvider } from './context/CasesContext';
import { ConfigProvider } from './context/ConfigContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Register from './pages/Register';
import LeaderDashboard from './pages/LeaderDashboard';
import LeaderEmployeeDetail from './pages/LeaderEmployeeDetail';
import Settings from './pages/Settings';
import MetricsPage from './pages/MetricsPage';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <CasesProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/empleado" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
                <Route path="/lider" element={<ProtectedRoute requireLeader><LeaderDashboard /></ProtectedRoute>} />
                <Route path="/lider/empleado/:uid" element={<ProtectedRoute requireLeader><LeaderEmployeeDetail /></ProtectedRoute>} />
                <Route path="/ajustes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/metricas" element={<ProtectedRoute><MetricsPage /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </CasesProvider>
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;