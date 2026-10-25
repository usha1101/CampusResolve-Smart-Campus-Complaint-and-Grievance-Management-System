import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import {
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Inbox,
  Loader2,
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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-blue-100 uppercase tracking-wider inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {user?.department?.name || "Department Workspace"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Assigned Grievance Queue
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Investigate reported campus issues, log progress notes, and execute verified resolutions.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
            <Inbox className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total in Queue</p>
            <p className="text-2xl font-black text-slate-900">{complaints.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-blue-700">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500">In Progress</p>
            <p className="text-2xl font-black text-blue-600">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center font-bold text-emerald-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Resolved</p>
            <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Filter Queue by Status
        </span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted (Pending Inspection)</option>
          <option value="IN_PROGRESS">In Progress (Active)</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Queue Listing */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading department queue...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Department Queue is Clear</h3>
            <p className="text-xs text-slate-500">No active grievances assigned to your department.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <Link
                key={c.id}
                to={`/complaints/${c.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group block"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {c.complaint_number}
                    </span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-slate-500">
                      Filed by: <strong className="text-slate-800">{c.submitted_by?.full_name}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {c.title}
                  </h3>

                  {c.ai_summary && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {c.ai_summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="text-xs text-slate-400">
                    <p>{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
