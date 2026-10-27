import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ProfileDrawer } from "./ProfileDrawer";
import { NotificationsDrawer } from "./NotificationsDrawer";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function Navbar({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { user, logout, isAdmin, isDeptStaff } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          Admin
        </span>
      );
    }
    if (isDeptStaff) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
          <Building2 className="w-3 h-3 text-indigo-600" />
          {user?.department?.code || "Staff"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
        <User className="w-3 h-3 text-emerald-600" />
        Student
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onMobileMenuToggle}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                  CampusResolve
                </span>
                <span className="hidden sm:inline-flex ml-2.5 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded-full items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Gemini AI
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Cluster */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Button */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors"
                title="Activity & Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              </button>

              {/* User Profile Pill */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm transition-all group"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                    {user.full_name}
                  </p>
                  <div className="mt-1">{getRoleBadge()}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Drawers */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}
