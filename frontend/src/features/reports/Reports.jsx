import { useEffect, useState } from "react";

import {
    getPipelineSummary,
    getPerformance,
} from "../../api/reports";

import ReportExport from "./ReportExport";

function Reports() {
    const [range, setRange] = useState("30d");

    const [pipelineSummary, setPipelineSummary] =
        useState(null);

    const [performanceReport, setPerformanceReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadReports() {
            setLoading(true);
            setError("");

            try {
                const [
                    pipelineResponse,
                    performanceResponse,
                ] = await Promise.all([
                    getPipelineSummary(),
                    getPerformance(range),
                ]);

                if (cancelled) {
                    return;
                }

                setPipelineSummary(
                    pipelineResponse?.data || null
                );

                setPerformanceReport(
                    performanceResponse?.data || null
                );
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError?.message ||
                        "Failed to load reports"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadReports();

        return () => {
            cancelled = true;
        };
    }, [range]);

    if (loading) {
        return (
            <div className="grid min-h-[400px] place-items-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
                    Loading reports...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h1 className="text-lg font-semibold text-red-700">
                    Unable to load reports
                </h1>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    const stages =
        pipelineSummary?.stages || [];

    const performanceData =
        performanceReport?.data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="text-sm font-medium text-indigo-600">
                        Sales Intelligence
                    </div>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Reports
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Review pipeline and sales performance reports.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                        {[
                            ["7d", "7 Days"],
                            ["30d", "30 Days"],
                            ["90d", "90 Days"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    setRange(value)
                                }
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${range === value
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <ReportExport
                        performanceData={
                            performanceData
                        }
                    />
                </div>
            </div>

            {/* Summary metrics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">
                        Total Leads
                    </div>

                    <div className="mt-3 text-2xl font-bold text-slate-900">
                        {performanceReport?.totalLeads ??
                            0}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">
                        Total Deals
                    </div>

                    <div className="mt-3 text-2xl font-bold text-slate-900">
                        {pipelineSummary?.totalDeals ??
                            0}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">
                        Pipeline Value
                    </div>

                    <div className="mt-3 text-2xl font-bold text-slate-900">
                        ₹
                        {Number(
                            pipelineSummary?.totalPipelineValue
                        ).toLocaleString("en-IN")}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">
                        Win Rate
                    </div>

                    <div className="mt-3 text-2xl font-bold text-slate-900">
                        {pipelineSummary?.winRate ??
                            0}
                        %
                    </div>
                </div>
            </div>

            {/* Pipeline report */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Pipeline Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Deal distribution by pipeline stage.
                </p>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                                <th className="pb-3 font-semibold">
                                    Stage
                                </th>

                                <th className="pb-3 text-right font-semibold">
                                    Deals
                                </th>

                                <th className="pb-3 text-right font-semibold">
                                    Value
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {stages.map((stage) => (
                                <tr
                                    key={stage.stage}
                                    className="border-b border-slate-100 last:border-0"
                                >
                                    <td className="py-4 text-sm font-medium capitalize text-slate-700">
                                        {stage.stage}
                                    </td>

                                    <td className="py-4 text-right text-sm text-slate-600">
                                        {stage.count}
                                    </td>

                                    <td className="py-4 text-right text-sm font-semibold text-slate-900">
                                        ₹
                                        {Number(
                                            stage.value
                                        ).toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            ))}

                            {!stages.length && (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="py-8 text-center text-sm text-slate-500"
                                    >
                                        No pipeline data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance report */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    Performance Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Monthly deal and revenue performance.
                </p>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                                <th className="pb-3 font-semibold">
                                    Month
                                </th>

                                <th className="pb-3 text-right font-semibold">
                                    Deals
                                </th>

                                <th className="pb-3 text-right font-semibold">
                                    Won Deals
                                </th>

                                <th className="pb-3 text-right font-semibold">
                                    Revenue
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {performanceData.map((item) => (
                                <tr
                                    key={item.month}
                                    className="border-b border-slate-100 last:border-0"
                                >
                                    <td className="py-4 text-sm font-medium text-slate-700">
                                        {item.month}
                                    </td>

                                    <td className="py-4 text-right text-sm text-slate-600">
                                        {item.deals}
                                    </td>

                                    <td className="py-4 text-right text-sm text-slate-600">
                                        {item.wonDeals}
                                    </td>

                                    <td className="py-4 text-right text-sm font-semibold text-slate-900">
                                        ₹
                                        {Number(
                                            item.revenue
                                        ).toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            ))}

                            {!performanceData.length && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="py-8 text-center text-sm text-slate-500"
                                    >
                                        No performance data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reports;