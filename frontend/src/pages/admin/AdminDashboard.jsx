import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { analyticsService } from "../../services/analyticsService";
import { CardSkeleton } from "../../components/common/Skeleton";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  Timer,
  ArrowRight,
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
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
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/15 backdrop-blur-md text-purple-200 uppercase tracking-wider inline-flex items-center gap-1.5 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            Executive Oversight Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Campus Grievance & SLA Analytics
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
            Real-time monitoring of campus grievances, department turnaround SLAs, and AI categorization metrics.
          </p>
        </div>

        <Link
          to="/admin/complaints"
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-950 font-extrabold text-xs shadow-lg shadow-black/10 hover:bg-purple-50 active:scale-[0.98] transition-all shrink-0"
        >
          <FileText className="w-4 h-4 text-purple-700" />
          Master Registry
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* 4 Bento KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Grievances</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{total_complaints}</p>
          <span className="text-[11px] text-slate-500 font-medium">All campus sectors</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">In Progress</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">
            {status_breakdown["IN_PROGRESS"] || 0}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Active investigations</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Resolved</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {status_breakdown["RESOLVED"] || 0}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Successfully closed</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Avg Resolution SLA</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Timer className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">
            {avg_resolution_hours ? `${avg_resolution_hours}h` : "N/A"}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Mean turnaround time</span>
        </div>
      </div>

      {/* Visual Breakdown Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              Status Pipeline Distribution
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Real-time counts</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(status_breakdown).map(([status, count]) => {
              const pct = total_complaints > 0 ? Math.round((count / total_complaints) * 100) : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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

        {/* Severity Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              Severity Breakdown
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Urgency allocation</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(priority_breakdown).map(([priority, count]) => {
              const pct = total_complaints > 0 ? Math.round((count / total_complaints) * 100) : 0;
              return (
                <div key={priority} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{priority}</span>
                    <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        priority === "URGENT"
                          ? "bg-rose-600"
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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Departmental SLA & Volume Breakdown
          </h2>
          <span className="text-xs text-slate-400 font-medium">Turnaround performance by team</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-2xl">Department</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Total Assigned</th>
                <th className="p-3.5">Open Tickets</th>
                <th className="p-3.5">Resolved</th>
                <th className="p-3.5 rounded-r-2xl">Avg Resolution SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments_summary.map((d) => (
                <tr key={d.department_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{d.department_name}</td>
                  <td className="p-3.5">
                    <span className="font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px] font-bold">
                      {d.department_code}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{d.total_complaints}</td>
                  <td className="p-3.5 font-bold text-blue-600">{d.open_complaints}</td>
                  <td className="p-3.5 font-bold text-emerald-600">{d.resolved_complaints}</td>
                  <td className="p-3.5 font-mono text-slate-600 font-semibold">
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
