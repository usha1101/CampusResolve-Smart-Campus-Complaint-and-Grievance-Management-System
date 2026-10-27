import React from "react";
import { AlertCircle, AlertTriangle, ArrowDown, Flame } from "lucide-react";

export function PriorityBadge({ priority, size = "md" }) {
  const isSm = size === "sm";
  const sizeClasses = isSm
    ? "px-2 py-0.5 text-[11px] gap-1"
    : "px-2.5 py-1 text-xs gap-1.5";

  switch (priority) {
    case "URGENT":
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/30 backdrop-blur-sm shadow-sm shadow-rose-500/10 ${sizeClasses}`}
        >
          <Flame className={`${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} text-rose-600 animate-pulse-glow`} />
          Urgent
        </span>
      );
    case "HIGH":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-orange-500/10 text-orange-700 border border-orange-500/25 backdrop-blur-sm ${sizeClasses}`}
        >
          <AlertCircle className={`${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} text-orange-600`} />
          High
        </span>
      );
    case "MEDIUM":
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 backdrop-blur-sm ${sizeClasses}`}
        >
          <AlertTriangle className={`${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} text-blue-600`} />
          Medium
        </span>
      );
    case "LOW":
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-500/10 text-slate-700 border border-slate-500/20 backdrop-blur-sm ${sizeClasses}`}
        >
          <ArrowDown className={`${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} text-slate-500`} />
          Low
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          {priority}
        </span>
      );
  }
}
