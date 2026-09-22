function PerformanceChart({ data = [] }) {
    if (!data.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Performance
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                    No performance data available.
                </p>
            </div>
        );
    }

    const maxValue = Math.max(
        ...data.map((item) => Number(item.revenue) || 0),
        1
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Performance Trend
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Deal revenue and won deals over time
                </p>
            </div>

            <div className="mt-6 overflow-x-auto">
                <div className="flex min-w-[600px] items-end gap-4">
                    {data.map((item) => {
                        const revenue =
                            Number(item.revenue) || 0;

                        const height = Math.max(
                            (revenue / maxValue) * 220,
                            revenue > 0 ? 12 : 4
                        );

                        return (
                            <div
                                key={item.month}
                                className="flex flex-1 flex-col items-center"
                            >
                                <div className="mb-2 text-xs font-medium text-slate-500">
                                    ₹{revenue.toLocaleString("en-IN")}
                                </div>

                                <div className="flex h-[220px] w-full items-end justify-center rounded-xl bg-slate-50 px-3">
                                    <div
                                        className="w-full max-w-16 rounded-t-xl bg-indigo-500 transition-all"
                                        style={{
                                            height: `${height}px`,
                                        }}
                                        title={`${item.month}: ₹${revenue.toLocaleString(
                                            "en-IN"
                                        )}`}
                                    />
                                </div>

                                <div className="mt-3 text-xs font-medium text-slate-600">
                                    {item.month}
                                </div>

                                <div className="mt-1 text-xs text-slate-400">
                                    {Number(item.wonDeals) || 0} won
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default PerformanceChart;