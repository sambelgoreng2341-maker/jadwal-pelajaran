import React from 'react';
import { LessonPeriod, DayOfWeek } from '../types/schedule';
import { Check } from 'lucide-react';

interface DayScheduleTimelineProps {
  lessons: LessonPeriod[];
  currentLessonId?: string;
  selectedDay: DayOfWeek;
  onSelectDay?: (day: DayOfWeek) => void;
  actualToday: DayOfWeek;
  showDayTabs?: boolean;
}

const DAYS_LIST: DayOfWeek[] = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'SABTU'];

export const DayScheduleTimeline: React.FC<DayScheduleTimelineProps> = ({
  lessons,
  currentLessonId,
  selectedDay,
  onSelectDay,
  actualToday,
  showDayTabs = false,
}) => {
  const isViewingToday = selectedDay === actualToday;
  let hasFoundActive = false;

  return (
    <div className="space-y-3">
      {/* Optional Day Tabs (if standalone) */}
      {showDayTabs && onSelectDay && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DAYS_LIST.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = actualToday === day;

            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Clean Schedule List */}
      <div className="rounded-2xl border border-slate-800/60 divide-y divide-slate-800/40 bg-slate-900/20 overflow-hidden">
        {lessons.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            Tidak ada jadwal untuk hari ini.
          </div>
        ) : (
          lessons.map((item) => {
            const isCurrent = isViewingToday && item.id === currentLessonId;
            if (isCurrent) hasFoundActive = true;
            const isPast = isViewingToday && currentLessonId && !isCurrent && !hasFoundActive;

            const isBreak = item.type === 'break';
            const isPrayer = item.type === 'prayer';
            const isLunch = item.type === 'lunch';

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3.5 sm:px-5 py-3 transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/30 text-white font-medium border-l-4 border-emerald-400'
                    : isPast
                    ? 'opacity-40 text-slate-400'
                    : 'text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {/* Left: Time Range */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    {item.startTime} - {item.endTime}
                  </span>
                  {item.periodNumber && (
                    <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">
                      #{item.periodNumber}
                    </span>
                  )}
                </div>

                {/* Center: Subject & Teacher */}
                <div className="flex-1 px-3 min-w-0">
                  <div className="flex items-baseline gap-1.5 truncate">
                    <span
                      className={`text-xs sm:text-sm font-semibold tracking-tight truncate ${
                        isCurrent
                          ? 'text-emerald-300 font-bold'
                          : isBreak
                          ? 'text-amber-300'
                          : isPrayer
                          ? 'text-teal-300'
                          : isLunch
                          ? 'text-orange-300'
                          : 'text-slate-100'
                      }`}
                    >
                      {item.subject}
                    </span>

                    {item.teacher !== '-' && (
                      <span className="text-[11px] text-slate-400 font-normal truncate hidden md:inline">
                        • {item.teacher}
                      </span>
                    )}
                  </div>
                  {/* Teacher on smaller screen */}
                  {item.teacher !== '-' && (
                    <div className="text-[10px] text-slate-400 font-normal truncate md:hidden">
                      {item.teacher}
                    </div>
                  )}
                </div>

                {/* Right: Status */}
                <div className="shrink-0 text-right">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Aktif
                    </span>
                  ) : isPast ? (
                    <span className="text-slate-500 text-xs flex items-center justify-end">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
