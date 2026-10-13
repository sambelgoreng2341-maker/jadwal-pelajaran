import React from 'react';
import { GradeSchedule, DayOfWeek } from '../types/schedule';
import { Printer, Calendar, BookOpen } from 'lucide-react';

interface WeeklyMatrixTableProps {
  gradeSchedule: GradeSchedule;
  currentDay: DayOfWeek;
  currentTimeString: string;
  onPrint?: () => void;
}

export const WeeklyMatrixTable: React.FC<WeeklyMatrixTableProps> = ({
  gradeSchedule,
  currentDay,
  onPrint,
}) => {
  const days: DayOfWeek[] = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'SABTU'];

  // Table rows structure based on IIQBS timetable
  const rows = [
    {
      period: '1',
      defaultTime: '07.45-08.25',
      kamisSabtuTime: '07.30-08.10',
      type: 'lesson',
    },
    {
      period: '2',
      defaultTime: '08.25-09.05',
      kamisSabtuTime: '08.10-08.50',
      type: 'lesson',
    },
    {
      period: 'IST',
      defaultTime: '09.05-09.15',
      kamisSabtuTime: '08.50-09.10',
      isBanner: true,
      bannerText: 'Istirahat',
      type: 'break',
    },
    {
      period: '3',
      defaultTime: '09.15-09.55',
      kamisSabtuTime: '09.10-09.50',
      type: 'lesson',
    },
    {
      period: '4',
      defaultTime: '09.55-10.35',
      kamisSabtuTime: '09.50-10.30',
      type: 'lesson',
    },
    {
      period: '5',
      defaultTime: '10.40-11.20',
      kamisSabtuTime: '10.40-11.20',
      type: 'lesson',
    },
    {
      period: '6',
      defaultTime: '11.20-12.00',
      kamisSabtuTime: '11.20-12.00',
      type: 'lesson',
    },
    {
      period: 'DZU',
      defaultTime: '12.00-12.15',
      kamisSabtuTime: '12.00-12.15',
      isBanner: true,
      bannerText: 'DZUHUR PRAYER',
      type: 'prayer',
    },
    {
      period: '7',
      defaultTime: '12.20-13.00',
      kamisSabtuTime: '12.20-13.00',
      type: 'lesson',
    },
    {
      period: 'LUN',
      defaultTime: '12.30-13.00',
      kamisSabtuTime: '12.30-13.00',
      isBanner: true,
      bannerText: 'HAVE A LUNCH (Makan Siang)',
      type: 'lunch',
    },
  ];

  // Helper to find lesson in gradeSchedule
  const getCellContent = (day: DayOfWeek, rowIndex: number) => {
    const daySchedule = gradeSchedule.schedule[day] || [];
    const r = rows[rowIndex];

    if (r.isBanner) {
      return { subject: r.bannerText, teacher: '' };
    }

    const pNum = parseInt(r.period);
    const item = daySchedule.find((l) => l.periodNumber === pNum);
    if (!item) return { subject: '-', teacher: '' };
    return { subject: item.subject, teacher: item.teacher };
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Matriks Jadwal Mingguan Resmi • {gradeSchedule.gradeName} ({gradeSchedule.gradeSubtitle})
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Format sesuai dokumen kurikulum IIQBS (Imam Ismail Quranic Boarding School)
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          title="Cetak Jadwal Pelajaran"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cetak Jadwal</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/80 shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/95 text-slate-200 border-b border-slate-700">
              <th className="py-3 px-3 border-r border-slate-700 text-center font-bold w-16">
                JAM KE-
              </th>
              <th className="py-3 px-3 border-r border-slate-700 font-bold w-28 text-center">
                JAM
              </th>
              {days.map((day) => {
                const isToday = currentDay === day;
                return (
                  <th
                    key={day}
                    className={`py-3 px-4 border-r border-slate-700 font-extrabold text-center uppercase tracking-wider ${
                      isToday
                        ? 'bg-emerald-800/60 text-emerald-200 ring-2 ring-emerald-500/40'
                        : 'text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{day}</span>
                      {isToday && (
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded mt-0.5">
                          Hari Ini
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, idx) => {
              if (row.isBanner) {
                return (
                  <tr key={idx} className="bg-slate-950/80 font-bold">
                    <td className="py-2.5 px-3 border-r border-slate-800 text-center text-slate-400 text-[11px]">
                      {row.period}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-800 font-mono text-[11px] text-center text-slate-400">
                      {row.defaultTime}
                    </td>
                    <td
                      colSpan={days.length}
                      className={`py-2 px-4 text-center font-extrabold uppercase tracking-widest text-xs ${
                        row.type === 'break'
                          ? 'bg-amber-950/30 text-amber-300'
                          : row.type === 'prayer'
                          ? 'bg-emerald-950/50 text-emerald-300'
                          : 'bg-teal-950/40 text-teal-300'
                      }`}
                    >
                      {row.bannerText}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 border-r border-slate-800 text-center font-bold text-white bg-slate-950/40">
                    {row.period}
                  </td>
                  <td className="py-3 px-2 border-r border-slate-800 text-center font-mono text-[11px] text-slate-300">
                    <div className="text-slate-200">{row.defaultTime}</div>
                    {row.kamisSabtuTime !== row.defaultTime && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        (Kms/Sbt: {row.kamisSabtuTime})
                      </div>
                    )}
                  </td>
                  {days.map((day) => {
                    const isToday = currentDay === day;
                    const content = getCellContent(day, idx);

                    return (
                      <td
                        key={day}
                        className={`py-2.5 px-3 border-r border-slate-800 text-center ${
                          isToday ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="font-bold text-slate-100">{content.subject}</div>
                        {content.teacher && (
                          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            ({content.teacher})
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
