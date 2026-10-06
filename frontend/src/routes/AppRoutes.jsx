import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PatientsPage from '../pages/PatientsPage';
import DiagnosticsPage from '../pages/DiagnosticsPage';
import RendezVousPage from '../pages/RendezVousPage';
import TraitementsPage from '../pages/TraitementsPage';
import ConstantesPage from '../pages/ConstantesPage';
import AlertsPage from '../pages/AlertsPage';
import PatientDetailPage from '../pages/PatientDetailPage';
import ProfilePage from '../pages/ProfilePage';
import UserManagementPage from '../pages/UserManagementPage';
import HomePage from '../pages/HomePage';
import ProtectedLayout from '../components/ProtectedLayout';

function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(String(user?.role || '').toUpperCase())) {
    return <Navigate to="/app" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<ProtectedRoute roles={['MEDECIN', 'INFIRMIER', 'ADMIN']}><PatientsPage /></ProtectedRoute>} />
          <Route path="patients/:patientId" element={<ProtectedRoute roles={['MEDECIN', 'INFIRMIER', 'ADMIN']}><PatientDetailPage /></ProtectedRoute>} />
          <Route path="diagnostics" element={<ProtectedRoute roles={['MEDECIN', 'ADMIN']}><DiagnosticsPage /></ProtectedRoute>} />
          <Route path="rendezvous" element={<RendezVousPage />} />
          <Route path="traitements" element={<ProtectedRoute roles={['MEDECIN', 'ADMIN', 'PATIENT']}><TraitementsPage /></ProtectedRoute>} />
          <Route path="constantes" element={<ConstantesPage />} />
          <Route path="alertes" element={<AlertsPage />} />
          <Route path="utilisateurs" element={<ProtectedRoute roles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="profil" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
