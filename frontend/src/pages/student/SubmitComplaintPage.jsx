import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { complaintService } from "../../services/complaintService";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  X,
  FileCheck2,
} from "lucide-react";

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
    "Facilities & Infrastructure",
    "Internet / Connectivity",
    "Electrical & Power",
    "Hostel Residential Affairs",
    "Academic & Examinations",
    "Classroom AV & Equipment",
    "Sanitation & Cleanliness",
    "Other Campus Grievance",
  ];

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      navigate(`/complaints/${response.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit complaint. Please check your fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Grievances
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Submit a Campus Grievance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide details about the issue. Our AI-assisted backend will generate a concise triage summary and suggest the responsible department.
          </p>
        </div>

        {/* AI Helper Banner */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-indigo-900">AI-Assisted Triage Enabled</p>
            <p className="text-indigo-700/90 leading-relaxed">
              Google Gemini 1.5 Flash will automatically categorize your request and prepare an executive summary for campus triage staff upon submission.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Grievance Title
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Broken AC unit in Library 2nd Floor Study Room"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Perceived Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm bg-white"
              >
                <option value="LOW">Low (Minor cosmetic issue)</option>
                <option value="MEDIUM">Medium (Normal standard maintenance)</option>
                <option value="HIGH">High (Disrupts daily classes or living)</option>
                <option value="URGENT">Urgent (Safety or campus emergency hazard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Detailed Description & Location
            </label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Specify exact building, room number, equipment model, and what went wrong..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm leading-relaxed"
            />
          </div>

          {/* Optional Photo Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Upload Photo (Optional)
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                Optional evidence • JPEG, PNG, or WebP up to 5 MB
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              id="photo-upload-input"
            />

            {!imagePreview ? (
              <label
                htmlFor="photo-upload-input"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 mb-2 transition-colors">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">
                  Click to select photo or drag and drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Attach an image of physical damage, broken equipment, or leaks (Optional)
                </p>
              </label>
            ) : (
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={imagePreview}
                    alt="Evidence Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedImage?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      {(selectedImage?.size / (1024 * 1024)).toFixed(2)} MB • Ready to attach
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Gemini AI Triage & Submitting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
