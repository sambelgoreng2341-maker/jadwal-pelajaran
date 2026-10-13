import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';

interface RunningMarqueeProps {
  text: string;
  announcementsCount?: number;
  onOpenAnnouncements?: () => void;
}

export const RunningMarquee: React.FC<RunningMarqueeProps> = ({
  text,
  announcementsCount = 0,
  onOpenAnnouncements,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 py-2.5 px-4 sm:px-6 shadow-2xl flex items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Info Santri
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="whitespace-nowrap inline-block animate-marquee text-slate-300 font-medium tracking-wide">
          {text} &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; {text}
        </div>
      </div>

      {announcementsCount > 0 && onOpenAnnouncements && (
        <button
          onClick={onOpenAnnouncements}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-750 transition cursor-pointer text-[11px]"
          title="Buka Pengumuman Lengkap"
        >
          <Volume2 className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">Warta:</span>
          <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[9px]">
            {announcementsCount}
          </span>
        </button>
      )}
    </footer>
  );
};
