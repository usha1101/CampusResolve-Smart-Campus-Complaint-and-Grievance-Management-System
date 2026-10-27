import React from "react";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

export function StatusBadge({ status, size = "md" }) {
  const isSm = size === "sm";
  const sizeClasses = isSm
    ? "px-2 py-0.5 text-[11px] gap-1"
    : "px-2.5 py-1 text-xs gap-1.5";

  switch (status) {
    case "SUBMITTED":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 backdrop-blur-sm ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <Clock className={isSm ? "w-3 h-3 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} />
          Submitted
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 backdrop-blur-sm ${sizeClasses}`}
        >
          <Loader2 className={`${isSm ? "w-3 h-3 text-blue-600" : "w-3.5 h-3.5 text-blue-600"} animate-spin`} />
          In Progress
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 backdrop-blur-sm ${sizeClasses}`}
        >
          <CheckCircle2 className={isSm ? "w-3 h-3 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
          Resolved
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 backdrop-blur-sm ${sizeClasses}`}
        >
          <XCircle className={isSm ? "w-3 h-3 text-rose-600" : "w-3.5 h-3.5 text-rose-600"} />
          Rejected
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}
