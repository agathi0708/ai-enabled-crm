function MetricCard({
    title,
    value,
    description,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
                {title}
            </div>

            <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {value ?? "-"}
            </div>

            {description && (
                <div className="mt-2 text-xs text-slate-400">
                    {description}
                </div>
            )}
        </div>
    );
}

export default MetricCard;