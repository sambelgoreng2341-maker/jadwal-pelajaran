import React from 'react';
import {
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SyncStatus } from '../hooks/useRealtimeSync';
import { getHijriDate } from '../utils/prayerTimes';

interface HeaderProps {
  currentTimeString: string;
  currentDate: Date;
  activeDayFormatted: string;
  syncStatus: SyncStatus;
  serverVersion?: number;
  isOnline: boolean;
  wakeLockActive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  isCleanMode: boolean;
  onToggleCleanMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTimeString,
  currentDate,
  activeDayFormatted,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  isCleanMode,
  onToggleCleanMode,
}) => {
  const hijriDate = getHijriDate(currentDate);

  // If Clean Mode is active, show the purest minimal header
  if (isCleanMode) {
    return (
      <header className="px-6 sm:px-12 py-5 max-w-7xl mx-auto w-full flex items-center justify-between transition-all">
        {/* Left: Simple Institution name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-serif font-black text-sm">
            II
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white uppercase">
              IIQBS Timetable
            </h1>
            <p className="text-[11px] text-slate-400 font-light">
              Jadwal Harian Santri
            </p>
          </div>
        </div>

        {/* Center: Pure Clock */}
        <div className="flex items-baseline gap-3 text-center">
          <span className="font-mono text-3xl sm:text-4xl font-extralight tracking-wider text-white tabular-nums">
            {currentTimeString}
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">
            • {activeDayFormatted}
          </span>
        </div>

        {/* Right: Discrete Clean Mode exit button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCleanMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
            title="Keluar dari Mode Bersih"
          >
            <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-medium text-[11px]">Mode Lengkap</span>
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>
    );
  }

  // Standard Mode Header: Refined, serene, zero clutter
  return (
    <header className="px-6 sm:px-10 py-4 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-850/60 transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-serif font-black text-sm">
            II
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                IIQBS
              </span>
              <span className="text-xs text-slate-400 font-normal">
                | Jadwal KBM Santri
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-light">
              Imam Ismail Quranic Boarding School
            </p>
          </div>
        </div>

        {/* Mobile Action */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleCleanMode}
            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            title="Mode Bersih"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Clock */}
      <div className="flex flex-col items-center">
        <div className="font-mono text-2xl sm:text-3xl font-light tracking-widest text-white tabular-nums">
          {currentTimeString}
        </div>
        <div className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
          {activeDayFormatted} <span className="text-slate-600">•</span> <span className="text-emerald-400/90 font-serif">{hijriDate}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Clean Mode Button */}
        <button
          onClick={onToggleCleanMode}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
          title="Aktifkan Mode Bersih: hanya menampilkan jadwal pelajaran tanpa tombol dan ornamen"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mode Bersih</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          title={soundEnabled ? 'Bel Suara Aktif' : 'Bel Suara Mute'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          title="Layar Penuh"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          title="Pengaturan"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
