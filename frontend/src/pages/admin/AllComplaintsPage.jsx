import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { departmentService } from "../../services/departmentService";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { ListSkeleton } from "../../components/common/Skeleton";
import {
  Search,
  Building2,
  ChevronRight,
  Sparkles,
  FileText,
  RotateCcw,
} from "lucide-react";

export function AllComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, deptsRes] = await Promise.all([
        complaintService.getAllComplaints({
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          department_id: deptFilter || undefined,
        }),
        departmentService.getDepartments(),
      ]);
      setComplaints(complaintsRes.items || []);
      setDepartments(deptsRes || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setDeptFilter("");
  };

  const hasActiveFilters = search || statusFilter || priorityFilter || deptFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Grievance Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Cross-campus queue with real-time status filtering and Gemini AI triage suggestions.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, titles, or authors..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Severities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Department */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Master List */}
      {loading ? (
        <ListSkeleton count={5} />
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No grievances match criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try loosening your search keywords or resetting your active filters.
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
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-800 font-semibold">
                      {c.department?.name || "Unassigned"}
                    </strong>
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
                  <p className="font-bold text-slate-800">{c.submitted_by?.full_name}</p>
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
