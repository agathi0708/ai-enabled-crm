function DashboardFilters({
    range = "30d",
    onRangeChange,
}) {
    const ranges = [
        {
            value: "7d",
            label: "7 Days",
        },
        {
            value: "30d",
            label: "30 Days",
        },
        {
            value: "90d",
            label: "90 Days",
        },
    ];

    return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {ranges.map((item) => {
                const isActive =
                    range === item.value;

                return (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                            onRangeChange?.(item.value)
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}

export default DashboardFilters;