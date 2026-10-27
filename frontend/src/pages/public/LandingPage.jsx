import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FileCheck2,
  Clock,
  Star,
  Zap,
  ExternalLink,
  Loader2,
} from "lucide-react";

export function LandingPage() {
  const { user, login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState("");

  const handleQuickDemoLogin = async (email, pass, targetRoute, roleLabel) => {
    setDemoLoading(roleLabel);
    try {
      await login(email, pass);
      success(`Signed in as ${roleLabel}! Redirecting...`);
      navigate(targetRoute);
    } catch (err) {
      error("Unable to authenticate demo account. Please try again.");
    } finally {
      setDemoLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Decorative Background Mesh Glows */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-40 right-10 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Apple-Style Navbar */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4">
        <div className="apple-glass rounded-full px-5 py-3 flex items-center justify-between shadow-lg shadow-slate-900/5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              CampusResolve
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#triage" className="hover:text-indigo-600 transition-colors">Gemini AI Triage</a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">Live 1-Click Demo</a>
            <a href="#metrics" className="hover:text-indigo-600 transition-colors">SLA Analytics</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                to={user.role === "ADMIN" ? "/admin" : user.role === "DEPT_STAFF" ? "/dept" : "/student"}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-sm shadow-indigo-500/5 text-xs font-bold text-indigo-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Next-Gen Smart Campus Grievance Redressal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse ml-1" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
          Campus Grievances, Resolved with{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-900 bg-clip-text text-transparent">
            Intelligent Precision.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          An AI-augmented enterprise grievance management system built with Google Gemini 1.5 Flash.
          Empowers students, resolution staff, and campus leadership with automated triage, immutable SLA audit trails, and verified resolutions.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to={user ? "/student/submit" : "/login"}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Submit a Campus Grievance
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-700 bg-white/90 hover:bg-white border border-slate-200/80 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            1-Click Live Role Demo
          </a>
        </div>

        {/* Quick Demo Selector directly in Hero */}
        <div id="demo" className="pt-8">
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
              <span>Instant Evaluator Access (1-Click Switcher)</span>
              <span className="text-indigo-600 font-semibold">No typing required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickDemoLogin("admin@campus.edu", "AdminPass123!", "/admin", "Administrator")}
                disabled={!!demoLoading}
                className="p-3 rounded-2xl border border-purple-200/80 bg-purple-50/60 hover:bg-purple-100/70 transition-all text-left flex items-center gap-3 disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  {demoLoading === "Administrator" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-purple-950 group-hover:text-purple-700">Administrator</p>
                  <p className="text-[10px] text-purple-600 font-medium truncate">SLA & All Grievances</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("it.staff@campus.edu", "StaffPass123!", "/dept", "IT Staff")}
                disabled={!!demoLoading}
                className="p-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-100/70 transition-all text-left flex items-center gap-3 disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  {demoLoading === "IT Staff" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-950 group-hover:text-indigo-700">IT Staff Lead</p>
                  <p className="text-[10px] text-indigo-600 font-medium truncate">Assigned Queue & Fix</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("student@campus.edu", "StudentPass123!", "/student", "Student")}
                disabled={!!demoLoading}
                className="p-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-100/70 transition-all text-left flex items-center gap-3 disabled:opacity-50 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  {demoLoading === "Student" ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700">Student Member</p>
                  <p className="text-[10px] text-emerald-600 font-medium truncate">Intake, Track & Rate</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Performance Metrics Strip */}
      <section id="metrics" className="border-y border-slate-200/80 bg-white/60 backdrop-blur-md py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-black text-indigo-600">100%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Audit Traceability</p>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">&lt; 24h</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Target Resolution SLA</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600">Gemini 1.5</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Automated Triage AI</p>
          </div>
          <div>
            <p className="text-3xl font-black text-violet-600">Zero</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Lost Grievances</p>
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
            Engineered for Modern Universities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Enterprise Architecture. Apple-Caliber Simplicity.
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Everything students, departments, and administrators need to manage grievances with total transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Triage (Wide) */}
          <div id="triage" className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-4 max-w-md">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Google Gemini 1.5 Flash
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Intelligent Automated Triage & Department Routing
              </h3>
              <p className="text-sm text-indigo-200/90 leading-relaxed font-normal">
                Every grievance filed is processed by Google Gemini in the background to extract root-cause summaries, match the optimal campus department, and assign confidence scores.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs font-bold text-white">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-Categorization</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Department Suggestion</span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 md:absolute -right-6 -bottom-6 w-72 bg-white/10 backdrop-blur-xl border border-white/15 p-5 rounded-2xl shadow-2xl text-xs space-y-2">
              <div className="flex items-center justify-between text-indigo-200 text-[10px] font-bold uppercase">
                <span>AI Output Sample</span>
                <span className="text-emerald-400">96% Confidence</span>
              </div>
              <p className="text-white font-medium">
                "Defective router in Hostel Block B reported. Assigned to IT Services for firmware reboot."
              </p>
            </div>
          </div>

          {/* Card 2: Finite State Machine */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Rigid State Machine & SLA Timeline
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforced transitions: `SUBMITTED` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`. Requires mandatory notes for rejection and resolution to guarantee administrative accountability.
            </p>
          </div>

          {/* Card 3: Evidence Pipeline */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Token-Authenticated Evidence Pipeline
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload photos with client-side file checks (JPEG, PNG, WebP up to 5 MB). Object-level permissions ensure only authorized students and staff view sensitive attachments.
            </p>
          </div>

          {/* Card 4: Verified Student Feedback */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Closed-Loop Student Feedback
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once a ticket is marked Resolved by the department, the student unlocks an interactive 1–5 star rating with remarks to score resolution turnaround.
            </p>
          </div>

          {/* Card 5: Executive SLA Analytics */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Departmental Turnaround Analytics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Campus deans and admins gain executive visibility into mean resolution hours, active case volumes, and category bottlenecks across all campus departments.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-xl py-12 px-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-900">CampusResolve</span>
            <span className="text-slate-400">• Built for Smart Campus Innovation</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
              Swagger API Docs <ExternalLink className="w-3 h-3" />
            </a>
            <a href="http://localhost:8000/health" target="_blank" rel="noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
              Health Status <ExternalLink className="w-3 h-3" />
            </a>
            <Link to="/login" className="hover:text-indigo-600">Portal Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
