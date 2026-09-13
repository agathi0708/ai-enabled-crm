import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // Wait until authentication state is loaded
  if (loading) {
    return <div>Loading...</div>;
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but does not have permission
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authorized
  return <Outlet />;
}

export default ProtectedRoute;