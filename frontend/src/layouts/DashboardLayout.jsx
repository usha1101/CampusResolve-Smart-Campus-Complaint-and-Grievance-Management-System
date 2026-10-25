import React from "react";
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
} from "lucide-react";

export function DashboardLayout({ children }) {
  const { user, isAdmin, isDeptStaff, isStudent } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { label: "Executive Analytics", path: "/admin", icon: BarChart3 },
        { label: "All Grievances", path: "/admin/complaints", icon: FileText },
      ];
    }
    if (isDeptStaff) {
      return [
        { label: "Assigned Queue", path: "/dept", icon: Inbox },
      ];
    }
    // Student / Staff
    return [
      { label: "My Grievances", path: "/student", icon: LayoutDashboard },
      { label: "Submit New Grievance", path: "/student/submit", icon: PlusCircle },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-1 sticky top-24">
            <div className="px-3 py-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {item.label}
                </Link>
              );
            })}

            {/* Quick Helper Widget */}
            <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 text-xs text-indigo-900">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Gemini AI Triage
              </div>
              <p className="text-slate-600 leading-relaxed">
                Complaints are analyzed in real-time with Google Gemini 1.5 Flash for rapid department routing.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
