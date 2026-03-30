import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages placeholders
import Login from './pages/Login';
import Register from './pages/Register';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EthicsDashboard from './pages/EthicsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import Leaderboard from './pages/Leaderboard';
import AlertsPage from './pages/AlertsPage';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'ETHICS_MEMBER') return <EthicsDashboard />;
  return <EmployeeDashboard />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-white selection:bg-primary/30">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track" element={<TrackComplaint />} />

          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<RoleBasedDashboard />} />
            
            {/* Employee Routes */}
            <Route path="/submit-complaint" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><SubmitComplaint /></ProtectedRoute>} />
            
            {/* Shared Ethics / Admin Routes */}
            <Route path="/complaints/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'ETHICS_MEMBER']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'ETHICS_MEMBER']}><Leaderboard /></ProtectedRoute>} />

            {/* Admin Only Routes */}
            <Route path="/alerts" element={<ProtectedRoute allowedRoles={['ADMIN']}><AlertsPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
