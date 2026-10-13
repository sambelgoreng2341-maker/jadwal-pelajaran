import React from 'react';
import { Announcement } from '../types/schedule';
import { X, Megaphone, Bell, Calendar, Sparkles } from 'lucide-react';

interface AnnouncementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

export const AnnouncementsDrawer: React.FC<AnnouncementsDrawerProps> = ({
  isOpen,
  onClose,
  announcements,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Warta & Pengumuman Pesantren</h3>
              <p className="text-xs text-slate-400">Informasi resmi asatidz dan pengasuhan IIQBS</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada pengumuman saat ini.
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-xl border transition-all ${
                  ann.priority === 'urgent'
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-100'
                    : ann.priority === 'important'
                    ? 'bg-amber-950/30 border-amber-800/50 text-amber-100'
                    : 'bg-slate-950/70 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{ann.title}</span>
                    <span
                      className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-500 text-slate-950'
                          : ann.priority === 'important'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ann.priority}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Dipublikasikan: {new Date(ann.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
