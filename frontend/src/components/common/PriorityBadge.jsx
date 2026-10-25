import React from "react";
import { AlertCircle, AlertTriangle, ArrowDown, Flame } from "lucide-react";

export function PriorityBadge({ priority }) {
  switch (priority) {
    case "URGENT":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <Flame className="w-3 h-3 text-red-600 animate-pulse" />
          Urgent
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
          <AlertCircle className="w-3 h-3 text-orange-600" />
          High
        </span>
      );
    case "MEDIUM":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <AlertTriangle className="w-3 h-3 text-blue-600" />
          Medium
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <ArrowDown className="w-3 h-3 text-slate-500" />
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
          {priority}
        </span>
      );
  }
}
