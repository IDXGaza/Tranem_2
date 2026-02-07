
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
    <div className="w-full max-w-5xl mx-auto py-4 md:py-6 flex flex-col gap-3 px-4">
      
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <span className="text-[10px] font-bold text-slate-400 w-10 text-right tabular-nums">{formatTime(state.currentTime)}</span>
        <div className="flex-1 relative h-6 flex items-center touch-none group">
          <input 
            type="range" min={0} max={track.duration || 100} value={state.currentTime} 
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ direction: 'rtl' }}
          />
          <div className="w-full h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full bg-[#4da8ab] rounded-full transition-all duration-100" style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }} />
          </div>
          <div className="absolute w-3 h-3 bg-white border-2 border-[#4da8ab] rounded-full shadow-sm z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ right: `calc(${(state.currentTime / (track.duration || 1)) * 100}% - 6px)` }}></div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 w-10 text-left tabular-nums">{formatTime(track.duration)}</span>
      </div>

      {/* Controls Container */}
      <div className="flex items-center justify-between">
        
        {/* Info - Hidden on smallest mobile */}
        <div className="hidden sm:flex w-1/4 items-center gap-3 overflow-hidden">
          <img src={track.coverUrl} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100 shadow-sm" alt="" />
          <h4 className="font-bold truncate text-slate-800 text-xs">{track.name}</h4>
        </div>

        {/* Center Playback */}
        <div className="flex-1 sm:flex-none flex items-center justify-center gap-6 md:gap-10">
          <button onClick={() => onSkip(10)} className="text-slate-400 p-2 active:scale-90 transition-transform clickable">
             <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" /><text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>

          <button onClick={onPlayPause} className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#4da8ab] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform clickable">
            {state.isPlaying ? <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
          </button>

          <button onClick={() => onSkip(-10)} className="text-slate-400 p-2 active:scale-90 transition-transform clickable">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" /><text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>
        </div>

        {/* Tools */}
        <div className="w-1/4 flex items-center justify-end gap-3">
          <button onClick={onAddTimestamp} className="p-2 text-[#4da8ab] hidden md:block clickable"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" strokeWidth="2" strokeLinecap="round"/></svg></button>
          
          <select value={state.playbackRate} onChange={(e) => onRateChange(Number(e.target.value))} className="bg-slate-50 text-[10px] font-bold text-slate-500 px-2 py-1 rounded-lg outline-none clickable border border-slate-100">
            <option value="0.5">0.5x</option><option value="1">1.0x</option><option value="1.5">1.5x</option><option value="2">2x</option>
          </select>
          
          <button onClick={onToggleFavorite} className={`p-2 clickable ${track.isFavorite ? 'text-rose-500' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
