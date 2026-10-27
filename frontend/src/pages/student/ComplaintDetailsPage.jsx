import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { departmentService } from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";
import { fireConfetti } from "../../lib/confetti";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Star,
  Loader2,
  ImageIcon,
  ExternalLink,
  Copy,
  Check,
  X,
  Maximize2,
} from "lucide-react";

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const { user, token, isAdmin, isDeptStaff } = useAuth();
  const { success, error: toastError } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  // Modals & Action States
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
      setError(err.response?.data?.detail || "Failed to load grievance details.");
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

  const copyTicketId = () => {
    if (!complaint?.complaint_number) return;
    navigator.clipboard.writeText(complaint.complaint_number);
    setCopiedId(true);
    success("Tracking ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Admin department assignment
  const handleAssignDepartment = async () => {
    if (!selectedDeptId) return;
    setSubmittingAction(true);
    try {
      await complaintService.assignDepartment(id, selectedDeptId);
      success("Department assigned successfully.");
      await fetchDetails();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to assign department.";
      toastError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle status transition
  const handleStatusTransitionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await complaintService.updateStatus(id, targetStatus, statusNotes);
      setShowStatusModal(false);
      setStatusNotes("");
      if (targetStatus === "RESOLVED") {
        fireConfetti();
        success("Grievance officially marked RESOLVED! Student unlocked for feedback.");
      } else {
        success(`Status successfully transitioned to ${targetStatus}.`);
      }
      await fetchDetails();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update status.";
      toastError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await complaintService.submitFeedback(id, feedbackRating, feedbackComments);
      fireConfetti();
      success("Thank you! Your resolution feedback was recorded.");
      await fetchDetails();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to submit feedback.";
      toastError(msg);
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
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Retrieving grievance details & audit trail...
        </p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="p-10 max-w-md mx-auto text-center space-y-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm mt-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === complaint.submitted_by_id;
  const isAssignedStaff = isDeptStaff && user?.department_id === complaint.department_id;
  const canUpdateStatus = isAdmin || isAssignedStaff;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to={isAdmin ? "/admin/complaints" : isDeptStaff ? "/dept" : "/student"}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Grievance Queue
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={copyTicketId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-sm transition-all"
            title="Copy Tracking ID"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{complaint.complaint_number}</span>
          </button>
        </div>
      </div>

      {/* Main Grievance Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-md">
                {complaint.complaint_number}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {complaint.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap font-medium">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Submitted by: <strong className="text-slate-800">{complaint.submitted_by?.full_name}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-right shrink-0">
            <p className="text-slate-400 uppercase font-black text-[10px] tracking-wider">
              Responsible Department
            </p>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5">
              {complaint.department?.name || "Unassigned (Pending Triage)"}
            </p>
          </div>
        </div>

        {/* Two-Column Responsive Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left Column (Narrative, Attachments, Gemini AI) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detailed Description */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Grievance Description & Location
              </h3>
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                {complaint.description}
              </p>
            </div>

            {/* Photo Evidence Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  Attached Photo Evidence ({complaint.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {complaint.attachments.map((att) => {
                    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
                    const imageUrl = `${apiBase}/complaints/${complaint.id}/attachments/${att.id}/file?token=${encodeURIComponent(token)}`;
                    const sizeKb = Math.round(att.file_size_bytes / 1024);
                    return (
                      <div
                        key={att.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 group"
                      >
                        <button
                          type="button"
                          onClick={() => setZoomImage(imageUrl)}
                          className="block shrink-0 relative overflow-hidden rounded-xl border border-slate-200"
                        >
                          <img
                            src={imageUrl}
                            alt={att.file_name}
                            className="w-16 h-16 object-cover group-hover:scale-105 transition-transform bg-slate-100"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate" title={att.file_name}>
                            {att.file_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {sizeKb} KB • {att.file_type}
                          </p>
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-1"
                          >
                            View Raw Photo
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gemini AI Triage Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-violet-50/70 to-purple-50/50 border border-indigo-100/90 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Gemini 1.5 Flash AI Triage Analysis
                </div>
                {complaint.ai_confidence_score && (
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-white/90 px-2 py-0.5 rounded-full border border-indigo-200 shadow-sm">
                    AI Confidence: {Math.round(complaint.ai_confidence_score * 100)}%
                  </span>
                )}
              </div>

              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {complaint.ai_summary || "Automated intake summary generated during initial filing."}
              </p>

              {complaint.ai_suggested_category && (
                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
                  <span>
                    Suggested Category: <strong className="text-slate-900">{complaint.ai_suggested_category}</strong>
                  </span>
                  {complaint.ai_suggested_department && (
                    <span>
                      • Suggested Dept: <strong className="text-indigo-800">{complaint.ai_suggested_department.name}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Student Resolution Feedback Card */}
            {complaint.status === "RESOLVED" && (
              <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Student Satisfaction Rating
                </h3>

                {complaint.feedback ? (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1.5">
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
                      <span className="text-xs font-bold text-amber-950 ml-2">
                        {complaint.feedback.rating} / 5 Stars
                      </span>
                    </div>
                    {complaint.feedback.comments && (
                      <p className="text-xs text-slate-700 italic font-medium">
                        "{complaint.feedback.comments}"
                      </p>
                    )}
                  </div>
                ) : isOwner ? (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <p className="text-xs text-slate-600 font-medium">
                      This grievance has been resolved! Please rate your satisfaction with the resolution quality:
                    </p>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFeedbackRating(num)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              num <= feedbackRating
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-300 hover:text-amber-400"
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
                      placeholder="Optional feedback on department turnaround and work quality..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />

                    <button
                      type="submit"
                      disabled={submittingAction}
                      className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5"
                    >
                      {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Submit Feedback
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Awaiting resolution feedback from student.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Audit Trail & Admin/Staff Actions) */}
          <div className="space-y-6">
            {/* Admin / Staff State Machine Action Controls */}
            {canUpdateStatus && complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  State Machine Actions
                </h3>

                {/* Admin Department Assign Dropdown */}
                {isAdmin && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Assign Department
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                        className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* Transition Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {complaint.status === "SUBMITTED" && (
                    <button
                      onClick={() => openStatusModal("IN_PROGRESS")}
                      disabled={!complaint.department_id}
                      title={!complaint.department_id ? "Assign department first" : ""}
                      className="w-full py-2.5 px-3 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Mark In Progress
                    </button>
                  )}

                  {complaint.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => openStatusModal("RESOLVED")}
                      className="w-full py-2.5 px-3 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve Grievance
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => openStatusModal("REJECTED")}
                      className="w-full py-2 px-3 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Reject Grievance
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Vertical Audit Trail */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Audit Trail & History
              </h3>

              <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {complaint.status_history?.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-600 ring-2 ring-white" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          {entry.new_status}
                        </span>
                        {entry.old_status && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            (from {entry.old_status})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        By: <strong className="text-slate-800">{entry.changed_by?.full_name || "System Intake"}</strong>
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-1 font-normal leading-relaxed">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Transition Notes Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900">
              Confirm Status Transition to {targetStatus}
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
                      ? "Explain what actions were completed to solve the issue..."
                      : targetStatus === "REJECTED"
                      ? "Specify policy reason, duplication, or lack of evidence..."
                      : "Add progress or inspection notes..."
                  }
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImage}
              alt="Zoomed Evidence"
              className="max-h-[85vh] w-auto rounded-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
