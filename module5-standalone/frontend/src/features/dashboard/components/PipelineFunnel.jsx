import {
    FunnelChart,
    Funnel,
    LabelList,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PipelineFunnel = ({ stages }) => {
    const stageOrder = [
        "qualified",
        "proposal",
        "negotiation",
        "won",
    ];

    const data = stageOrder
        .filter((stage) => stages?.[stage])
        .map((stage) => ({
            name: stage.charAt(0).toUpperCase() + stage.slice(1),
            value: stages[stage].count,
        }));

    return (
        <div className="chart-card">
            <h2>Pipeline Funnel</h2>

            <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                    <FunnelChart>
                        <Tooltip />

                        <Funnel
                            dataKey="value"
                            data={data}
                            isAnimationActive
                        >
                            <LabelList
                                position="right"
                                fill="#000"
                                stroke="none"
                                dataKey="name"
                            />
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PipelineFunnel;