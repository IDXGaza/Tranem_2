
import React from 'react';
import { Track } from '../types';

interface SidebarProps {
  onImport: (file: File) => void;
  onRemove: (id: string) => void;
  tracks: Track[];
  currentId: string | null;
  onSelect: (index: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onImport, onRemove, tracks, currentId, onSelect, isOpen, onClose }) => {
  const favoriteTracks = tracks.filter(t => t.isFavorite);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('audio/')) {
      onImport(file);
      e.target.value = '';
      if (onClose) onClose();
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] xl:hidden transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <aside className={`fixed xl:relative inset-y-0 right-0 w-[85%] sm:w-80 bg-white/95 backdrop-blur-xl border-l border-slate-100 flex flex-col shadow-2xl xl:shadow-none z-[70] transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}>
        <div className="p-8 shrink-0 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-[#4da8ab] tracking-tighter">ترانيم</h1>
            <button onClick={onClose} className="xl:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <label className="block w-full">
            <div className="relative w-full bg-[#4da8ab] hover:bg-[#3d8c8e] text-white font-bold py-5 rounded-[24px] transition-all shadow-lg flex items-center justify-center gap-3 overflow-hidden text-sm active:scale-[0.98] cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              <span>استيراد لحن</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" onChange={handleFileChange} />
            </div>
          </label>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pb-40 space-y-10 scroll-container">
          {favoriteTracks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-500/60 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">المفضلة</span>
                <div className="flex-1 h-px bg-rose-100" />
              </div>
              <div className="space-y-2">
                {favoriteTracks.map(track => (
                  <button 
                    key={track.id}
                    onClick={() => { onSelect(tracks.indexOf(track)); if (onClose) onClose(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 ${currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab] shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <img src={track.coverUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                    <span className="truncate font-bold text-xs flex-1 text-right">{track.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300 px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">مكتبتك</span>
              <div className="flex-1 h-px bg-slate-50" />
            </div>
            <div className="space-y-2">
              {tracks.length === 0 ? (
                <div className="px-6 py-10 text-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold">لا يوجد ملفات</p>
                </div>
              ) : (
                tracks.map((track, idx) => (
                  <div key={track.id} className="group flex items-center gap-1">
                    <button 
                      onClick={() => { onSelect(idx); if (onClose) onClose(); }}
                      className={`flex-1 flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 ${currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab] shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <img src={track.coverUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                      <div className="flex-1 min-w-0 text-right">
                        <p className="truncate font-bold text-xs">{track.name}</p>
                        <p className="text-[9px] opacity-40 font-bold uppercase mt-1">Audio File</p>
                      </div>
                    </button>
                    <button onClick={() => onRemove(track.id)} className="p-3 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
