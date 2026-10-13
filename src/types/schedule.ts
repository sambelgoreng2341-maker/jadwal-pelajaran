export type DayOfWeek = 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'AHAD';

export type GradeId = 'grade1_2' | 'grade3';

export interface LessonPeriod {
  id: string;
  periodNumber: number | null; // null for break or prayer
  startTime: string; // '07:45'
  endTime: string;   // '08:25'
  subject: string;
  teacher: string;
  room?: string;
  type: 'lesson' | 'break' | 'prayer' | 'lunch' | 'activity';
  note?: string;
}

export type DaySchedule = LessonPeriod[];

export interface GradeSchedule {
  gradeId: GradeId;
  gradeName: string;
  gradeSubtitle: string;
  schedule: Record<DayOfWeek, DaySchedule>;
}

export interface PesantrenInfo {
  name: string;
  subName: string;
  academicYear: string;
  term: string;
  institution: string;
  address: string;
  location: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  active: boolean;
}

export interface KioskSettings {
  wakeLockEnabled: boolean;
  soundChimeEnabled: boolean;
  chimeType: 'pesantren' | 'westminster' | 'school_bell' | 'soft_chime';
  ttsAnnouncementEnabled: boolean;
  chimeVolume: number; // 0.0 - 1.0
  activeGrade: GradeId | 'both';
  theme: 'emerald' | 'navy' | 'amber';
  runningText: string;
  simulatedTime: string | null; // e.g. '09:14:50' or null for live clock
}

export interface PrayerTimeItem {
  name: string;
  arabic: string;
  time: string;
  isNext?: boolean;
  isCurrent?: boolean;
}
