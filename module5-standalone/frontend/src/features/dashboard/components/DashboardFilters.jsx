const DashboardFilters = ({ range, onRangeChange }) => {
    return (
        <div className="dashboard-filters">
            <label htmlFor="range">
                Performance Range:
            </label>

            <select
                id="range"
                value={range}
                onChange={(event) =>
                    onRangeChange(event.target.value)
                }
            >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
            </select>
        </div>
    );
};

export default DashboardFilters;