import { PrayerTimeItem } from '../types/schedule';

export function getTodayPrayerTimes(date: Date = new Date()): PrayerTimeItem[] {
  // Approximate realistic times for Indonesia (WIB) with Dzuhur matching the 12:00 schedule
  const times: PrayerTimeItem[] = [
    { name: 'Subuh', arabic: 'الفجر', time: '04:28' },
    { name: 'Terbit', arabic: 'الشروق', time: '05:42' },
    { name: 'Dhuha', arabic: 'الضحى', time: '06:15' },
    { name: 'Dzuhur', arabic: 'الظهر', time: '11:45' },
    { name: 'Ashar', arabic: 'العصر', time: '14:58' },
    { name: 'Maghrib', arabic: 'المغرب', time: '17:48' },
    { name: 'Isya', arabic: 'العشاء', time: '18:58' },
  ];

  const currentHours = date.getHours();
  const currentMinutes = date.getMinutes();
  const currentTotal = currentHours * 60 + currentMinutes;

  let nextFound = false;

  return times.map((item) => {
    const [h, m] = item.time.split(':').map(Number);
    const itemTotal = h * 60 + m;
    const isPast = currentTotal > itemTotal;
    const isNext = !nextFound && currentTotal <= itemTotal;
    if (isNext) nextFound = true;

    return {
      ...item,
      isNext,
      isCurrent: Math.abs(currentTotal - itemTotal) <= 15,
    };
  });
}

/**
 * Format Hijri Date roughly based on astronomical calculation or standard offset
 */
export function getHijriDate(date: Date = new Date()): string {
  try {
    const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return hijriFormatter.format(date) + ' H';
  } catch (e) {
    // Fallback if not supported
    return '1 Rabiul Akhir 1448 H';
  }
}
