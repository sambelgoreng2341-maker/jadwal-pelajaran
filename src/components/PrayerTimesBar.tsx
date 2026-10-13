import React from 'react';
import { getTodayPrayerTimes } from '../utils/prayerTimes';
import { Moon, Sun, Sunrise, Sunset, Clock } from 'lucide-react';

interface PrayerTimesBarProps {
  currentDate?: Date;
}

export const PrayerTimesBar: React.FC<PrayerTimesBarProps> = ({ currentDate }) => {
  const prayerTimes = getTodayPrayerTimes(currentDate);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Subuh': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Terbit': return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case 'Dhuha': return <Sun className="w-3.5 h-3.5 text-amber-300" />;
      case 'Dzuhur': return <Sun className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Ashar': return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
      case 'Maghrib': return <Sunset className="w-3.5 h-3.5 text-rose-400" />;
      case 'Isya': return <Moon className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold text-slate-300">Waktu Sholat</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {prayerTimes.map((item) => (
            <div
              key={item.name}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all ${
                item.isCurrent
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                  : item.isNext
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {getIcon(item.name)}
              <span className="font-medium">{item.name}</span>
              <span className="font-mono font-bold text-slate-200">{item.time}</span>
              {item.isNext && (
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-md">
                  Akan Datang
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
