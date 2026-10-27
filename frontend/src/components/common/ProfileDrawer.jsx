import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  X,
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function ProfileDrawer({ isOpen, onClose }) {
  const { user, logout, isAdmin, isDeptStaff } = useAuth();

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    logout();
    onClose();
    window.location.href = "/login";
  };

  const getRoleTitle = () => {
    if (isAdmin) return "Campus Administrator";
    if (isDeptStaff) return `Department Staff (${user.department?.code || "Triage"})`;
    return "Student / Academic Member";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-500/20">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  {user.full_name}
                </h2>
                <p className="text-xs text-indigo-600 font-semibold">{getRoleTitle()}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Account Details Card */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Credentials
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Campus Email</p>
                    <p className="font-semibold text-slate-900 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <Shield className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Role</p>
                    <p className="font-semibold text-slate-900">{user.role}</p>
                  </div>
                </div>

                {user.department && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-semibold">Operational Department</p>
                      <p className="font-semibold text-slate-900">
                        {user.department.name} ({user.department.code})
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Contact Phone</p>
                    <p className="font-semibold text-slate-900">{user.phone || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-semibold">Member Since</p>
                    <p className="font-semibold text-slate-900">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Active Member"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Access Capabilities */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Access Privileges
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                {isAdmin && (
                  <>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Executive oversight & SLA analytics
                    </li>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Cross-campus grievance reassignment
                    </li>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Rejection authority with mandatory reason audit
                    </li>
                  </>
                )}
                {isDeptStaff && (
                  <>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Assigned department grievance queue
                    </li>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Investigation notes & verified resolution logging
                    </li>
                  </>
                )}
                {!isAdmin && !isDeptStaff && (
                  <>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Grievance filing with photo evidence attachments
                    </li>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Automated Gemini AI triage categorization
                    </li>
                    <li className="flex items-center gap-1.5 text-indigo-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      1–5 Star resolution satisfaction feedback
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of CampusResolve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
