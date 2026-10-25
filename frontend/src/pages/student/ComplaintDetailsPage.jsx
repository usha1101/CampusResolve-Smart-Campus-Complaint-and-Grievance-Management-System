import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { departmentService } from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Star,
  Loader2,
  Send,
  Shield,
  FileCheck,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const { user, token, isAdmin, isDeptStaff, isStudent } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modals / Input states
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await complaintService.getComplaintDetails(id);
      setComplaint(data);
      if (data.department_id) {
        setSelectedDeptId(data.department_id);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    if (isAdmin) {
      departmentService.getDepartments().then(setDepartments).catch(console.error);
    }
  }, [id, isAdmin]);

  // Handle Admin department assignment
  const handleAssignDepartment = async () => {
    if (!selectedDeptId) return;
    setSubmittingAction(true);
    setError("");
    try {
      await complaintService.assignDepartment(id, selectedDeptId);
      setActionSuccess("Department assigned successfully.");
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to assign department.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle status transition
  const handleStatusTransitionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setError("");
    try {
      await complaintService.updateStatus(id, targetStatus, statusNotes);
      setShowStatusModal(false);
      setStatusNotes("");
      setActionSuccess(`Status transitioned to ${targetStatus}.`);
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update status.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setError("");
    try {
      await complaintService.submitFeedback(id, feedbackRating, feedbackComments);
      setActionSuccess("Thank you! Feedback recorded.");
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit feedback.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const openStatusModal = (status) => {
    setTargetStatus(status);
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Retrieving grievance details & audit trail...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to View Grievance</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === complaint.submitted_by_id;
  const isAssignedStaff = isDeptStaff && user?.department_id === complaint.department_id;
  const canUpdateStatus = isAdmin || isAssignedStaff;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to={isAdmin ? "/admin/complaints" : isDeptStaff ? "/dept" : "/student"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Complaint Queue
      </Link>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess("")} className="text-xs font-bold text-emerald-700">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs font-bold text-rose-700">Dismiss</button>
        </div>
      )}

      {/* Main Grievance Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-md">
                {complaint.complaint_number}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {complaint.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Submitted by: <strong className="text-slate-700">{complaint.submitted_by?.full_name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-right shrink-0">
            <p className="text-slate-400 uppercase font-bold text-[10px]">Responsible Department</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">
              {complaint.department?.name || "Unassigned"}
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Issue Description
          </h3>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Attached Photo Evidence */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              Attached Photo Evidence ({complaint.attachments.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complaint.attachments.map((att) => {
                const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
                const imageUrl = `${apiBase}/complaints/${complaint.id}/attachments/${att.id}/file?token=${encodeURIComponent(token)}`;
                const sizeKb = Math.round(att.file_size_bytes / 1024);
                return (
                  <div
                    key={att.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5"
                  >
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block shrink-0 group relative overflow-hidden rounded-lg"
                    >
                      <img
                        src={imageUrl}
                        alt={att.file_name}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 group-hover:scale-105 transition-transform bg-slate-100"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </a>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate" title={att.file_name}>
                        {att.file_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sizeKb} KB • {att.file_type}
                      </p>
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 mt-1"
                      >
                        View Full Photo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Triage Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Gemini AI Triage Analysis
            </div>
            {complaint.ai_confidence_score && (
              <span className="text-[11px] font-bold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200">
                AI Confidence: {Math.round(complaint.ai_confidence_score * 100)}%
              </span>
            )}
          </div>

          <p className="text-xs text-indigo-950 font-medium leading-relaxed">
            {complaint.ai_summary || "Automated summary generated during intake."}
          </p>

          {complaint.ai_suggested_category && (
            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-600">
              <span>Suggested Category: <strong className="text-slate-800">{complaint.ai_suggested_category}</strong></span>
              {complaint.ai_suggested_department && (
                <span>• Suggested Dept: <strong className="text-indigo-800">{complaint.ai_suggested_department.name}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Admin / Staff Workflow Controls */}
        {canUpdateStatus && complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department Operations & State Machine Actions
            </h3>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Admin Department Assign Dropdown */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignDepartment}
                    disabled={submittingAction || !selectedDeptId}
                    className="px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              )}

              {/* Status Machine Buttons */}
              {complaint.status === "SUBMITTED" && (
                <button
                  onClick={() => openStatusModal("IN_PROGRESS")}
                  disabled={!complaint.department_id}
                  title={!complaint.department_id ? "Assign department first" : ""}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 disabled:opacity-40"
                >
                  Mark In Progress
                </button>
              )}

              {complaint.status === "IN_PROGRESS" && (
                <button
                  onClick={() => openStatusModal("RESOLVED")}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-500/20"
                >
                  Resolve Grievance
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => openStatusModal("REJECTED")}
                  className="px-4 py-2 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100"
                >
                  Reject Grievance
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audit History Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Status History & Audit Trail
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {complaint.status_history?.map((entry) => (
            <div key={entry.id} className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">
                    {entry.new_status}
                  </span>
                  {entry.old_status && (
                    <span className="text-xs text-slate-400">
                      (from {entry.old_status})
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    • {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Actioned by: <strong>{entry.changed_by?.full_name || "System"}</strong>
                </p>
                {entry.notes && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-1">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Resolution Feedback Section */}
      {complaint.status === "RESOLVED" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Student Resolution Feedback
          </h2>

          {complaint.feedback ? (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= complaint.feedback.rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-300"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-amber-900 ml-2">
                  {complaint.feedback.rating} / 5 Stars
                </span>
              </div>
              {complaint.feedback.comments && (
                <p className="text-xs text-slate-700 italic">
                  "{complaint.feedback.comments}"
                </p>
              )}
            </div>
          ) : isOwner ? (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                This grievance has been resolved. Please rate your satisfaction with the department's turnaround and solution:
              </p>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFeedbackRating(num)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        num <= feedbackRating
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {feedbackRating} Star{feedbackRating > 1 ? "s" : ""}
                </span>
              </div>

              <textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                rows={2}
                placeholder="Optional remarks on resolution quality..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              <button
                type="submit"
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                Submit Feedback
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No feedback submitted by the student yet.
            </p>
          )}
        </div>
      )}

      {/* State Transition Notes Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Transition to {targetStatus}
            </h3>

            <form onSubmit={handleStatusTransitionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {targetStatus === "RESOLVED"
                    ? "Resolution Notes (Mandatory)"
                    : targetStatus === "REJECTED"
                    ? "Rejection Reason (Mandatory)"
                    : "Progress Notes (Optional)"}
                </label>
                <textarea
                  required={targetStatus === "RESOLVED" || targetStatus === "REJECTED"}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={4}
                  placeholder={
                    targetStatus === "RESOLVED"
                      ? "Explain what actions were taken to fix the issue..."
                      : targetStatus === "REJECTED"
                      ? "Specify policy violation, duplication, or lack of evidence..."
                      : "Add status notes..."
                  }
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
