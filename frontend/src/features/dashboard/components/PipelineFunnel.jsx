function PipelineFunnel({ stages = [] }) {
    if (!stages.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Pipeline
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                    No pipeline data available.
                </p>
            </div>
        );
    }

    const maxCount = Math.max(
        ...stages.map((stage) => Number(stage.count) || 0),
        1
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Pipeline Funnel
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Deals grouped by pipeline stage
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {stages.map((stage) => {
                    const count = Number(stage.count) || 0;
                    const value = Number(stage.value) || 0;

                    const width = Math.max(
                        (count / maxCount) * 100,
                        count > 0 ? 8 : 0
                    );

                    return (
                        <div key={stage.stage}>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium capitalize text-slate-700">
                                    {stage.stage}
                                </span>

                                <span className="text-sm font-semibold text-slate-900">
                                    {count} deal{count === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="h-10 overflow-hidden rounded-xl bg-slate-100">
                                <div
                                    className="flex h-full items-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition-all"
                                    style={{
                                        width: `${width}%`,
                                    }}
                                >
                                    {count > 0 && (
                                        <span>
                                            ₹{value.toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PipelineFunnel;