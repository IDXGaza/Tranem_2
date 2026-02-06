
import React from 'react';
import { Track } from '../types';

interface SidebarProps {
  onImport: (file: File) => void;
  tracks: Track[];
  currentId: string | null;
  onSelect: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onImport, tracks, currentId, onSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التأكد من أن الملف صوتي قبل تمريره
      if (file.type.startsWith('audio/')) {
        onImport(file);
      } else {
        alert("يرجى اختيار ملف صوتي صالح (MP3, WAV, etc.)");
      }
      // إعادة تعيين القيمة للسماح باختيار نفس الملف مرة أخرى إذا لزم الأمر
      e.target.value = '';
    }
  };

  const favorites = tracks.filter(t => t.isFavorite);

  return (
    <aside className="w-80 bg-white border-l border-slate-100 flex flex-col shadow-sm">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4da8ab] to-[#3a8e91] flex items-center justify-center shadow-lg shadow-[#4da8ab]/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ترانيم</h1>
        </div>
        
        <label className="group relative block w-full">
          <div className="absolute -inset-0.5 bg-[#4da8ab] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <button className="relative w-full bg-[#4da8ab] hover:bg-[#3d8b8d] text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 overflow-hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            استيراد لحن
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="audio/*" 
              onChange={handleFileChange} 
            />
          </button>
        </label>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="space-y-8">
          {favorites.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">المفضلة</h3>
              <div className="space-y-1">
                {favorites.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onSelect(tracks.findIndex(t => t.id === track.id))}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl text-right transition-all group ${
                      currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab]' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <img src={track.coverUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm">{track.name}</p>
                      <p className="text-[11px] opacity-60">مفضلة</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">مكتبتك</h3>
            <div className="space-y-1">
              {tracks.length === 0 ? (
                <div className="px-4 py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 text-xs">لا توجد ألحان بعد</p>
                </div>
              ) : (
                tracks.map((track, idx) => (
                  <button
                    key={track.id}
                    onClick={() => onSelect(idx)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl text-right transition-all group ${
                      currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab]' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <img src={track.coverUrl} className={`w-full h-full object-cover transition-opacity ${currentId === track.id ? 'opacity-30' : 'opacity-80'}`} />
                      {currentId === track.id && (
                        <div className="absolute inset-0 flex gap-0.5 items-center justify-center">
                          <div className="w-1 h-3 bg-[#4da8ab] rounded-full animate-pulse"></div>
                          <div className="w-1 h-5 bg-[#4da8ab] rounded-full animate-pulse [animation-delay:0.2s]"></div>
                          <div className="w-1 h-2 bg-[#4da8ab] rounded-full animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm">{track.name}</p>
                      <p className="text-[11px] opacity-50">لحن صوتي</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
