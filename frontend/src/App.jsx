import { useEffect, useState } from "react";

import ContactsPage from "./features/contacts/ContactsPage";
import LoginPage from "./features/auth/LoginPage";
import TaskList from "./features/tasks/TaskList";
import Dashboard from "./features/dashboard/Dashboard";
import Reports from "./features/reports/Reports";
import AIAssistantPanel from "./features/ai-assistant/AIAssistantPanel";
import DealsPage from "./features/deals/DealsPage";

import AppShell from "./components/AppShell";

import {
  getCurrentUser,
  getStoredUser,
  getToken,
  logout,
} from "./api/auth";

import "./App.css";

function App() {
  const [user, setUser] = useState(
    getStoredUser()
  );

  const [loading, setLoading] = useState(
    Boolean(getToken())
  );

  const [activeItem, setActiveItem] =
    useState("Contacts");

  /**
   * Restore an existing authenticated session.
   */
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedUser =
        getStoredUser();

      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (!cancelled) {
          setUser(
            currentUser || storedUser
          );
        }
      } catch {
        logout();

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    /**
     * Handle expiration of the authenticated session.
     */
    function handleAuthExpired() {
      setUser(null);
      setActiveItem("Contacts");
    }

    window.addEventListener(
      "auth-expired",
      handleAuthExpired
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "auth-expired",
        handleAuthExpired
      );
    };
  }, []);

  /**
   * Called by LoginPage after a successful login.
   */
  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setActiveItem("Contacts");
  }

  /**
   * Sign the current user out.
   */
  function handleLogout() {
    logout();
    setUser(null);
    setActiveItem("Contacts");
  }

  /**
   * Handle sidebar navigation.
   */
  function handleNavigate(item) {
    const availableItems = [
      "Dashboard",
      "Contacts",
      "Deals",
      "Tasks",
      "Activities",
      "Reports",
      "AI Assistant",
      "Settings",
    ];

    if (availableItems.includes(item)) {
      setActiveItem(item);
    }
  }

  /**
   * Show a loading screen while restoring
   * an existing session.
   */
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <div className="rounded-2xl bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-xl">
          Loading CRM...
        </div>
      </div>
    );
  }

  /**
   * No authenticated user:
   * show the login page.
   */
  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }

  let content = null;

  /**
   * Module 5 Dashboard.
   */
  if (activeItem === "Dashboard") {
    content = <Dashboard />;
  }

  /**
   * Contacts module.
   */
  else if (activeItem === "Contacts") {
    content = <ContactsPage />;
  }

  /**
   * Module 3 Deals & Pipeline.
   */
  else if (activeItem === "Deals") {
    content = <DealsPage />;
  }

  /**
   * Tasks module.
   */
  else if (activeItem === "Tasks") {
    content = <TaskList />;
  }

  /**
   * Activities module.
   */
  else if (activeItem === "Activities") {
    content = (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Activities
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Activity management is available from the
          contact details page.
        </p>

        <p className="mt-4 text-sm text-slate-600">
          AI-powered Activity Summary is available in
          the AI Assistant.
        </p>
      </div>
    );
  }

  /**
   * Module 5 Reports.
   */
  else if (activeItem === "Reports") {
    content = <Reports />;
  }

  /**
   * Module 5 AI Assistant.
   */
  else if (activeItem === "AI Assistant") {
    content = (
      <AIAssistantPanel />
    );
  }

  /**
   * Settings module.
   */
  else if (activeItem === "Settings") {
    content = (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Settings module is coming soon.
        </p>
      </div>
    );
  }

  return (
    <AppShell
      activeItem={activeItem}
      onNavigate={handleNavigate}
      user={user}
    >
      {content}

      <div className="pointer-events-none fixed bottom-5 right-5">
        <button
          type="button"
          onClick={handleLogout}
          className="pointer-events-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-lg transition hover:bg-slate-50 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </AppShell>
  );
}

export default App;