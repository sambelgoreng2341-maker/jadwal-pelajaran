import React, { useEffect } from 'react';
import { BellRing, X, Sparkles, BookOpen, Coffee } from 'lucide-react';

interface TransitionAlertBannerProps {
  alert: {
    title: string;
    description: string;
    timestamp: number;
  } | null;
  onDismiss: () => void;
}

export const TransitionAlertBanner: React.FC<TransitionAlertBannerProps> = ({
  alert,
  onDismiss,
}) => {
  useEffect(() => {
    if (!alert) return;
    // Auto dismiss after 12 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl animate-bounce-short">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 shadow-2xl shadow-emerald-950/80 border-2 border-emerald-300/40">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-950/30 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <BellRing className="w-6 h-6 text-amber-300 animate-wiggle" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-950/40 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                Pemberitahuan Otomatis
              </span>
              <span className="text-[11px] text-emerald-100 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString('id-ID')} WIB
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black tracking-tight mt-1 text-white">
              {alert.title}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-50 font-medium mt-0.5">
              {alert.description}
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-emerald-100 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-white to-amber-400 animate-pulse" />
      </div>
    </div>
  );
};
