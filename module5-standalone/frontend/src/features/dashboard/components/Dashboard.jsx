import useDashboard from "../hooks/useDashboard";
import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";
import PipelineFunnel from "./PipelineFunnel";
import ReportExport from "./ReportExport";
import { useState } from "react";
import DashboardFilters from "./DashboardFilters";
import AIAssistantPanel from "../../ai-assistant/components/AIAssistantPanel";

const Dashboard = () => {
    const [range, setRange] = useState("30d");

    const {
        pipelineSummary,
        performanceReport,
        loading,
        error,
    } = useDashboard(range);

    if (loading) {
        return <h2>Loading dashboard...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <h1>CRM Dashboard</h1>

            <DashboardFilters
                range={range}
                onRangeChange={setRange}
            />

            <div className="metrics-container">
                <MetricCard
                    title="Total Leads"
                    value={pipelineSummary?.totalLeads}
                    description="Total CRM leads"
                />

                <MetricCard
                    title="Total Deals"
                    value={pipelineSummary?.totalDeals}
                    description="Total CRM deals"
                />

                <MetricCard
                    title="Open Deals"
                    value={pipelineSummary?.openDeals}
                    description="Deals currently in pipeline"
                />

                <MetricCard
                    title="Pipeline Value"
                    value={`₹${pipelineSummary?.totalPipelineValue?.toLocaleString()}`}
                    description="Total pipeline value"
                />

                <MetricCard
                    title="Win Rate"
                    value={`${pipelineSummary?.winRate}%`}
                    description="Closed deal conversion rate"
                />
            </div>

            <PipelineFunnel
                stages={pipelineSummary?.stages}
            />

            <h2>Performance</h2>

            <PerformanceChart
                data={performanceReport?.data || []}
            />

            <ReportExport
                data={performanceReport?.data || []}
            />

            <AIAssistantPanel contactId={1} />
        </div>
    );
};

export default Dashboard;