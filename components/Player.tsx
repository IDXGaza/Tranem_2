
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
    <div className="fixed bottom-0 left-0 right-0 h-auto md:h-40 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex flex-col z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 md:p-0">
      {/* ProgressBar */}
      <div className="w-full px-4 md:px-12 pt-2 md:pt-6">
        <div className="flex items-center gap-4 md:gap-6">
           <span className="text-[9px] md:text-[10px] font-bold text-slate-400 w-8 md:w-12">{formatTime(state.currentTime)}</span>
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
            <div className="w-full h-1 md:h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
              <div 
                className="absolute right-0 top-0 h-full bg-gradient-to-l from-[#4da8ab] to-[#79c5c9] rounded-full transition-all duration-100" 
                style={{ width: `${(state.currentTime / (track.duration || 1)) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 w-8 md:w-12 text-left">{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 items-center px-4 md:px-12 pb-2 gap-4 md:gap-10">
        {/* Track Info (Hidden or repositioned on mobile) */}
        <div className="hidden md:flex w-1/3 items-center gap-4 order-last text-right">
          <img src={track.coverUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white" alt="" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold truncate text-slate-800 text-base">{track.name}</h4>
            <p className="text-xs text-[#4da8ab] font-medium opacity-80">{track.artist}</p>
          </div>
          <button onClick={onToggleFavorite} className={`transition-all p-2 rounded-full ${track.isFavorite ? 'text-rose-400' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill={track.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>

        {/* أزرار التحكم الرئيسية - تعديل الترتيب كما طلب في المرة السابقة مع مراعاة الحجم */}
        <div className="w-full md:flex-1 flex justify-between md:justify-center items-center gap-4 md:gap-8">
           {/* السرعة (على الجوال تظهر بجانب الأزرار) */}
           <div className="md:hidden">
              <select 
                value={state.playbackRate}
                onChange={(e) => onRateChange(Number(e.target.value))}
                className="bg-slate-50 text-[10px] font-bold text-slate-500 px-3 py-1 rounded-lg outline-none"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1.0x</option>
                <option value="1.5">1.5x</option>
              </select>
           </div>

           <div className="flex items-center gap-6 md:gap-8">
              {/* أيقونة التراجع (أصبحت تتقدم 10 ثواني) */}
              <button onClick={() => onSkip(10)} className="text-slate-400 hover:text-[#4da8ab]">
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
                  <text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
                </svg>
              </button>

              <button 
                onClick={onPlayPause}
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[20px] bg-[#4da8ab] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                {state.isPlaying ? (
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              {/* أيقونة التقدم (أصبحت تتراجع 10 ثواني) */}
              <button onClick={() => onSkip(-10)} className="text-slate-400 hover:text-[#4da8ab]">
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                  <text x="12" y="15.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">10</text>
                </svg>
              </button>
           </div>

           {/* زر إضافة علامة زمنية على الجوال */}
           <button onClick={onAddTimestamp} className="p-2 text-[#4da8ab] md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
           </button>
        </div>

        {/* Speed & Tools (Desktop only) */}
        <div className="hidden md:flex w-1/3 items-center justify-start order-first">
          <select 
            value={state.playbackRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="appearance-none bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 px-6 py-2 rounded-xl outline-none cursor-pointer"
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
