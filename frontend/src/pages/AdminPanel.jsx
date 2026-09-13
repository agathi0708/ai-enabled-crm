import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function AdminPanel() {
  const { user } = useAuth();


  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>
          AI CRM
        </h1>

        <h2>
          Admin Panel
        </h2>

        <p>
          Welcome, {user?.name}
        </p>

        <p>
          Email: {user?.email}
        </p>

        <p>
          Role: {user?.role}
        </p>

        <p>
          You have administrator access.
        </p>


        <Link to="/admin/users">
          <button type="button">
            Manage Users
          </button>
        </Link>


        <p>
          <Link to="/dashboard">
            Back to Dashboard
          </Link>
        </p>

      </div>

    </div>
  );
}


export default AdminPanel;