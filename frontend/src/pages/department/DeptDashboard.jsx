import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { ListSkeleton } from "../../components/common/Skeleton";
import {
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Inbox,
  User,
  Layers,
} from "lucide-react";

export function DeptDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getAssignedComplaints({
        status: statusFilter || undefined,
      });
      setComplaints(data.items || []);
    } catch (err) {
      console.error("Failed to load department queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [statusFilter]);

  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
  const submittedCount = complaints.filter((c) => c.status === "SUBMITTED").length;

  return (
    <div className="space-y-6">
      {/* Department Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/15 backdrop-blur-md text-blue-200 uppercase tracking-wider inline-flex items-center gap-1.5 border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            {user?.department?.name || "Operational Department Workspace"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Assigned Grievance Queue
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
            Investigate reported campus issues, document turnaround progress, and log verified resolution notes.
          </p>
        </div>

        <div className="relative z-10 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-right shrink-0">
          <span className="text-[10px] text-blue-200 font-extrabold uppercase tracking-wider block">
            Department Code
          </span>
          <span className="font-mono text-base font-black text-white">
            {user?.department?.code || "STAFF"}
          </span>
        </div>
      </div>

      {/* 3 Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total in Queue</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Inbox className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{complaints.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Assigned to your team</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">In Progress</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inProgressCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Active technician dispatch</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Resolved</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Verified solutions</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex justify-between items-center">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Filter Queue by Status
        </span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted (Pending Inspection)</option>
          <option value="IN_PROGRESS">In Progress (Active)</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Queue List */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">Department Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active campus grievances assigned to your department. Great work!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {complaints.map((c) => (
            <Link
              key={c.id}
              to={`/complaints/${c.id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all group block"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                    {c.complaint_number}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                  <PriorityBadge priority={c.priority} size="sm" />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Filed by: <strong className="text-slate-800 font-semibold">{c.submitted_by?.full_name}</strong>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {c.title}
                </h3>

                {c.ai_summary && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{c.ai_summary}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:text-right">
                <div className="text-[11px] text-slate-400">
                  <p>{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
