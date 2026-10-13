import React, { useState, useEffect } from 'react';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { useWakeLock } from './hooks/useWakeLock';
import { useLessonDetector } from './hooks/useLessonDetector';
import { Header } from './components/Header';
import { CurrentPeriodHero } from './components/CurrentPeriodHero';
import { DayScheduleTimeline } from './components/DayScheduleTimeline';
import { WeeklyMatrixTable } from './components/WeeklyMatrixTable';
import { PrayerTimesBar } from './components/PrayerTimesBar';
import { RunningMarquee } from './components/RunningMarquee';
import { TransitionAlertBanner } from './components/TransitionAlertBanner';
import { AdminScheduleModal } from './components/AdminScheduleModal';
import { AnnouncementsDrawer } from './components/AnnouncementsDrawer';
import { DayOfWeek, GradeId } from './types/schedule';
import { DEFAULT_SCHEDULES } from './data/defaultSchedule';
import { Columns2, LayoutGrid, ListFilter } from 'lucide-react';

const STORAGE_CLEAN_MODE = 'iiqbs_clean_mode_v1';
const DAYS_LIST: DayOfWeek[] = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'SABTU'];

export default function App() {
  const {
    schedules,
    announcements,
    settings,
    isOnline,
    syncStatus,
    serverVersion,
    remoteBellNotification,
    setRemoteBellNotification,
    updateSchedule,
    updateAnnouncements,
    updateSettings,
    triggerBroadcastBell,
  } = useRealtimeSync();

  const {
    isActive: wakeLockActive,
    toggleWakeLock,
  } = useWakeLock(settings.wakeLockEnabled);

  // Clean Mode: displays ONLY schedule information, zero clutter
  const [isCleanMode, setIsCleanMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_CLEAN_MODE) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCleanMode = () => {
    setIsCleanMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_CLEAN_MODE, String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut: Press 'c' for Clean Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'c' || e.key === 'C') {
        toggleCleanMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Default to 'both' so both classes are ALWAYS side-by-side
  const [selectedGrade, setSelectedGrade] = useState<GradeId | 'both'>('both');
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Indonesian day of week helper
  const getTodayDayOfWeek = (): DayOfWeek => {
    const day = new Date().getDay();
    const map: Record<number, DayOfWeek> = {
      0: 'SENIN',
      1: 'SENIN',
      2: 'SELASA',
      3: 'RABU',
      4: 'KAMIS',
      5: 'SABTU', // Jumat libur -> arahkan ke jadwal Sabtu
      6: 'SABTU',
    };
    return map[day] || 'SENIN';
  };

  const actualToday = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(actualToday);

  // Schedules for both classes with rock-solid fallback
  const grade1_2_Schedule = schedules?.grade1_2 || DEFAULT_SCHEDULES.grade1_2;
  const grade3_Schedule = schedules?.grade3 || DEFAULT_SCHEDULES.grade3;

  // Real-time lesson detectors for both classes
  const detector1_2 = useLessonDetector(grade1_2_Schedule, settings, selectedDay);
  const detector3 = useLessonDetector(grade3_Schedule, settings, selectedDay);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const handleToggleSound = () => {
    updateSettings({
      ...settings,
      soundChimeEnabled: !settings.soundChimeEnabled,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* Top Header */}
      <Header
        currentTimeString={detector1_2.currentTimeString}
        currentDate={detector1_2.currentDate}
        activeDayFormatted={detector1_2.activeDayFormatted}
        syncStatus={syncStatus}
        serverVersion={serverVersion}
        isOnline={isOnline}
        wakeLockActive={wakeLockActive}
        soundEnabled={settings.soundChimeEnabled}
        onToggleSound={handleToggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setIsAdminOpen(true)}
        isCleanMode={isCleanMode}
        onToggleCleanMode={toggleCleanMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4 sm:space-y-5">
        
        {/* Day Selector & View Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
          {/* Day Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto">
            {DAYS_LIST.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = actualToday === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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

          {/* Right Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60 text-xs">
              <button
                onClick={() => setSelectedGrade('both')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedGrade === 'both'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan kedua kelas selalu berdampingan"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Berdampingan</span>
              </button>
              <button
                onClick={() => setSelectedGrade('grade1_2')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedGrade === 'grade1_2'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kelas 1 & 2
              </button>
              <button
                onClick={() => setSelectedGrade('grade3')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedGrade === 'grade3'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kelas 3
              </button>
            </div>

            {!isCleanMode && (
              <button
                onClick={() => setViewMode(viewMode === 'timeline' ? 'matrix' : 'timeline')}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 ml-1 cursor-pointer whitespace-nowrap hidden sm:inline"
              >
                {viewMode === 'timeline' ? 'Tabel Lengkap' : 'Timeline'}
              </button>
            )}
          </div>
        </div>

        {/* Optional Slim Prayer Times (Hidden in Clean Mode) */}
        {!isCleanMode && viewMode === 'timeline' && (
          <PrayerTimesBar currentDate={detector1_2.currentDate} />
        )}

        {/* Main View: TIMELINE MODE */}
        {viewMode === 'timeline' && (
          <div>
            {/* STRICTLY 2 COLUMNS ALWAYS SIDE-BY-SIDE */}
            {selectedGrade === 'both' ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full items-start">
                
                {/* COLUMN 1: KELAS 1 & 2 (ALWAYS LEFT) */}
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                        Kelas 1 & 2
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-light hidden sm:inline">
                      1st & 2nd Grade
                    </span>
                  </div>

                  {/* Hero Active Lesson */}
                  <CurrentPeriodHero
                    currentLesson={detector1_2.currentLesson}
                    nextLesson={detector1_2.nextLesson}
                    timeRemainingSeconds={detector1_2.timeRemainingSeconds}
                    progressPercent={detector1_2.progressPercent}
                    gradeTitle="Kelas 1 & 2"
                    isCleanMode={isCleanMode}
                  />

                  {/* Schedule Timeline */}
                  <DayScheduleTimeline
                    lessons={grade1_2_Schedule.schedule[selectedDay] || []}
                    currentLessonId={selectedDay === actualToday ? detector1_2.currentLesson?.id : undefined}
                    selectedDay={selectedDay}
                    actualToday={actualToday}
                  />
                </div>

                {/* COLUMN 2: KELAS 3 (ALWAYS RIGHT) */}
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                      <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                        Kelas 3
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-light hidden sm:inline">
                      3rd Grade
                    </span>
                  </div>

                  {/* Hero Active Lesson */}
                  <CurrentPeriodHero
                    currentLesson={detector3.currentLesson}
                    nextLesson={detector3.nextLesson}
                    timeRemainingSeconds={detector3.timeRemainingSeconds}
                    progressPercent={detector3.progressPercent}
                    gradeTitle="Kelas 3"
                    isCleanMode={isCleanMode}
                  />

                  {/* Schedule Timeline */}
                  <DayScheduleTimeline
                    lessons={grade3_Schedule.schedule[selectedDay] || []}
                    currentLessonId={selectedDay === actualToday ? detector3.currentLesson?.id : undefined}
                    selectedDay={selectedDay}
                    actualToday={actualToday}
                  />
                </div>

              </div>
            ) : selectedGrade === 'grade1_2' ? (
              /* SINGLE VIEW: KELAS 1 & 2 */
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  Kelas 1 & 2 (1st & 2nd Grade)
                </div>
                <CurrentPeriodHero
                  currentLesson={detector1_2.currentLesson}
                  nextLesson={detector1_2.nextLesson}
                  timeRemainingSeconds={detector1_2.timeRemainingSeconds}
                  progressPercent={detector1_2.progressPercent}
                  gradeTitle="Kelas 1 & 2"
                  isCleanMode={isCleanMode}
                />
                <DayScheduleTimeline
                  lessons={grade1_2_Schedule.schedule[selectedDay] || []}
                  currentLessonId={selectedDay === actualToday ? detector1_2.currentLesson?.id : undefined}
                  selectedDay={selectedDay}
                  actualToday={actualToday}
                />
              </div>
            ) : (
              /* SINGLE VIEW: KELAS 3 */
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                  Kelas 3 (3rd Grade)
                </div>
                <CurrentPeriodHero
                  currentLesson={detector3.currentLesson}
                  nextLesson={detector3.nextLesson}
                  timeRemainingSeconds={detector3.timeRemainingSeconds}
                  progressPercent={detector3.progressPercent}
                  gradeTitle="Kelas 3"
                  isCleanMode={isCleanMode}
                />
                <DayScheduleTimeline
                  lessons={grade3_Schedule.schedule[selectedDay] || []}
                  currentLessonId={selectedDay === actualToday ? detector3.currentLesson?.id : undefined}
                  selectedDay={selectedDay}
                  actualToday={actualToday}
                />
              </div>
            )}
          </div>
        )}

        {/* View Mode: WEEKLY MATRIX TABLE */}
        {viewMode === 'matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyMatrixTable
              gradeSchedule={grade1_2_Schedule}
              currentDay={selectedDay}
              currentTimeString={detector1_2.currentTimeString}
            />
            <WeeklyMatrixTable
              gradeSchedule={grade3_Schedule}
              currentDay={selectedDay}
              currentTimeString={detector3.currentTimeString}
            />
          </div>
        )}
      </main>

      {/* Floating Transition Alert Banner */}
      <TransitionAlertBanner
        alert={detector1_2.alertBanner || detector3.alertBanner}
        onDismiss={() => {
          detector1_2.dismissAlert();
          detector3.dismissAlert();
        }}
      />

      {/* Remote Bell Notification Popup */}
      {remoteBellNotification && (
        <TransitionAlertBanner
          alert={{
            title: '🔔 Bel Siaran Pusat Pesantren',
            description: remoteBellNotification.message,
            timestamp: Date.now(),
          }}
          onDismiss={() => setRemoteBellNotification(null)}
        />
      )}

      {/* Bottom Marquee (Only in Standard mode) */}
      {!isCleanMode && (
        <RunningMarquee
          text={settings.runningText}
          announcementsCount={announcements.length}
          onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
        />
      )}

      {/* Admin Settings Modal */}
      <AdminScheduleModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        schedules={schedules}
        onUpdateSchedule={updateSchedule}
        announcements={announcements}
        onUpdateAnnouncements={updateAnnouncements}
        settings={settings}
        onUpdateSettings={updateSettings}
        onTriggerBroadcastBell={triggerBroadcastBell}
        wakeLockActive={wakeLockActive}
        onToggleWakeLock={toggleWakeLock}
      />

      {/* Announcements Drawer */}
      <AnnouncementsDrawer
        isOpen={isAnnouncementsOpen}
        onClose={() => setIsAnnouncementsOpen(false)}
        announcements={announcements}
      />
    </div>
  );
}
