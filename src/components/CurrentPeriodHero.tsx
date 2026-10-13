import React from 'react';
import { LessonPeriod } from '../types/schedule';
import { User, Clock } from 'lucide-react';

interface CurrentPeriodHeroProps {
  currentLesson: LessonPeriod | null;
  nextLesson: LessonPeriod | null;
  timeRemainingSeconds: number;
  progressPercent: number;
  gradeTitle: string;
  isCleanMode?: boolean;
}

function formatCountdown(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const CurrentPeriodHero: React.FC<CurrentPeriodHeroProps> = ({
  currentLesson,
  nextLesson,
  timeRemainingSeconds,
  progressPercent,
  gradeTitle,
}) => {
  // 1. When a session is active
  if (currentLesson) {
    const isBreak = currentLesson.type === 'break';
    const isPrayer = currentLesson.type === 'prayer';
    const isLunch = currentLesson.type === 'lunch';

    const categoryLabel = isBreak
      ? 'WAKTU ISTIRAHAT'
      : isPrayer
      ? 'SHOLAT DZUHUR'
      : isLunch
      ? 'MAKAN SIANG'
      : currentLesson.periodNumber
      ? `JAM KE-${currentLesson.periodNumber}`
      : 'SESI AKTIF';

    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 p-4 sm:p-6 transition-all shadow-sm">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          
          {/* Main Info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-emerald-400 font-bold truncate">{categoryLabel}</span>
              <span>•</span>
              <span className="font-mono text-slate-300 shrink-0">{currentLesson.startTime} - {currentLesson.endTime}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate leading-tight">
              {currentLesson.subject}
            </h2>

            {currentLesson.teacher !== '-' && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-medium pt-0.5 truncate">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{currentLesson.teacher}</span>
              </div>
            )}
          </div>

          {/* Sisa Waktu Countdown */}
          <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between w-full xl:w-auto shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-800/60">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Sisa Waktu
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-light text-white tracking-wider tabular-nums">
              {formatCountdown(timeRemainingSeconds)}
            </div>

            {/* Subtle progress bar */}
            <div className="hidden xl:block w-28 h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Period Line */}
        {nextLesson && (
          <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
            <div className="truncate">
              <span className="text-slate-400">Lanjut: </span>
              <span className="font-bold text-white">
                {nextLesson.periodNumber ? `#${nextLesson.periodNumber} ` : ''}
                {nextLesson.subject}
              </span>
              {nextLesson.teacher !== '-' && (
                <span className="text-slate-400 hidden sm:inline"> ({nextLesson.teacher})</span>
              )}
            </div>
            <div className="font-mono text-[11px] text-slate-400 shrink-0 ml-2">
              {nextLesson.startTime}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Free time / off hours
  return (
    <div className="rounded-2xl bg-slate-900/30 border border-slate-800/60 p-5 text-left flex flex-col justify-between gap-3">
      <div>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
          Waktu Santri
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
          Belajar Mandiri & Istirahat
        </h3>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Tidak ada jam pelajaran formal saat ini.
        </p>
      </div>

      {nextLesson && (
        <div className="bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Berikutnya</span>
            <span className="font-bold text-white">{nextLesson.subject}</span>
          </div>
          <span className="font-mono font-bold text-slate-300 text-xs">
            {nextLesson.startTime} WIB
          </span>
        </div>
      )}
    </div>
  );
};
