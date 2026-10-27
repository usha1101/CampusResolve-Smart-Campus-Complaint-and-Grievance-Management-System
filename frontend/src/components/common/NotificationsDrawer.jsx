import React from "react";
import { X, Bell, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const mockActivities = [
    {
      id: "act-1",
      title: "Gemini AI Triage Completed",
      desc: "New grievance categorized under IT Infrastructure with 94% confidence.",
      time: "10m ago",
      type: "ai",
    },
    {
      id: "act-2",
      title: "Grievance Status Updated",
      desc: "CMP-20261027-1049 transitioned to IN PROGRESS by IT Lead.",
      time: "1h ago",
      type: "status",
    },
    {
      id: "act-3",
      title: "Resolution SLA Reminder",
      desc: "High priority tickets must be inspected within 24 hours of assignment.",
      time: "3h ago",
      type: "sla",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Activity & Updates</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {mockActivities.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {item.type === "ai" && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    {item.type === "status" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.type === "sla" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Real-time activity logs sync with grievance status machine events.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
