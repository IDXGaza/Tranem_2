
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
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-5 md:py-8 flex flex-col gap-4">
      {/* 1. Progress Bar - Top Level */}
      <div className="w-full flex items-center gap-4">
        <span className="text-[11px] font-bold text-slate-400 w-12 text-right tabular-nums">{formatTime(state.currentTime)}</span>
        <div className="flex-1 relative h-8 flex items-center group touch-none">
          <input 
            type="range"
            min={0}
            max={track.duration || 100}
            value={state.currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ direction: 'rtl' }}
          />
          <div className="w-full h-2 bg-slate-100 rounded-full relative overflow-hidden pointer-events-none">
            <div 
              className="absolute right-0 top-0 h-full bg-[#4da8ab] rounded-full transition-all duration-100" 
              style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }}
            />
          </div>
          {/* Custom Handle for Progress */}
          <div 
            className="absolute w-4 h-4 bg-white border-2 border-[#4da8ab] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden sm:block"
            style={{ right: `calc(${(state.currentTime / (track.duration || 1)) * 100}% - 8px)` }}
          ></div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 w-12 text-left tabular-nums">{formatTime(track.duration)}</span>
      </div>

      {/* 2. Main Controls Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        
        {/* Left: Track Details (Visible on Tablets/Desktop) */}
        <div className="hidden sm:flex w-full md:w-1/3 items-center gap-4 order-last md:order-last">
          <img src={track.coverUrl} className="w-14 h-14 rounded-2xl object-cover shadow-md shrink-0 border border-slate-50" alt="" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold truncate text-slate-800 text-sm md:text-base leading-tight break-all">{track.name}</h4>
            <p className="text-[11px] text-[#4da8ab] font-bold opacity-60 truncate mt-1">{track.artist}</p>
          </div>
          <button 
            onClick={onToggleFavorite} 
            className={`p-3 transition-transform active:scale-90 rounded-full hover:bg-slate-50 ${track.isFavorite ? 'text-rose-500' : 'text-slate-300'}`}
          >
            <svg className="w-6 h-6" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center justify-center gap-8 md:gap-12 order-1 md:order-2">
          {/* Skip Buttons with larger hit areas */}
          <button onClick={() => onSkip(10)} className="text-slate-400 hover:text-[#4da8ab] p-3 transition-all active:scale-90">
            <svg className="w-9 h-9 md:w-11 md:h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
              <text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>

          <button 
            onClick={onPlayPause}
            className="w-14 h-14 md:w-18 md:h-18 rounded-[24px] bg-[#4da8ab] text-white flex items-center justify-center shadow-xl shadow-[#4da8ab]/25 hover:scale-105 active:scale-95 transition-all"
          >
            {state.isPlaying ? (
              <svg className="w-7 h-7 md:w-9 md:h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-7 h-7 md:w-9 md:h-9 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button onClick={() => onSkip(-10)} className="text-slate-400 hover:text-[#4da8ab] p-3 transition-all active:scale-90">
            <svg className="w-9 h-9 md:w-11 md:h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              <text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>
        </div>

        {/* Right: Tools & Speed (Visible on Desktop) */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-5 order-2 md:order-first">
          <button 
            onClick={onAddTimestamp} 
            className="p-3 text-[#4da8ab] hover:bg-[#4da8ab]/5 rounded-2xl transition-all active:scale-90 flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">إضافة علامة</span>
          </button>
          
          <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
          
          <select 
            value={state.playbackRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 px-4 py-2.5 rounded-xl outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default Player;
