import { useState, useEffect, useRef, useMemo } from 'react';
import { LessonPeriod, DayOfWeek, GradeSchedule, KioskSettings } from '../types/schedule';
import { playSchoolChime, announceViaTTS, showBrowserNotification } from '../utils/audioChime';

export interface LessonDetectorResult {
  currentLesson: LessonPeriod | null;
  nextLesson: LessonPeriod | null;
  previousLesson: LessonPeriod | null;
  timeRemainingSeconds: number;
  timeElapsedSeconds: number;
  totalDurationSeconds: number;
  progressPercent: number;
  currentTimeString: string;
  currentDate: Date;
  activeDay: DayOfWeek;
  activeDayFormatted: string;
  isSchoolHours: boolean;
  alertBanner: {
    title: string;
    description: string;
    timestamp: number;
  } | null;
  dismissAlert: () => void;
}

const INDONESIAN_DAYS: Record<number, DayOfWeek> = {
  0: 'SENIN',
  1: 'SENIN',
  2: 'SELASA',
  3: 'RABU',
  4: 'KAMIS',
  5: 'SABTU',
  6: 'SABTU',
};

// Helper: convert "HH:mm" to seconds from midnight
function timeToSeconds(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60;
}

export function useLessonDetector(
  activeGradeSchedule: GradeSchedule,
  settings: KioskSettings,
  overrideDay?: DayOfWeek
) {
  const [now, setNow] = useState<Date>(new Date());
  const [alertBanner, setAlertBanner] = useState<{
    title: string;
    description: string;
    timestamp: number;
  } | null>(null);

  const lastTriggeredPeriodIdRef = useRef<string | null>(null);
  const isFirstMountRef = useRef<boolean>(true);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (settings.simulatedTime) {
        // Parse simulated time "HH:mm:ss" into today's date
        const parts = settings.simulatedTime.split(':').map(Number);
        const simDate = new Date();
        simDate.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
        setNow(simDate);
      } else {
        setNow(new Date());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.simulatedTime]);

  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayIndex = now.getDay();
  const actualDayOfWeek = INDONESIAN_DAYS[dayIndex] || 'SENIN';
  const activeDay = overrideDay || actualDayOfWeek;

  const todayLessons = useMemo(() => {
    if (!activeGradeSchedule || !activeGradeSchedule.schedule) return [];
    return activeGradeSchedule.schedule[activeDay] || [];
  }, [activeGradeSchedule, activeDay]);

  // Find current, next, and previous lessons
  const { currentLesson, nextLesson, previousLesson, lessonIndex } = useMemo(() => {
    let current: LessonPeriod | null = null;
    let next: LessonPeriod | null = null;
    let prev: LessonPeriod | null = null;
    let cIndex = -1;

    for (let i = 0; i < todayLessons.length; i++) {
      const lesson = todayLessons[i];
      const startSec = timeToSeconds(lesson.startTime);
      const endSec = timeToSeconds(lesson.endTime);

      if (currentSeconds >= startSec && currentSeconds < endSec) {
        current = lesson;
        cIndex = i;
        next = todayLessons[i + 1] || null;
        prev = todayLessons[i - 1] || null;
        break;
      } else if (currentSeconds < startSec) {
        // Current is before this lesson, so this is the next upcoming lesson
        if (!next) {
          next = lesson;
          prev = todayLessons[i - 1] || null;
        }
      }
    }

    return {
      currentLesson: current,
      nextLesson: next,
      previousLesson: prev,
      lessonIndex: cIndex,
    };
  }, [todayLessons, currentSeconds]);

  // Timing calculations
  let timeRemainingSeconds = 0;
  let timeElapsedSeconds = 0;
  let totalDurationSeconds = 0;
  let progressPercent = 0;
  let isSchoolHours = false;

  if (currentLesson) {
    isSchoolHours = true;
    const startSec = timeToSeconds(currentLesson.startTime);
    const endSec = timeToSeconds(currentLesson.endTime);
    totalDurationSeconds = endSec - startSec;
    timeElapsedSeconds = Math.max(0, currentSeconds - startSec);
    timeRemainingSeconds = Math.max(0, endSec - currentSeconds);
    progressPercent = Math.min(100, Math.max(0, (timeElapsedSeconds / totalDurationSeconds) * 100));
  } else if (nextLesson) {
    const nextStartSec = timeToSeconds(nextLesson.startTime);
    timeRemainingSeconds = Math.max(0, nextStartSec - currentSeconds);
  }

  // Automatic Bell and Notification Trigger on Period Change
  useEffect(() => {
    // If it's initial mount, set the current period so we don't startle with a bell immediately unless simulated
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      if (currentLesson) {
        lastTriggeredPeriodIdRef.current = currentLesson.id;
      }
      return;
    }

    if (!currentLesson) {
      return;
    }

    // Check if period actually changed
    if (currentLesson.id !== lastTriggeredPeriodIdRef.current) {
      lastTriggeredPeriodIdRef.current = currentLesson.id;

      let notifTitle = '';
      let notifBody = '';
      let ttsMessage = '';

      if (currentLesson.type === 'lesson') {
        notifTitle = `🔔 Jam Pelajaran Ke-${currentLesson.periodNumber} Dimulai`;
        notifBody = `${currentLesson.subject} bersama ${currentLesson.teacher} (${currentLesson.startTime} - ${currentLesson.endTime})`;
        ttsMessage = `Perhatian santri sekalian. Jam pelajaran ke-${currentLesson.periodNumber}, mata pelajaran ${currentLesson.subject} bersama ${currentLesson.teacher} telah dimulai. Selamat belajar.`;
      } else if (currentLesson.type === 'break') {
        notifTitle = '☕ Waktu Istirahat Santri';
        notifBody = `Selamat beristirahat (${currentLesson.startTime} - ${currentLesson.endTime})`;
        ttsMessage = `Waktu istirahat pagi telah tiba. Santri dipersilakan beristirahat sejenak dan mempersiapkan perlengkapan belajar berikutnya.`;
      } else if (currentLesson.type === 'prayer') {
        notifTitle = '🕌 Waktu Sholat Berjamaah';
        notifBody = `${currentLesson.subject} (${currentLesson.startTime} - ${currentLesson.endTime})`;
        ttsMessage = `Panggilan sholat Dzuhur telah tiba. Seluruh santri diharapkan segera mengambil air wudhu dan bergegas menuju masjid jami'.`;
      } else if (currentLesson.type === 'lunch') {
        notifTitle = '🍽️ Waktu Makan Siang (Lunch)';
        notifBody = `Makan siang bersama santri di ruang makan (${currentLesson.startTime} - ${currentLesson.endTime})`;
        ttsMessage = `Waktu makan siang telah tiba. Selamat menikmati hidangan dan tetap menjaga adab makan.`;
      } else {
        notifTitle = `📢 Kegiatan: ${currentLesson.subject}`;
        notifBody = `${currentLesson.subject} (${currentLesson.startTime} - ${currentLesson.endTime})`;
        ttsMessage = `Kegiatan ${currentLesson.subject} telah dimulai.`;
      }

      // 1. Visual banner popup
      setAlertBanner({
        title: notifTitle,
        description: notifBody,
        timestamp: Date.now(),
      });

      // 2. Play Audio Bell Chime
      if (settings.soundChimeEnabled) {
        playSchoolChime(settings.chimeType, settings.chimeVolume);
      }

      // 3. Audio Voice Announcement (TTS)
      if (settings.ttsAnnouncementEnabled) {
        setTimeout(() => {
          announceViaTTS(ttsMessage);
        }, 2200); // Wait for chime to resonate before voice
      }

      // 4. Native Browser Notification
      showBrowserNotification(notifTitle, notifBody);
    }
  }, [currentLesson, settings]);

  const dismissAlert = () => setAlertBanner(null);

  const currentTimeString = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const activeDayFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    currentLesson,
    nextLesson,
    previousLesson,
    timeRemainingSeconds,
    timeElapsedSeconds,
    totalDurationSeconds,
    progressPercent,
    currentTimeString,
    currentDate: now,
    activeDay,
    activeDayFormatted,
    isSchoolHours,
    alertBanner,
    dismissAlert,
  };
}
