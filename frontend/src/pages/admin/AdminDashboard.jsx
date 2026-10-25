import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { analyticsService } from "../../services/analyticsService";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  Timer,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await analyticsService.getOverview();
        setData(res);
      } catch (err) {
        console.error("Failed to load analytics overview:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Calculating campus analytics and SLA performance...</p>
      </div>
    );
  }

  const {
    total_complaints = 0,
    status_breakdown = {},
    priority_breakdown = {},
    avg_resolution_hours = 0,
    departments_summary = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-purple-100 uppercase tracking-wider inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Oversight
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Campus Grievance & SLA Analytics
          </h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            Real-time monitoring of campus grievances, department turnaround SLAs, and AI categorization metrics.
          </p>
        </div>

        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-900 font-bold text-sm shadow-md hover:bg-purple-50 active:scale-[0.98] transition-all shrink-0"
        >
          <FileText className="w-4 h-4 text-purple-700" />
          View All Grievances
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Grievances</p>
          <p className="text-3xl font-black text-slate-900">{total_complaints}</p>
          <span className="text-[11px] text-slate-500">All departments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500">In Progress</p>
          <p className="text-3xl font-black text-blue-600">
            {status_breakdown["IN_PROGRESS"] || 0}
          </p>
          <span className="text-[11px] text-slate-500">Active investigations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Resolved</p>
          <p className="text-3xl font-black text-emerald-600">
            {status_breakdown["RESOLVED"] || 0}
          </p>
          <span className="text-[11px] text-slate-500">Successfully closed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Avg Resolution SLA</p>
          <p className="text-3xl font-black text-amber-600">
            {avg_resolution_hours ? `${avg_resolution_hours}h` : "N/A"}
          </p>
          <span className="text-[11px] text-slate-500">Mean time to resolve</span>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Status Distribution
          </h2>
          <div className="space-y-3">
            {Object.entries(status_breakdown).map(([status, count]) => {
              const pct = total_complaints > 0 ? Math.round((count / total_complaints) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === "RESOLVED"
                          ? "bg-emerald-500"
                          : status === "IN_PROGRESS"
                          ? "bg-blue-500"
                          : status === "REJECTED"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            Severity Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(priority_breakdown).map(([priority, count]) => {
              const pct = total_complaints > 0 ? Math.round((count / total_complaints) * 100) : 0;
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{priority}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        priority === "URGENT"
                          ? "bg-red-600"
                          : priority === "HIGH"
                          ? "bg-orange-500"
                          : priority === "MEDIUM"
                          ? "bg-blue-500"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Departmental Performance Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Departmental SLA & Volume Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Department</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Total Assigned</th>
                <th className="p-3.5">Open Tickets</th>
                <th className="p-3.5">Resolved</th>
                <th className="p-3.5 rounded-r-xl">Avg Resolution SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments_summary.map((d) => (
                <tr key={d.department_id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-bold text-slate-900">{d.department_name}</td>
                  <td className="p-3.5">
                    <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {d.department_code}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">{d.total_complaints}</td>
                  <td className="p-3.5 font-semibold text-blue-600">{d.open_complaints}</td>
                  <td className="p-3.5 font-semibold text-emerald-600">{d.resolved_complaints}</td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {d.avg_resolution_hours ? `${d.avg_resolution_hours} hours` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
