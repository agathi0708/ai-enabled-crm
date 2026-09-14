function Sidebar({
  activeItem = "Contacts",
  onNavigate,
  user,
}) {
  const mainNavigation = [
    { label: "Dashboard", icon: "▦" },
    { label: "Contacts", icon: "◉" },
    { label: "Deals", icon: "◇" },
    { label: "Tasks", icon: "✓" },
    { label: "Activities", icon: "◷" },
    { label: "Reports", icon: "▥" },
  ];

  const secondaryNavigation = [
    { label: "AI Assistant", icon: "✦" },
    { label: "Settings", icon: "⚙" },
  ];

  function handleNavigation(label) {
    onNavigate?.(label);
  }

  const displayName =
    user?.name || "Agathiyan R.K.";

  const displayRole =
    user?.role === "sales_rep"
      ? "Sales Representative"
      : user?.role || "Sales Representative";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="flex min-h-screen flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <div className="mr-3 grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            A
          </div>

          <div>
            <div className="text-base font-bold tracking-tight text-slate-900">
              AI CRM
            </div>

            <div className="text-xs text-slate-400">
              Sales Intelligence
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">

          {/* Workspace */}
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>

          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive =
                item.label === activeItem;

              const isAvailable =
                item.label === "Contacts" ||
                item.label === "Deals";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    handleNavigation(item.label)
                  }
                  disabled={!isAvailable}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : isAvailable
                        ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        : "cursor-not-allowed text-slate-300"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg text-sm ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : isAvailable
                          ? "bg-slate-100 text-slate-500"
                          : "bg-slate-50 text-slate-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  {item.label === "Deals" &&
                    isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    )}
                </button>
              );
            })}
          </div>

          {/* Intelligence */}
          <div className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Intelligence
          </div>

          <div className="space-y-1">
            {secondaryNavigation.map(
              (item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-sm text-slate-300">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {initials || "AR"}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </div>

              <div className="truncate text-xs text-slate-500">
                {displayRole}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;