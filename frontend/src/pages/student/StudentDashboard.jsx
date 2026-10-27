import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { ListSkeleton } from "../../components/common/Skeleton";
import {
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  FileText,
  ChevronRight,
  Sparkles,
  Building2,
  Layers,
  X,
} from "lucide-react";

export function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setComplaints(data.items || []);
    } catch (err) {
      console.error("Failed to load grievances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearSearch = () => {
    setSearch("");
    complaintService.getMyComplaints({ status: statusFilter || undefined }).then((data) => {
      setComplaints(data.items || []);
    });
  };

  // Metrics
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
  const submittedCount = complaints.filter((c) => c.status === "SUBMITTED").length;

  return (
    <div className="space-y-7">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Decorative Circle */}
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/15 backdrop-blur-md text-indigo-200 uppercase tracking-wider inline-flex items-center gap-1.5 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Student Grievance Portal
            </span>
            <span className="text-xs text-indigo-200 font-medium hidden sm:inline">
              Welcome, {user?.full_name?.split(" ")[0] || "Student"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            My Campus Grievances
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm font-normal max-w-xl leading-relaxed">
            Submit issues with photo evidence, monitor real-time department investigations, and score turnaround satisfaction.
          </p>
        </div>

        <Link
          to="/student/submit"
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-[0.98] transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          Submit New Grievance
        </Link>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Filed</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">All personal tickets</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Pending Triage</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{submittedCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Under admin review</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">In Progress</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inProgressCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Active investigations</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Resolved</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Feedback unlocked</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, keywords..."
            className="w-full pl-9 pr-8 py-2 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Tabbed Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 text-xs w-full md:w-auto overflow-x-auto">
          {[
            { label: "All", value: "" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Submitted", value: "SUBMITTED" },
            { label: "Resolved", value: "RESOLVED" },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grievances List */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No grievances found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter
                ? "No grievances match your current search and filter criteria."
                : "You haven't submitted any campus grievances yet. Report any maintenance, IT, or facility issues."}
            </p>
          </div>
          <Link
            to="/student/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            File Your First Grievance
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {complaints.map((item) => (
            <Link
              key={item.id}
              to={`/complaints/${item.id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all group block"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                    {item.complaint_number}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                  <PriorityBadge priority={item.priority} size="sm" />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-700 font-semibold">
                      {item.department?.name || "Pending Triage"}
                    </strong>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {item.title}
                </h4>

                {item.ai_summary && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{item.ai_summary}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                  <p>Filed</p>
                  <p className="font-semibold text-slate-700">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
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
