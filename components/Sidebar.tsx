
import React from 'react';
import { Track } from '../types';

interface SidebarProps {
  onImport: (file: File) => void;
  tracks: Track[];
  currentId: string | null;
  onSelect: (index: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onImport, tracks, currentId, onSelect, isOpen, onClose }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onImport(file);
      e.target.value = '';
    }
  };

  const favorites = tracks.filter(t => t.isFavorite);

  return (
    <>
      {/* Dynamic Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] xl:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose}
      />

      <aside className={`
        fixed xl:relative inset-y-0 right-0 w-[85%] sm:w-80 lg:w-96 bg-white border-l border-slate-100 flex flex-col shadow-2xl xl:shadow-none z-[70] transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        <div className="p-8 shrink-0">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#4da8ab] to-[#3a8e91] flex items-center justify-center shadow-lg shadow-[#4da8ab]/20">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tighter">ترانيم</h1>
            </div>
            <button onClick={onClose} className="xl:hidden p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all active:scale-90">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <label className="group relative block w-full">
            <div className="absolute -inset-1.5 bg-[#4da8ab] rounded-[24px] blur-lg opacity-0 group-hover:opacity-10 transition duration-500"></div>
            <button className="relative w-full bg-[#4da8ab] hover:bg-[#3d8b8d] text-white font-bold py-4 md:py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden text-sm md:text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              استيراد لحن جديد
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="audio/*" 
                onChange={handleFileChange} 
              />
            </button>
          </label>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pb-12 space-y-10 custom-scrollbar">
          {favorites.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300 mb-5 px-3">المفضلة</h3>
              <div className="space-y-2">
                {favorites.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onSelect(tracks.findIndex(t => t.id === track.id))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-right transition-all group ${
                      currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab]' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <img src={track.coverUrl} className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border-2 border-white" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm break-all">{track.name}</p>
                      <p className="text-[10px] opacity-60 uppercase font-black mt-1">Lyrical</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300 mb-5 px-3">مكتبتك الصوتية</h3>
            <div className="space-y-2">
              {tracks.length === 0 ? (
                <div className="px-6 py-16 text-center border-2 border-dashed border-slate-100 rounded-[32px] mx-2">
                  <p className="text-slate-300 text-xs font-bold leading-relaxed">اسحب الملفات هنا أو اضغط للاستيراد</p>
                </div>
              ) : (
                tracks.map((track, idx) => (
                  <button
                    key={track.id}
                    onClick={() => onSelect(idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-right transition-all group ${
                      currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab]' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 relative overflow-hidden border border-slate-100">
                      <img src={track.coverUrl} className={`w-full h-full object-cover transition-opacity duration-700 ${currentId === track.id ? 'opacity-20' : 'opacity-100'}`} />
                      {currentId === track.id && (
                        <div className="absolute inset-0 flex gap-1 items-center justify-center">
                          <div className="w-1 h-3 bg-[#4da8ab] rounded-full animate-bounce [animation-duration:0.6s]"></div>
                          <div className="w-1 h-6 bg-[#4da8ab] rounded-full animate-bounce [animation-duration:0.8s]"></div>
                          <div className="w-1 h-2 bg-[#4da8ab] rounded-full animate-bounce [animation-duration:0.4s]"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm break-all">{track.name}</p>
                      <p className="text-[10px] opacity-40 uppercase font-black mt-1">Audio Track</p>
                    </div>
                  </button>
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
