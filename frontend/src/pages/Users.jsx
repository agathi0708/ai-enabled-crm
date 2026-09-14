import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import {
  getUsers,
  deactivateUser,
  inviteUser,
} from "../features/auth/usersApi";
import InviteUserModal from "../components/InviteUserModal";
import Button from "../components/Button";

const Users = () => {
  const { accessToken, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isInviteModalOpen, setIsInviteModalOpen] =
    useState(false);

  const [isInviting, setIsInviting] =
    useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUsers(accessToken);

      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.error?.message ||
          "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user, accessToken]);

  const handleDeactivate = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateUser(
        userId,
        accessToken
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to deactivate user:",
        err
      );

      alert(
        err.response?.data?.error?.message ||
          "Unable to deactivate user"
      );
    }
  };

  const handleInviteUser = async (userData) => {
    try {
      setIsInviting(true);

      const response = await inviteUser(
        userData,
        accessToken
      );

      await loadUsers();

      const temporaryPassword =
        response.data?.temporaryPassword;

      if (temporaryPassword) {
        alert(
          `User invited successfully.\n\nTemporary password: ${temporaryPassword}`
        );
      } else {
        alert("User invited successfully.");
      }

      return true;
    } catch (err) {
      console.error(
        "Failed to invite user:",
        err
      );

      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.detail ||
          "Unable to invite user"
      );

      return false;
    } finally {
      setIsInviting(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="crm-layout">
        <main className="crm-main">
          <div className="dashboard-content">
            <div className="dashboard-panel">
              <h2>Access denied</h2>

              <p>
                Only administrators can manage users.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="crm-layout">

      {/* Sidebar */}
      <aside className="crm-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            C
          </div>

          <div>
            <div className="sidebar-brand-title">
              AI-Enabled
            </div>

            <div className="sidebar-brand-subtitle">
              CRM
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            MANAGEMENT
          </div>

          <button className="nav-item active">
            <span className="nav-icon">
              ♙
            </span>

            Users
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {user?.name}
              </strong>

              <span>
                {user?.role}
              </span>
            </div>
          </div>

        </div>

      </aside>

      {/* Main */}
      <main className="crm-main">

        <header className="crm-topbar">

          <div>
            <p className="topbar-label">
              Management
            </p>

            <h1 className="topbar-title">
              Users
            </h1>
          </div>

          <div className="topbar-profile">

            <div className="topbar-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>
                {user?.name}
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

        </header>

        <section className="dashboard-content">

          <div className="dashboard-heading">

            <div>
              <h2>
                User Management
              </h2>

              <p>
                Manage CRM users and their account status.
              </p>
            </div>

            <div className="dashboard-heading-actions">

              <div className="user-count-badge">
                {users.length} Users
              </div>

              <Button
                variant="primary"
                onClick={() =>
                  setIsInviteModalOpen(true)
                }
              >
                + Invite User
              </Button>

            </div>

          </div>

          <div className="users-table-card">

            {loading ? (
              <div className="table-state">
                Loading users...
              </div>
            ) : error ? (
              <div className="table-state error-state">
                {error}
              </div>
            ) : users.length === 0 ? (
              <div className="table-state">
                No users found.
              </div>
            ) : (
              <div className="table-wrapper">

                <table className="users-table">

                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {users.map((item) => (
                      <tr key={item.id}>

                        <td>
                          <div className="user-table-name">

                            <div className="table-avatar">
                              {item.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>

                            <strong>
                              {item.name}
                            </strong>

                          </div>
                        </td>

                        <td className="email-cell">
                          {item.email}
                        </td>

                        <td>
                          <span className="role-badge">
                            {item.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              item.is_active
                                ? "status-badge active-status"
                                : "status-badge inactive-status"
                            }
                          >
                            {item.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {item.is_active &&
                          item.id !== user?.id ? (
                            <button
                              className="deactivate-button"
                              onClick={() =>
                                handleDeactivate(
                                  item.id
                                )
                              }
                            >
                              Deactivate
                            </button>
                          ) : (
                            <span className="no-action">
                              —
                            </span>
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </section>

      </main>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() =>
          setIsInviteModalOpen(false)
        }
        onInvite={handleInviteUser}
        isLoading={isInviting}
      />

    </div>
  );
};

export default Users;