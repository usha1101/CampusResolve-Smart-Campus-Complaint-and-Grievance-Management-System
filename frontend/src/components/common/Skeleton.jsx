import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-slate-200/70 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
