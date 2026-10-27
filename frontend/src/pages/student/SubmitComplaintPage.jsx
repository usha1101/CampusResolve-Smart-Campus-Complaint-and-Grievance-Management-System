import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import { useToast } from "../../components/common/Toast";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  UploadCloud,
  FileCheck2,
  X,
  Wifi,
  Wrench,
  Zap,
  Home,
  GraduationCap,
  Tv,
  Trash2,
  HelpCircle,
  Flame,
  CheckCircle2,
} from "lucide-react";

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category: "Facilities & Infrastructure",
    priority: "MEDIUM",
    description: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { label: "Facilities & Infrastructure", icon: Wrench },
    { label: "Internet / Connectivity", icon: Wifi },
    { label: "Electrical & Power", icon: Zap },
    { label: "Hostel Residential Affairs", icon: Home },
    { label: "Academic & Examinations", icon: GraduationCap },
    { label: "Classroom AV & Equipment", icon: Tv },
    { label: "Sanitation & Cleanliness", icon: Trash2 },
    { label: "Other Campus Grievance", icon: HelpCircle },
  ];

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (catLabel) => {
    setFormData((prev) => ({ ...prev, category: catLabel }));
  };

  const handlePrioritySelect = (prio) => {
    setFormData((prev) => ({ ...prev, priority: prio }));
  };

  const handleImageSelect = (file) => {
    setFileError("");
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setFileError("Invalid file type. Please upload a JPEG, PNG, or WebP photo.");
      return;
    }

    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(`Selected photo is ${sizeMB} MB, exceeding the 5 MB maximum limit.`);
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleImageSelect(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await complaintService.submitComplaint(formData, selectedImage);
      success("Grievance submitted! Gemini AI triage completed.");
      navigate(`/complaints/${response.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to submit grievance. Please review required fields.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/student"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Grievances
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-7">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Submit a Campus Grievance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            File maintenance, electrical, IT, or facility requests. Google Gemini AI will automatically categorize and summarize your ticket for rapid department triage.
          </p>
        </div>

        {/* AI Helper Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/60 border border-indigo-100 flex items-start gap-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="font-extrabold text-indigo-950">Automated Gemini AI Triage Enabled</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Upon submission, Google Gemini 1.5 Flash extracts a concise executive summary and maps the optimal campus department to guarantee quick SLA turnarounds.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Grievance Headline / Title
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Defective projector in Lecture Hall 301"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Interactive Category Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Issue Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleCategorySelect(cat.label)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500/80 text-indigo-950 shadow-sm ring-1 ring-indigo-500/30"
                        : "bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className="text-[11px] font-bold leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Segmented Control */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Perceived Urgency / Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "LOW", label: "Low", desc: "Cosmetic" },
                { value: "MEDIUM", label: "Medium", desc: "Routine fix" },
                { value: "HIGH", label: "High", desc: "Disruptive" },
                { value: "URGENT", label: "Urgent", desc: "Hazard" },
              ].map((prio) => {
                const isSelected = formData.priority === prio.value;
                return (
                  <button
                    key={prio.value}
                    type="button"
                    onClick={() => handlePrioritySelect(prio.value)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? prio.value === "URGENT"
                          ? "bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-500/40"
                          : prio.value === "HIGH"
                          ? "bg-orange-50 border-orange-500 text-orange-950 font-bold ring-1 ring-orange-500/40"
                          : "bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-1 ring-indigo-500/40"
                        : "bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {prio.value === "URGENT" && <Flame className="w-3.5 h-3.5 text-rose-600" />}
                      <span className="text-xs font-extrabold">{prio.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{prio.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Specific Location & Details
            </label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="State the exact campus building, room number, equipment model, and what went wrong..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all leading-relaxed"
            />
          </div>

          {/* Photo Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Photo Evidence <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">JPEG, PNG, WebP up to 5 MB</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              id="photo-evidence-input"
            />

            {!imagePreview ? (
              <label
                htmlFor="photo-evidence-input"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl cursor-pointer bg-slate-50/40 hover:bg-indigo-50/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                  Click to attach photo or drag and drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visual proof helps maintenance & IT dispatch appropriate technicians
                </p>
              </label>
            ) : (
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedImage?.name}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      {(selectedImage?.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini AI Triage & Submitting Ticket...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
