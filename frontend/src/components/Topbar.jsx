import NotificationBell from "../features/notifications/NotificationBell";

function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
      <div>
        <div className="text-sm font-medium text-slate-500">
          Sales Workspace
        </div>

        <div className="mt-1 text-lg font-semibold text-slate-900">
          Customer Relationship Management
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100 md:block"
        >
          Search CRM
          <span className="ml-4 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-400">
            Ctrl K
          </span>
        </button>

        <NotificationBell />

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:bg-slate-50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
            AR
          </div>

          <div className="hidden text-left sm:block">
            <div className="text-sm font-semibold text-slate-900">
              Agathiyan R.K.
            </div>
            <div className="text-xs text-slate-500">
              Sales Representative
            </div>
          </div>

          <span className="hidden text-slate-400 sm:block">
            ▾
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;