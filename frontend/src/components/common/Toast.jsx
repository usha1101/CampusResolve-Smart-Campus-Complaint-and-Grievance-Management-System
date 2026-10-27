import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast(msg, "success", duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, "error", duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, "info", duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, addToast, removeToast }}>
      {children}
      {/* Toast Render Viewport */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 ${
                isSuccess
                  ? "bg-white/95 border-emerald-200/90 text-emerald-950 shadow-emerald-500/10"
                  : isError
                  ? "bg-white/95 border-rose-200/90 text-rose-950 shadow-rose-500/10"
                  : "bg-white/95 border-indigo-200/90 text-slate-900 shadow-indigo-500/10"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                {isError && (
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                )}
                {!isSuccess && !isError && (
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
