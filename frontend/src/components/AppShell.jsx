import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShell({
  children,
  activeItem = "Contacts",
  onNavigate,
  user,
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeItem={activeItem}
        onNavigate={onNavigate}
        user={user}
      />

      <div className="min-w-0 flex-1">
        <Topbar user={user} />

        <main className="min-h-[calc(100vh-5rem)] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;