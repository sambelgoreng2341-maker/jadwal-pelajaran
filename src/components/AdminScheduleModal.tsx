import React, { useState } from 'react';
import {
  GradeSchedule,
  Announcement,
  KioskSettings,
  DayOfWeek,
  LessonPeriod,
} from '../types/schedule';
import { IQBSLogo } from './IQBSLogo';
import {
  X,
  Volume2,
  BellRing,
  ShieldCheck,
  FastForward,
  RotateCcw,
  Sparkles,
  Save,
  Trash2,
  Plus,
  Radio,
  Clock,
  Layers,
  Megaphone,
} from 'lucide-react';
import { playSchoolChime, announceViaTTS, ChimeType } from '../utils/audioChime';
import { DEFAULT_SCHEDULES, DEFAULT_KIOSK_SETTINGS } from '../data/defaultSchedule';

interface AdminScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: Record<'grade1_2' | 'grade3', GradeSchedule>;
  onUpdateSchedule: (newSchedules: Record<'grade1_2' | 'grade3', GradeSchedule>) => void;
  announcements: Announcement[];
  onUpdateAnnouncements: (announcements: Announcement[]) => void;
  settings: KioskSettings;
  onUpdateSettings: (settings: KioskSettings) => void;
  onTriggerBroadcastBell: (type: string, message: string) => void;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
}

