
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
    <div className="w-full flex flex-col px-4 md:px-12 py-4 md:py-6 bg-white/95 backdrop-blur-md">
      {/* Progress Bar Area */}
      <div className="w-full flex items-center gap-4 mb-2 md:mb-4">
        <span className="text-[10px] font-bold text-slate-400 w-10 text-right tabular-nums">{formatTime(state.currentTime)}</span>
        <div className="flex-1 relative h-6 flex items-center group">
          <input 
            type="range"
            min={0}
            max={track.duration || 100}
            value={state.currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ direction: 'rtl' }}
          />
          <div className="w-full h-1.5 bg-slate-100 rounded-full relative overflow-hidden pointer-events-none">
            <div 
              className="absolute right-0 top-0 h-full bg-[#4da8ab] rounded-full transition-all duration-100" 
              style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }}
            />
          </div>
          {/* Knob indicator */}
          <div 
            className="absolute w-3.5 h-3.5 bg-white border-2 border-[#4da8ab] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            style={{ right: `calc(${(state.currentTime / (track.duration || 1)) * 100}% - 7px)` }}
          ></div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 w-10 text-left tabular-nums">{formatTime(track.duration)}</span>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Left/Order-Last (Track Info) */}
        <div className="w-full md:w-1/3 flex items-center gap-3 order-1 md:order-last">
          <img src={track.coverUrl} className="w-10 h-10 md:w-14 md:h-14 rounded-xl object-cover shadow-sm shrink-0 border border-slate-50" alt="" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold truncate text-slate-800 text-sm leading-tight">{track.name}</h4>
            <p className="text-[10px] text-[#4da8ab] font-medium opacity-70 truncate uppercase">{track.artist}</p>
          </div>
          <button 
            onClick={onToggleFavorite} 
            className={`p-2 transition-transform active:scale-90 ${track.isFavorite ? 'text-rose-500' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>

        {/* Center (Main Controls) */}
        <div className="flex items-center justify-center gap-6 md:gap-10 order-2">
          {/* 10s Forward Button (Actually skip forward icons usually look like clockwise) */}
          <button 
            onClick={() => onSkip(10)} 
            className="text-slate-400 hover:text-[#4da8ab] transition-all active:scale-90 p-1"
            title="تقديم 10 ثوان"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
              <text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>

          <button 
            onClick={onPlayPause}
            className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#4da8ab] text-white flex items-center justify-center shadow-lg shadow-[#4da8ab]/20 hover:scale-105 active:scale-95 transition-all"
          >
            {state.isPlaying ? (
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          {/* 10s Backward Button */}
          <button 
            onClick={() => onSkip(-10)} 
            className="text-slate-400 hover:text-[#4da8ab] transition-all active:scale-90 p-1"
            title="تأخير 10 ثوان"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              <text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>
        </div>

        {/* Right/Order-First (Secondary Tools) */}
        <div className="w-full md:w-1/3 flex items-center justify-between md:justify-start gap-4 order-3 md:order-first">
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={onAddTimestamp} 
              className="p-2 text-[#4da8ab] hover:bg-[#4da8ab]/5 rounded-xl transition-colors active:scale-90"
              title="إضافة علامة"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            </button>
            <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block"></div>
            <select 
              value={state.playbackRate}
              onChange={(e) => onRateChange(Number(e.target.value))}
              className="bg-slate-50 border border-slate-100 text-[10px] md:text-xs font-bold text-slate-500 px-3 py-1.5 md:py-2 rounded-xl outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
