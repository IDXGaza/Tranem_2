
import React from 'react';
import { Track, PlayerState } from '../types';

interface PlayerProps {
  track: Track | null;
  state: PlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (seconds: number) => void;
  onRateChange: (rate: number) => void;
  onToggleFavorite: () => void;
  onAddTimestamp: () => void;
}

const formatTime = (time: number) => {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

const Player: React.FC<PlayerProps> = ({ 
  track, state, onPlayPause, onSeek, onSkip, onRateChange, onToggleFavorite, onAddTimestamp 
}) => {
  if (!track) return null;

  return (
    <div className="h-40 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex flex-col z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {/* ProgressBar */}
      <div className="w-full px-12 pt-6">
        <div className="flex items-center gap-6">
           <span className="text-[10px] font-bold text-slate-400 w-12">{formatTime(state.currentTime)}</span>
           <div className="flex-1 relative h-4 flex items-center group">
            <input 
              type="range"
              min={0}
              max={track.duration || 100}
              value={state.currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              onDoubleClick={(e) => {
                e.preventDefault();
                onAddTimestamp();
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              style={{ direction: 'rtl' }}
            />
            <div className="w-full h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
              <div 
                className="absolute right-0 top-0 h-full bg-gradient-to-l from-[#4da8ab] to-[#79c5c9] rounded-full transition-all duration-100 group-hover:h-full" 
                style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }}
              />
            </div>
            {/* Knob */}
            <div 
              className="absolute w-3 h-3 bg-[#4da8ab] border-2 border-white rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{ right: `calc(${(state.currentTime / (track.duration || 1)) * 100}% - 6px)` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 w-12 text-left">{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center px-12 pb-2 gap-10">
        <div className="w-1/3 flex items-center gap-4 order-last text-right">
          <img src={track.coverUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white" alt="" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold truncate text-slate-800 text-base">{track.name}</h4>
            <p className="text-xs text-[#4da8ab] font-medium opacity-80">{track.artist}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={onAddTimestamp}
              className="text-slate-300 hover:text-[#4da8ab] transition-all p-2 hover:bg-[#4da8ab]/5 rounded-full"
              title="إضافة علامة"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            </button>
            <button 
              onClick={onToggleFavorite}
              className={`transition-all p-2 rounded-full ${track.isFavorite ? 'text-rose-400 bg-rose-50' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'}`}
            >
              <svg className="w-6 h-6" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
        </div>

        {/* أزرار التحكم الرئيسية */}
        <div className="flex-1 flex justify-center items-center gap-8">
          {/* أيقونة التراجع (المحاطة بالدائرة الخضراء) أصبحت تتقدم 10 ثواني */}
          <button 
            onClick={() => onSkip(10)} 
            className="text-slate-300 hover:text-[#4da8ab] transition-all hover:scale-110 active:scale-90"
            title="تقديم 10 ثواني"
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
              <text x="12" y="15.5" fontSize="7" fontFamily="Cairo" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>

          <button 
            onClick={onPlayPause}
            className="w-14 h-14 rounded-[20px] bg-[#4da8ab] text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-[#4da8ab]/30 active:scale-95"
          >
            {state.isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          {/* أيقونة التقدم أصبحت تتراجع 10 ثواني */}
          <button 
            onClick={() => onSkip(-10)} 
            className="text-slate-300 hover:text-[#4da8ab] transition-all hover:scale-110 active:scale-90"
            title="تأخير 10 ثواني"
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              <text x="12" y="15.5" fontSize="7" fontFamily="Cairo" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>
        </div>

        <div className="w-1/3 flex items-center justify-start order-first">
          <div className="relative group">
            <select 
              value={state.playbackRate}
              onChange={(e) => onRateChange(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 px-6 py-2 rounded-xl outline-none cursor-pointer hover:bg-white transition-all pr-10"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#4da8ab]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
