
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
  hasError?: boolean;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

const Player: React.FC<PlayerProps> = ({ 
  track, state, onPlayPause, onSeek, onSkip, onRateChange, onToggleFavorite, onAddTimestamp, hasError 
}) => {
  if (!track) return null;

  return (
    <div className={`w-full flex flex-col py-3 px-6 md:px-10 transition-all duration-500 ${hasError ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
      
      <div className="w-full flex items-center gap-4 mb-2">
        <span className="text-[10px] font-black text-slate-400 tabular-nums w-10 text-right">
          {formatTime(state.currentTime)}
        </span>
        <div className="flex-1 relative h-6 flex items-center touch-none group">
          <input 
            type="range" min={0} max={track.duration || 100} value={state.currentTime} 
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ direction: 'rtl' }}
            disabled={hasError || state.isLoading}
          />
          <div className="w-full h-1.5 bg-slate-100/50 rounded-full relative overflow-hidden">
            <div 
              className={`absolute right-0 top-0 h-full bg-[#4da8ab] rounded-full transition-all duration-200 ${state.isLoading ? 'animate-pulse' : ''}`} 
              style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }} 
            />
          </div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#4da8ab] rounded-full shadow-md pointer-events-none transition-all group-hover:scale-125"
            style={{ right: `calc(${(state.currentTime / (track.duration || 1)) * 100}% - 6px)` }}
          />
        </div>
        <span className="text-[10px] font-black text-slate-400 tabular-nums w-10 text-left">
          {formatTime(track.duration)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 md:gap-5 flex-1 justify-start">
          <button 
            onClick={onToggleFavorite} 
            className={`p-2 transition-all active:scale-90 ${track.isFavorite ? 'text-rose-500' : 'text-slate-300'}`}
          >
            <svg className="w-6 h-6" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          <div className="relative group/rate">
            <select 
              value={state.playbackRate} 
              onChange={(e) => onRateChange(Number(e.target.value))} 
              className="bg-slate-50/50 hover:bg-slate-50 text-[10px] font-black text-slate-500 px-3 py-1.5 rounded-xl outline-none border border-slate-100 appearance-none cursor-pointer"
              disabled={hasError}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
               <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-10">
          <button onClick={() => onSkip(10)} className="text-slate-300 hover:text-slate-600 p-2 active:scale-90 transition-all" disabled={hasError || state.isLoading}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
              <text x="12" y="15.5" fontSize="6" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>

          <button 
            onClick={onPlayPause} 
            className={`w-14 h-14 md:w-16 md:h-16 rounded-[24px] flex items-center justify-center shadow-2xl active:scale-95 transition-all ${hasError ? 'bg-slate-200 text-slate-400' : 'bg-[#4da8ab] text-white'}`}
            disabled={hasError}
          >
            {state.isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : state.isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-7 h-7 translate-x-[-1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button onClick={() => onSkip(-10)} className="text-slate-300 hover:text-slate-600 p-2 active:scale-90 transition-all" disabled={hasError || state.isLoading}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              <text x="12" y="15.5" fontSize="6" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-end flex-1">
          <button 
            onClick={onAddTimestamp} 
            className="p-3 text-[#4da8ab] bg-[#4da8ab]/5 hover:bg-[#4da8ab]/10 rounded-2xl active:scale-90 transition-all"
            disabled={hasError || state.isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Player;
