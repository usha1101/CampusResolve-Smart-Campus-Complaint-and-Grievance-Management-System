import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { ListSkeleton } from "../../components/common/Skeleton";
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  Building2,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  X,
} from "lucide-react";

export function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setComplaints(data.items || []);
    } catch (err) {
      console.error("Failed to load grievances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const sortedComplaints = [...complaints].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Grievance Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Full history of your reported campus tickets, status transitions, and resolution ratings.
          </p>
        </div>

        <Link
          to="/student/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Grievance
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or description..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Select */}
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

          {/* Priority Select */}
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

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : sortedComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No grievances match criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your active search keyword, status filter, or severity parameters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {sortedComplaints.map((item) => (
            <Link
              key={item.id}
              to={`/complaints/${item.id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all group block"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
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
