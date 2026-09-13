import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();


  const handleLogout = () => {
    logout();

    navigate("/login");
  };


  return (
    <div>
      <h1>
        AI CRM Dashboard
      </h1>

      {user && (
        <>
          <h2>
            Welcome, {user.name}
          </h2>

          <p>
            Email: {user.email}
          </p>

          <p>
            Role: {user.role}
          </p>

          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}


export default Dashboard;