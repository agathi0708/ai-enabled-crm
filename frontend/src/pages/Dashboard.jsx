import { useAuth } from "../features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
            WORKSPACE
          </div>

          <button className="nav-item active">
            <span className="nav-icon">⌂</span>
            Dashboard
          </button>

          <button
  className="nav-item"
  onClick={() => navigate("/contacts")}
>
  <span className="nav-icon">◉</span>
  Contacts
</button>

<button
  className="nav-item"
  onClick={() => navigate("/deals")}
>
  <span className="nav-icon">◆</span>
  Deals
</button>

<button
  className="nav-item"
  onClick={() => navigate("/tasks")}
>
  <span className="nav-icon">✓</span>
  Tasks
</button>

          <div className="nav-section-title">
            MANAGEMENT
          </div>

          <button className="nav-item">
            <span className="nav-icon">▣</span>
            Reports
          </button>

          <button className="nav-item">
            <span className="nav-icon">✦</span>
            AI Assistant
          </button>

          {user?.role === "admin" && (
  <button
    className="nav-item"
    onClick={() => navigate("/users")}
  >
    <span className="nav-icon">♙</span>
    Users
  </button>
)}
        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.role || "rep"}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Sign out
          </button>

        </div>

      </aside>

      {/* Main content */}
      <main className="crm-main">

        {/* Top bar */}
        <header className="crm-topbar">

  <button
    className="mobile-menu-button"
    type="button"
    aria-label="Open navigation"
  >
    ☰
  </button>

  <div></div>
          <div>
            <p className="topbar-label">
              Workspace
            </p>

            <h1 className="topbar-title">
              Dashboard
            </h1>
          </div>

          <div className="topbar-actions">

            <button className="topbar-icon-button">
              🔔
            </button>

            <div className="topbar-profile">
              <div className="topbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                  {user?.role || "rep"}
                </span>
              </div>
            </div>

          </div>

        </header>

        {/* Dashboard content */}
        <section className="dashboard-content">

          <div className="dashboard-heading">
            <div>
              <h2>
                Good to see you, {user?.name || "there"} 👋
              </h2>

              <p>
                Here's what's happening across your CRM.
              </p>
            </div>

            <button className="dashboard-action-button">
              + Add contact
            </button>
          </div>

          {/* Metric cards */}
          <div className="metric-grid">

            <div className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  Total Leads
                </span>

                <span className="metric-icon">
                  ◉
                </span>
              </div>

              <div className="metric-value">
                —
              </div>

              <p className="metric-description">
                Contacts and leads
              </p>
            </div>

            <div className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  Open Deals
                </span>

                <span className="metric-icon">
                  ◆
                </span>
              </div>

              <div className="metric-value">
                —
              </div>

              <p className="metric-description">
                Active opportunities
              </p>
            </div>

            <div className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  Pipeline Value
                </span>

                <span className="metric-icon">
                  $
                </span>
              </div>

              <div className="metric-value">
                —
              </div>

              <p className="metric-description">
                Current pipeline
              </p>
            </div>

            <div className="metric-card">
              <div className="metric-card-top">
                <span className="metric-label">
                  Win Rate
                </span>

                <span className="metric-icon">
                  ↗
                </span>
              </div>

              <div className="metric-value">
                —
              </div>

              <p className="metric-description">
                Closed deals
              </p>
            </div>

          </div>

          {/* Empty dashboard panels */}
          <div className="dashboard-panels">

            <div className="dashboard-panel large-panel">
              <div className="panel-header">
                <div>
                  <h3>
                    Pipeline Overview
                  </h3>

                  <p>
                    Deals by pipeline stage
                  </p>
                </div>
              </div>

              <div className="panel-placeholder">
                <span>◇</span>
                <p>
                  Pipeline data will appear here
                </p>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h3>
                    Recent Activity
                  </h3>

                  <p>
                    Latest CRM activity
                  </p>
                </div>
              </div>

              <div className="panel-placeholder">
                <span>◷</span>
                <p>
                  Activity data will appear here
                </p>
              </div>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Dashboard;