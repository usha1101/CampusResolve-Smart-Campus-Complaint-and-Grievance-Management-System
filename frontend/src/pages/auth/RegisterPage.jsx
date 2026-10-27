import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { departmentService } from "../../services/departmentService";
import { useToast } from "../../components/common/Toast";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowLeft,
  User,
  Building2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export function RegisterPage() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "STUDENT_STAFF",
    department_id: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const data = await departmentService.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error("Could not fetch departments:", err);
      }
    }
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleValue) => {
    setFormData((prev) => ({
      ...prev,
      role: roleValue,
      department_id: roleValue === "DEPT_STAFF" ? prev.department_id : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        department_id: formData.role === "DEPT_STAFF" ? formData.department_id : null,
      };
      await register(payload);
      success("Account registered successfully! Please sign in.");
      navigate("/login?registered=true");
    } catch (err) {
      let message = "Registration failed. Please check your submission.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
        }
      } else if (err.message === "Network Error") {
        message = "Unable to connect to the backend server. The server may be waking up, please wait a moment and try again.";
      }
      setError(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Decorative Radial Backdrop Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Create Campus Account
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Join CampusResolve to file grievances and track resolutions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl shadow-slate-900/5 rounded-3xl border border-slate-200/80 sm:px-10 space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Sarah Connor"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Campus Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@campus.edu"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selector Tiles */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Your Campus Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT_STAFF")}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    formData.role === "STUDENT_STAFF"
                      ? "bg-indigo-50 border-indigo-500/80 text-indigo-950 font-bold shadow-sm"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] leading-tight">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("DEPT_STAFF")}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    formData.role === "DEPT_STAFF"
                      ? "bg-indigo-50 border-indigo-500/80 text-indigo-950 font-bold shadow-sm"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] leading-tight">Dept Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    formData.role === "ADMIN"
                      ? "bg-indigo-50 border-indigo-500/80 text-indigo-950 font-bold shadow-sm"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] leading-tight">Admin</span>
                </button>
              </div>
            </div>

            {/* Department Assignment Dropdown if DEPT_STAFF */}
            {formData.role === "DEPT_STAFF" && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-950">
                  Select Operating Department
                </label>
                <select
                  name="department_id"
                  required
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Choose department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Contact Phone <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0199"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 mt-4"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating Campus Account..." : "Complete Registration"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-2">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
              Sign In to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
