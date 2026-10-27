import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";
import {
  Sparkles,
  Shield,
  User,
  Building2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if session was expired
  const isSessionExpired = location.search.includes("session_expired=true");
  const isRegisteredSuccess = location.search.includes("registered=true");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      success(`Welcome back, ${data.user.full_name}!`);
      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (data.user.role === "DEPT_STAFF") {
        navigate("/dept");
      } else {
        navigate("/student");
      }
    } catch (err) {
      let message = "Invalid email or password. Please verify your credentials.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
        }
      } else if (err.message === "Network Error") {
        message = "Unable to connect to the backend server. If running in production, the server may be waking up; please retry in a moment.";
      }
      setError(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
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
          CampusResolve
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Smart AI-Assisted Campus Grievance Redressal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl shadow-slate-900/5 rounded-3xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Registration Notice */}
          {isRegisteredSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registration completed! Please sign in with your credentials.</span>
            </div>
          )}

          {/* Session Expiration Notice */}
          {isSessionExpired && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Campus Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Authenticating Session..." : "Sign In to Portal"}
            </button>
          </form>

          {/* 1-Click Demo Accounts for Judges & Evaluators */}
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                1-Click Demo Accounts
              </span>
              <span className="text-[10px] font-semibold text-indigo-600">Click to autofill</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@campus.edu", "AdminPass123!")}
                className="p-2 text-center rounded-2xl border border-purple-200/80 bg-purple-50/60 hover:bg-purple-100/80 text-purple-950 text-xs font-bold transition-all flex flex-col items-center gap-1 active:scale-95"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-[11px]">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("it.staff@campus.edu", "StaffPass123!")}
                className="p-2 text-center rounded-2xl border border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-950 text-xs font-bold transition-all flex flex-col items-center gap-1 active:scale-95"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px]">IT Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("student@campus.edu", "StudentPass123!")}
                className="p-2 text-center rounded-2xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-950 text-xs font-bold transition-all flex flex-col items-center gap-1 active:scale-95"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Student</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            Don't have a campus account?{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
