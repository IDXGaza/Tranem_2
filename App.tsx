
import React, { useState, useRef, useEffect } from 'react';
import { Track, Timestamp, PlayerState } from './types';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import TimestampManager from './components/TimestampManager';

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    playbackRate: 1,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const onEnded = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const onWaiting = () => setPlayerState(prev => ({ ...prev, isLoading: true }));
    const onPlaying = () => {
      setPlayerState(prev => ({ ...prev, isLoading: false }));
      if (audio) audio.playbackRate = playerState.playbackRate;
    };
    
    const onCanPlay = () => {
      setLoadError(null);
      setPlayerState(prev => ({ ...prev, isLoading: false }));
      if (audio) audio.playbackRate = playerState.playbackRate;
    };

    const onLoadedMetadata = () => {
      if (audio && currentTrackIndex !== null) {
        setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, duration: audio.duration } : t));
        audio.playbackRate = playerState.playbackRate;
      }
    };

    const onError = () => {
      setLoadError("فشل تشغيل المقطع. تأكد من أن الملف سليم.");
      setPlayerState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrack?.url, currentTrackIndex, playerState.playbackRate]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (loadError) {
      audioRef.current.load();
      setLoadError(null);
    }
    if (playerState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setLoadError("تعذر التشغيل."));
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !playerState.isPlaying }));
  };

  const handleRateChange = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  const handleToggleFavorite = () => {
    if (currentTrackIndex === null) return;
    setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const handleUpdateName = () => {
    if (currentTrackIndex === null || !currentTrack) return;
    const newName = prompt("تعديل اسم المقطع:", currentTrack.name);
    if (newName && newName.trim() !== "") {
      setTracks(prev => prev.map((t, idx) => 
        idx === currentTrackIndex ? { ...t, name: newName.trim() } : t
      ));
    }
  };

  const handleUpdateCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentTrackIndex !== null) {
      const newCoverUrl = URL.createObjectURL(file);
      setTracks(prev => prev.map((t, idx) => 
        idx === currentTrackIndex ? { ...t, coverUrl: newCoverUrl } : t
      ));
    }
  };

  const handleAddTimestamp = () => {
    if (currentTrackIndex === null || !audioRef.current) return;
    const time = audioRef.current.currentTime;
    const label = prompt("وصف العلامة:") || `علامة زمنية`;
    const newTimestamp: Timestamp = {
      id: Math.random().toString(36).substr(2, 9),
      time,
      label
    };
    setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, timestamps: [...t.timestamps, newTimestamp] } : t));
  };

  const handleRemoveTimestamp = (timestampId: string) => {
    if (currentTrackIndex === null) return;
    setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, timestamps: t.timestamps.filter(ts => ts.id !== timestampId) } : t));
  };

  const addTrack = async (file: File) => {
    const name = file.name.replace(/\.[^/.]+$/, "");
    const newTrack: Track = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      artist: "",
      url: URL.createObjectURL(file),
      coverUrl: `https://picsum.photos/seed/${Math.random()}/600/600`,
      isFavorite: false,
      timestamps: [],
      duration: 0,
      playbackRate: 1,
    };
    setTracks(prev => {
      const updated = [...prev, newTrack];
      setCurrentTrackIndex(updated.length - 1);
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#f8fafb] text-slate-700 overflow-hidden font-cairo watercolor-bg relative">
      <header className="flex lg:hidden items-center justify-between p-4 bg-white/80 backdrop-blur-lg border-b border-slate-100 shrink-0 z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#4da8ab] active:scale-95 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-xl font-black text-[#4da8ab]">ترانيم</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          onImport={addTrack} 
          onRemove={(id) => setTracks(prev => {
            const newTracks = prev.filter(t => t.id !== id);
            if (newTracks.length === 0) setCurrentTrackIndex(null);
            else if (currentTrackIndex !== null && currentTrackIndex >= newTracks.length) setCurrentTrackIndex(newTracks.length - 1);
            return newTracks;
          })}
          tracks={tracks} 
          currentId={currentTrack?.id || null} 
          onSelect={setCurrentTrackIndex}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto scroll-container bg-transparent relative z-0">
          <div className="p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full flex flex-col items-center pb-80 md:pb-96">
            {currentTrack ? (
              <div className="w-full flex flex-col items-center space-y-6 md:space-y-10 animate-in fade-in duration-500">
                {/* منطقة الغلاف والعنوان */}
                <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full">
                  <div className="relative group w-full max-w-[200px] md:max-w-xs lg:max-w-sm">
                    {loadError && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md rounded-[32px] border border-rose-100 shadow-xl text-center">
                        <div className="px-2">
                          <p className="text-[10px] md:text-xs font-bold text-rose-500 mb-3">{loadError}</p>
                          <button onClick={() => audioRef.current?.load()} className="text-[10px] bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full font-black">تحديث</button>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative aspect-square w-full overflow-hidden rounded-[32px] md:rounded-[48px] shadow-2xl border-[4px] border-white group-hover:scale-[1.02] transition-all duration-500">
                      <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleUpdateCover} />
                    </div>
                  </div>
                  
                  <div className="text-center w-full group/title px-4">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-lg md:text-2xl font-black text-slate-800 leading-tight truncate max-w-[85%]">{currentTrack.name}</h1>
                      <button onClick={handleUpdateName} className="p-1.5 text-slate-300 hover:text-[#4da8ab] transition-colors md:opacity-0 group-hover/title:opacity-100">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* قائمة العلامات الزمنية */}
                <div className="w-full max-w-2xl px-2 z-10">
                  <TimestampManager 
                    timestamps={currentTrack.timestamps} 
                    onRemove={handleRemoveTimestamp} 
                    onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)} 
                    currentTime={playerState.currentTime} 
                  />
                </div>
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-6 opacity-40">
                <div className="w-20 h-20 bg-[#4da8ab]/5 rounded-[24px] flex items-center justify-center text-[#4da8ab]/30">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
                <h2 className="text-lg font-black text-slate-800">مكتبتك خالية</h2>
                <p className="text-xs max-w-xs leading-relaxed">استورد ألحانك المفضلة لتبدأ تجربة ترانيم</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* منطقة المشغل العائم في الأسفل */}
      <footer className="fixed bottom-0 left-0 right-0 z-[50] p-4 md:p-8 pointer-events-none mb-[env(safe-area-inset-bottom,0px)]">
        <audio key={currentTrack?.url} ref={audioRef} src={currentTrack?.url} className="hidden" preload="auto" crossOrigin="anonymous" />
        <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-3xl border border-white/50 shadow-[0_24px_48px_-8px_rgba(0,0,0,0.2)] rounded-[32px] pointer-events-auto">
          <Player 
            track={currentTrack} 
            state={playerState} 
            onPlayPause={handlePlayPause} 
            onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)} 
            onSkip={(s) => audioRef.current && (audioRef.current.currentTime += s)} 
            onRateChange={handleRateChange} 
            onToggleFavorite={handleToggleFavorite} 
            onAddTimestamp={handleAddTimestamp} 
            hasError={!!loadError}
          />
        </div>
      </footer>
    </div>
  );
};

export default App;
