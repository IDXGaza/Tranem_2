
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('audio/')) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] xl:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed xl:relative inset-y-0 right-0 w-[85%] sm:w-80 bg-white border-l border-slate-100 flex flex-col shadow-2xl xl:shadow-none z-[70] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}>
        <div className="p-6 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">ترانيم</h1>
            <button onClick={onClose} className="xl:hidden p-2 text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <label className="block w-full">
            <button className="relative w-full bg-[#4da8ab] text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 overflow-hidden text-sm active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              استيراد لحن
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" onChange={handleFileChange} />
            </button>
          </label>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-12 space-y-6 scroll-container">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-2">مكتبتك</h3>
          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <div key={track.id} className="group flex items-center gap-1 pr-1">
                <button onClick={() => onSelect(idx)} className={`flex-1 flex items-center gap-3 p-3 rounded-xl text-right transition-all ${currentId === track.id ? 'bg-[#4da8ab]/10 text-[#4da8ab]' : 'hover:bg-slate-50 text-slate-600'}`}>
                   <img src={track.coverUrl} className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0 border border-white" alt="" />
                   <div className="flex-1 min-w-0">
                     <p className="truncate font-bold text-xs break-all">{track.name}</p>
                     <p className="text-[9px] opacity-40 font-bold mt-0.5">AUDIO FILE</p>
                   </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRemove(track.id); }} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
