import { useState } from "react";

import useDashboard from "./useDashboard";

import MetricCard from "./components/MetricCard";
import PipelineFunnel from "./components/PipelineFunnel";
import PerformanceChart from "./components/PerformanceChart";
import DashboardFilters from "./components/DashboardFilters";

function Dashboard() {
    const [range, setRange] = useState("30d");

    const {
        pipelineSummary,
        performanceReport,
        loading,
        error,
        refresh,
    } = useDashboard(range);

    if (loading) {
        return (
            <div className="grid min-h-[400px] place-items-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h2 className="text-lg font-semibold text-red-700">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={refresh}
                    className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const totalLeads =
        performanceReport?.totalLeads ?? 0;

    const totalDeals =
        pipelineSummary?.totalDeals ?? 0;

    const openDeals =
        pipelineSummary?.openDeals ?? 0;

    const pipelineValue =
        Number(
            pipelineSummary?.totalPipelineValue
        ) || 0;

    const winRate =
        Number(pipelineSummary?.winRate) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="text-sm font-medium text-indigo-600">
                        Sales Intelligence
                    </div>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor your leads, deals, pipeline, and sales performance.
                    </p>
                </div>

                <DashboardFilters
                    range={range}
                    onRangeChange={setRange}
                />
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                    title="Total Leads"
                    value={totalLeads}
                    description="Contacts assigned to you"
                />

                <MetricCard
                    title="Total Deals"
                    value={totalDeals}
                    description="Deals in your pipeline"
                />

                <MetricCard
                    title="Open Deals"
                    value={openDeals}
                    description="Currently active deals"
                />

                <MetricCard
                    title="Pipeline Value"
                    value={`₹${pipelineValue.toLocaleString(
                        "en-IN"
                    )}`}
                    description="Open pipeline value"
                />

                <MetricCard
                    title="Win Rate"
                    value={`${winRate}%`}
                    description="Closed deal conversion"
                />
            </div>

            {/* Pipeline */}
            <PipelineFunnel
                stages={
                    pipelineSummary?.stages || []
                }
            />

            {/* Performance */}
            <PerformanceChart
                data={
                    performanceReport?.data || []
                }
            />
        </div>
    );
}

export default Dashboard;