
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
    <div className="w-full flex flex-col py-3 md:py-4 px-4 md:px-6">
      
      {/* Progress Bar (Higher and more precise) */}
      <div className="w-full flex items-center gap-3 mb-1">
        <span className="text-[9px] font-bold text-slate-400 tabular-nums min-w-[30px]">{formatTime(state.currentTime)}</span>
        <div className="flex-1 relative h-4 flex items-center touch-none group">
          <input 
            type="range" min={0} max={track.duration || 100} value={state.currentTime} 
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ direction: 'rtl' }}
          />
          <div className="w-full h-1 bg-slate-100 rounded-full relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full bg-[#4da8ab] rounded-full transition-all duration-100" style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }} />
          </div>
        </div>
        <span className="text-[9px] font-bold text-slate-400 tabular-nums min-w-[30px] text-left">{formatTime(track.duration)}</span>
      </div>

      {/* Main Controls Section (Thinner/Raised) */}
      <div className="flex items-center justify-between">
        
        {/* Info Area (Compact) */}
        <div className="hidden sm:flex w-[150px] items-center gap-2 overflow-hidden">
          <img src={track.coverUrl} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-100" alt="" />
          <div className="min-w-0">
             <h4 className="font-bold truncate text-slate-800 text-[10px]">{track.name}</h4>
          </div>
        </div>

        {/* Playback Controls (Smaller Icons) */}
        <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
          <button onClick={() => onSkip(10)} className="text-slate-400 p-1.5 active:scale-90 transition-transform clickable">
             <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" /><text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>

          <button onClick={onPlayPause} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#4da8ab] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all clickable">
            {state.isPlaying ? <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-5 h-5 md:w-6 md:h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
          </button>

          <button onClick={() => onSkip(-10)} className="text-slate-400 p-1.5 active:scale-90 transition-transform clickable">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" /><text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
            </svg>
          </button>
        </div>

        {/* Options (More Compact) */}
        <div className="flex items-center justify-end gap-1 md:gap-3 w-[150px]">
          <button onClick={onAddTimestamp} className="p-1.5 text-[#4da8ab] hover:bg-[#4da8ab]/5 rounded-lg hidden md:block clickable">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
          </button>
          
          <select value={state.playbackRate} onChange={(e) => onRateChange(Number(e.target.value))} className="bg-slate-50 text-[9px] font-bold text-slate-500 px-1.5 py-1 rounded-md outline-none clickable border border-slate-100">
            <option value="0.5">.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option>
          </select>
          
          <button onClick={onToggleFavorite} className={`p-1.5 clickable ${track.isFavorite ? 'text-rose-500' : 'text-slate-300'}`}>
            <svg className="w-5 h-5" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
