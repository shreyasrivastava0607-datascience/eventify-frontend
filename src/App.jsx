import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('eventify_token');
  const role = localStorage.getItem('eventify_role');

  // Add this spy line!
  console.log(`🛡️ Auth Check -> Token exists: ${!!token} | User Role: "${role}" | Required: "${requiredRole}"`);

  if (!token) {
    console.log("❌ Kicked out: No token");
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    console.log("❌ Kicked out: Role mismatch");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Access Granted!");
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}