export const AdminScheduleModal: React.FC<AdminScheduleModalProps> = ({
  isOpen,
  onClose,
  schedules,
  onUpdateSchedule,
  announcements,
  onUpdateAnnouncements,
  settings,
  onUpdateSettings,
  onTriggerBroadcastBell,
  wakeLockActive,
  onToggleWakeLock,
}) => {
  const [activeTab, setActiveTab] = useState<'bell' | 'simulator' | 'announcements' | 'edit-schedule' | 'kiosk'>('bell');

  // Simulator state
  const [simHour, setSimHour] = useState('07');
  const [simMinute, setSimMinute] = useState('44');
  const [simSecond, setSimSecond] = useState('55');

  // Announcement state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  // Edit schedule state
  const [editGrade, setEditGrade] = useState<'grade1_2' | 'grade3'>('grade1_2');
  const [editDay, setEditDay] = useState<DayOfWeek>('SENIN');

  if (!isOpen) return null;

  const handleApplySimulatedTime = () => {
    const formatted = `${simHour.padStart(2, '0')}:${simMinute.padStart(2, '0')}:${simSecond.padStart(2, '0')}`;
    onUpdateSettings({
      ...settings,
      simulatedTime: formatted,
    });
  };

  const handleClearSimulation = () => {
    onUpdateSettings({
      ...settings,
      simulatedTime: null,
    });
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      priority: newAnnPriority,
      createdAt: new Date().toISOString(),
      active: true,
    };

    onUpdateAnnouncements([newAnn, ...announcements]);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleDeleteAnnouncement = (id: string) => {
    onUpdateAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const handleLessonChange = (index: number, field: keyof LessonPeriod, value: any) => {
    const updatedSchedules = { ...schedules };
    const currentList = [...updatedSchedules[editGrade].schedule[editDay]];
    currentList[index] = {
      ...currentList[index],
      [field]: value,
    };
    updatedSchedules[editGrade].schedule[editDay] = currentList;
    onUpdateSchedule(updatedSchedules);
  };

  const handleResetSchedule = () => {
    if (window.confirm('Kembalikan seluruh jadwal ke format resmi kurikulum IIQBS?')) {
      onUpdateSchedule(DEFAULT_SCHEDULES);
      onUpdateSettings(DEFAULT_KIOSK_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <IQBSLogo className="w-10 h-10" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Pusat Kendali Jadwal & Kiosk IQBS
              </h2>
              <p className="text-xs text-slate-400">
                Pengaturan bel otomatis, anti mati layar, pengumuman & simulasi waktu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 overflow-x-auto no-scrollbar bg-slate-950/30">
          <button
            onClick={() => setActiveTab('bell')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer ${
              activeTab === 'bell'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Bel & Suara</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FastForward className="w-4 h-4" />
            <span>Simulasi Waktu</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer ${
              activeTab === 'announcements'
                ? 'border-teal-500 text-teal-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Warta & Marquee</span>
          </button>

          <button
            onClick={() => setActiveTab('edit-schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer ${
              activeTab === 'edit-schedule'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Edit Jadwal</span>
          </button>

          <button
            onClick={() => setActiveTab('kiosk')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 cursor-pointer ${
              activeTab === 'kiosk'
                ? 'border-purple-500 text-purple-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Anti Mati Layar</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB: BEL & SUARA */}
          {activeTab === 'bell' && (
            <div className="space-y-6">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Notifikasi Suara Bel Otomatis</h3>
                    <p className="text-xs text-slate-400">
                      Berbunyi otomatis pada setiap awal dan akhir jam pelajaran santri
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundChimeEnabled}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, soundChimeEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Chime Sound Style Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Pilihan Karakter Suara Bel:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'pesantren',
                        title: 'Genta Pesantren (4 Nada Harmonis)',
                        desc: 'Nada merdu lembut Islami bernuansa damai',
                      },
                      {
                        id: 'westminster',
                        title: 'Westminster Clock Chime',
                        desc: 'Chime klasik 4-nada menara jam Inggris',
                      },
                      {
                        id: 'school_bell',
                        title: 'Bel Sekolah Akustik',
                        desc: 'Nada ganda bel sekolah jernih',
                      },
                      {
                        id: 'soft_chime',
                        title: 'Soft Dual-Ding',
                        desc: 'Dua nada lembut tidak mengagetkan',
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onUpdateSettings({ ...settings, chimeType: item.id as ChimeType });
                          playSchoolChime(item.id as ChimeType, settings.chimeVolume);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          settings.chimeType === item.id
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${settings.chimeType === item.id ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Volume Bel Audio:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {Math.round(settings.chimeVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.chimeVolume}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, chimeVolume: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Voice Announcement TTS */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Pengumuman Suara (Text-to-Speech Bahasa Indonesia)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Menyebutkan nama mata pelajaran dan ustadz pengampu setiap bel berbunyi
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ttsAnnouncementEnabled}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, ttsAnnouncementEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </div>
              </div>

              {/* Broadcast Bell Button */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-900/50 space-y-3">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Bunyikan Bel Darurat / Siaran Manual ke Seluruh Layar
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Klik tombol di bawah untuk membunyikan bel seketika pada semua layar tablet dan smart TV di pondok pesantren secara tersinkronisasi.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() =>
                      onTriggerBroadcastBell(settings.chimeType, 'Bel Siaran Manual Dari Pengurus Pesantren')
                    }
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <BellRing className="w-4 h-4" />
                    <span>Bunyikan Bel Sekarang</span>
                  </button>

                  <button
                    onClick={() =>
                      announceViaTTS(
                        'Panggilan kepada seluruh santri untuk berkumpul di aula utama pondok pesantren IIQBS.'
                      )
                    }
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Uji Suara Pengumuman</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SIMULATOR WAKTU */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FastForward className="w-4 h-4 text-amber-400" />
                    Simulasi Waktu (Time Travel)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan fitur ini untuk mendemonstrasikan atau menguji pergantian jam pelajaran dan bunyi bel otomatis tanpa harus menunggu jam sebenarnya.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 p-2 rounded-xl">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={simHour}
                      onChange={(e) => setSimHour(e.target.value)}
                      className="w-12 bg-transparent text-center font-mono font-bold text-lg text-white focus:outline-none"
                    />
                    <span className="font-bold text-slate-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={simMinute}
                      onChange={(e) => setSimMinute(e.target.value)}
                      className="w-12 bg-transparent text-center font-mono font-bold text-lg text-white focus:outline-none"
                    />
                    <span className="font-bold text-slate-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={simSecond}
                      onChange={(e) => setSimSecond(e.target.value)}
                      className="w-12 bg-transparent text-center font-mono font-bold text-lg text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleApplySimulatedTime}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    Terapkan Jam Simulasi
                  </button>

                  {settings.simulatedTime && (
                    <button
                      onClick={handleClearSimulation}
                      className="px-4 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembalikan ke Waktu Riil</span>
                    </button>
                  )}
                </div>

                {/* Preset Testing Quick Buttons */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Pintasan Pengujian Jam Penting IIQBS (5 detik sebelum bel):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '07:44:55 (Jam Ke-1 Mulai)', h: '07', m: '44', s: '55' },
                      { label: '09:04:55 (Masuk Istirahat)', h: '09', m: '04', s: '55' },
                      { label: '09:14:55 (Jam Ke-3 Mulai)', h: '09', m: '14', s: '55' },
                      { label: '11:59:55 (Sholat Dzuhur)', h: '11', m: '59', s: '55' },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSimHour(p.h);
                          setSimMinute(p.m);
                          setSimSecond(p.s);
                          onUpdateSettings({
                            ...settings,
                            simulatedTime: `${p.h}:${p.m}:${p.s}`,
                          });
                        }}
                        className="p-2 text-left rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WARTA & MARQUEE */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              {/* Edit Marquee */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Teks Berjalan Layar Kiosk (Marquee Ticker)</h3>
                <textarea
                  value={settings.runningText}
                  onChange={(e) => onUpdateSettings({ ...settings, runningText: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Add New Announcement */}
              <form onSubmit={handleAddAnnouncement} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Tambah Pengumuman Pesantren Baru
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Judul pengumuman..."
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newAnnPriority}
                      onChange={(e) => setNewAnnPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="normal">Prioritas Normal</option>
                      <option value="important">Penting</option>
                      <option value="urgent">Mendesak (Urgent)</option>
                    </select>
                  </div>
                </div>

                <textarea
                  placeholder="Isi pesan pengumuman untuk para santri dan asatidz..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Publikasikan Pengumuman
                </button>
              </form>

              {/* Existing Announcements List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Pengumuman Aktif ({announcements.length})
                </h4>
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ann.title}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            ann.priority === 'urgent'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : ann.priority === 'important'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ann.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{ann.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EDIT JADWAL */}
          {activeTab === 'edit-schedule' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                  >
                    <option value="grade1_2">Kelas 1 & 2 (1st & 2nd Grade)</option>
                    <option value="grade3">Kelas 3 (3rd Grade)</option>
                  </select>

                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                  >
                    {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'SABTU'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ schedules, announcements, settings }, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `jadwal_iiqbs_${new Date().toISOString().slice(0,10)}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                    title="Unduh seluruh data jadwal sebagai file JSON"
                  >
                    <span>Download Backup JSON</span>
                  </button>

                  <button
                    onClick={handleResetSchedule}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 rounded-lg transition cursor-pointer"
                  >
                    Reset Default IIQBS
                  </button>
                </div>
              </div>

              {/* Editable Table */}
              <div className="space-y-2">
                {schedules[editGrade]?.schedule[editDay]?.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs"
                  >
                    <div className="font-bold text-emerald-400 sm:col-span-1">
                      {lesson.periodNumber ? `Jam #${lesson.periodNumber}` : lesson.type}
                    </div>

                    <div className="flex items-center gap-1 sm:col-span-1">
                      <input
                        type="text"
                        value={lesson.startTime}
                        onChange={(e) => handleLessonChange(idx, 'startTime', e.target.value)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white text-[11px]"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        value={lesson.endTime}
                        onChange={(e) => handleLessonChange(idx, 'endTime', e.target.value)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white text-[11px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={lesson.subject}
                        onChange={(e) => handleLessonChange(idx, 'subject', e.target.value)}
                        placeholder="Nama Pelajaran"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-semibold text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={lesson.teacher}
                        onChange={(e) => handleLessonChange(idx, 'teacher', e.target.value)}
                        placeholder="Ustadz / Pengampu"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KIOSK & ANTI MATI LAYAR */}
          {activeTab === 'kiosk' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Fitur Anti Mati Layar (Screen Wake Lock 24/7)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Mencegah smart TV atau tablet digital signage mati/terkunci otomatis saat idle.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onToggleWakeLock}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      wakeLockActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {wakeLockActive ? 'Aktif (Keep Awake)' : 'Nonaktif'}
                  </button>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-200">
                  <p className="font-semibold">💡 Tips Display Pesantren:</p>
                  <p className="text-slate-300 mt-1">
                    Gunakan browser Google Chrome / Edge dalam mode Fullscreen (tekan F11 atau tombol Fullscreen di header) agar jadwal tampil maksimal di layar TV dinding tanpa terganggu bilah alamat web.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Perubahan disinkronkan otomatis ke server pusat & tersimpan offline
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
