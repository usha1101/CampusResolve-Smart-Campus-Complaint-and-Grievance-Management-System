import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  BarChart3,
  Inbox,
  Sparkles,
  X,
} from "lucide-react";

export function DashboardLayout({ children }) {
  const { isAdmin, isDeptStaff } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { label: "Executive Analytics", path: "/admin", icon: BarChart3, badge: "SLA" },
        { label: "Master Registry", path: "/admin/complaints", icon: FileText, badge: "All" },
      ];
    }
    if (isDeptStaff) {
      return [
        { label: "Department Queue", path: "/dept", icon: Inbox, badge: user?.department?.code || "Queue" },
      ];
    }
    // Student / Staff
    return [
      { label: "My Grievances", path: "/student", icon: LayoutDashboard },
      { label: "Submit New Ticket", path: "/student/submit", icon: PlusCircle, badge: "AI Ready" },
    ];
  };

  const navItems = getNavItems();

  const renderNavLinks = () => (
    <div className="space-y-1.5">
      <div className="px-3.5 py-1.5 mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Navigation
        </span>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {isAdmin ? "Admin" : isDeptStaff ? "Staff" : "Student"}
        </span>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}

      {/* Gemini AI Status Widget */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-violet-50/80 to-purple-50/50 border border-indigo-100/90 text-xs shadow-sm">
        <div className="flex items-center gap-1.5 font-black text-indigo-950 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Gemini 1.5 Flash Active</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Grievances are analyzed in real-time for automated categorization and SLA triage.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Radial Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-4 shadow-sm sticky top-24">
            {renderNavLinks()}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full p-5 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <span className="font-extrabold text-sm text-slate-900">Workspace Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
