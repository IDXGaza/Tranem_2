
import React from 'react';
import { Timestamp } from '../types';

interface TimestampManagerProps {
  timestamps: Timestamp[];
  onRemove: (id: string) => void;
  onSeek: (time: number) => void;
  currentTime: number;
}

const toArabicIndic = (num: number) => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => digits[parseInt(d)] || d).join('');
};

const TimestampManager: React.FC<TimestampManagerProps> = ({ 
  timestamps, onRemove, onSeek 
}) => {
  return (
    <div className="bg-white/40 rounded-[30px] md:rounded-[40px] p-6 md:p-10 border border-white shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <h3 className="font-bold text-lg md:text-xl text-slate-800">العلامات المحفوظة</h3>
        <span className="bg-[#4da8ab] text-white text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
           {toArabicIndic(timestamps.length)} علامات
        </span>
      </div>

      <div className="space-y-3 md:space-y-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
        {timestamps.length === 0 ? (
          <div className="py-12 md:py-20 text-center opacity-30">
            <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-xs">احفظ اللحظات المميزة للعودة إليها لاحقاً</p>
          </div>
        ) : (
          [...timestamps].sort((a, b) => a.time - b.time).map((ts, index) => (
            <div 
              key={ts.id} 
              className="flex items-center justify-between p-3 md:p-4 bg-white/60 hover:bg-white rounded-2xl md:rounded-3xl border border-transparent transition-all group shadow-sm"
            >
              <button 
                onClick={() => onRemove(ts.id)}
                className="text-slate-300 hover:text-rose-400 p-1 md:opacity-0 md:group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <button 
                onClick={() => onSeek(ts.time)}
                className="text-lg md:text-2xl font-bold tracking-wider text-[#4da8ab] hover:scale-105 transition-transform"
                style={{ direction: 'ltr' }}
              >
                {toArabicIndic(Math.floor(ts.time / 3600)).padStart(2, '٠')}:
                {toArabicIndic(Math.floor((ts.time % 3600) / 60)).padStart(2, '٠')}:
                {toArabicIndic(Math.floor(ts.time % 60)).padStart(2, '٠')}
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-100 px-2 md:px-3 py-1 rounded-full">
                    {ts.label}
                 </span>
                 <span className="text-xl md:text-2xl font-black text-slate-200">
                    {toArabicIndic(index + 1)}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TimestampManager;
