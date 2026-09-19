import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PerformanceChart = ({ data }) => {
    return (
        <div className="chart-card">
            <h2>Performance Trend</h2>

            <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="leads"
                            stroke="#2563eb"
                            strokeWidth={3}
                            name="Leads"
                        />

                        <Line
                            type="monotone"
                            dataKey="wonDeals"
                            stroke="#16a34a"
                            strokeWidth={3}
                            name="Won Deals"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceChart;