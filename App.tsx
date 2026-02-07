
import React, { useState, useRef, useEffect } from 'react';
import { Track, Timestamp, PlayerState } from './types';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import TimestampManager from './components/TimestampManager';

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    playbackRate: 1,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const onEnded = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const onLoadedMetadata = () => {
      if (currentTrackIndex !== null) {
        setTracks(prev => prev.map((t, idx) => 
          idx === currentTrackIndex ? { ...t, duration: audio.duration } : t
        ));
      }
    };
    
    const onWaiting = () => console.log("Audio is buffering...");
    const onError = (e: any) => console.error("Audio error:", e);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.playbackRate = playerState.playbackRate;
      if (playerState.isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback start error:", e));
      }
      setIsEditingName(false);
      setIsSidebarOpen(false);
    }
  }, [currentTrack?.id]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playerState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback toggle error:", e));
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    const safeTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    audioRef.current.currentTime = safeTime;
    setPlayerState(prev => ({ ...prev, currentTime: safeTime }));
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = audioRef.current.currentTime + seconds;
    handleSeek(newTime);
  };

  const handleRateChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  const addTrack = (file: File) => {
    const newTrack: Track = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name.replace(/\.[^/.]+$/, ""),
      artist: "ترانيم عذبة",
      url: URL.createObjectURL(file),
      coverUrl: `https://picsum.photos/seed/${Math.random()}/400/400`,
      isFavorite: false,
      timestamps: [],
      duration: 0,
      playbackRate: 1,
    };
    setTracks(prev => [...prev, newTrack]);
    if (currentTrackIndex === null) setCurrentTrackIndex(tracks.length);
  };

  const removeTrack = (id: string) => {
    const trackToDelete = tracks.find(t => t.id === id);
    if (trackToDelete) {
      // تحرير الذاكرة
      URL.revokeObjectURL(trackToDelete.url);
    }

    setTracks(prev => {
      const filteredTracks = prev.filter(t => t.id !== id);
      
      // إذا كان الملف المحذوف هو المشغل حالياً
      if (currentTrack?.id === id) {
        setCurrentTrackIndex(null);
        setPlayerState(ps => ({ ...ps, isPlaying: false, currentTime: 0 }));
      } else if (currentTrackIndex !== null) {
        // تحديث الفهرس الحالي لضمان عدم حدوث إزاحة خاطئة
        const currentId = prev[currentTrackIndex].id;
        const newIndex = filteredTracks.findIndex(t => t.id === currentId);
        setCurrentTrackIndex(newIndex !== -1 ? newIndex : null);
      }
      
      return filteredTracks;
    });
  };

  const toggleFavorite = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const updateCover = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setTracks(prev => prev.map(t => t.id === id ? { ...t, coverUrl: url } : t));
  };

  const updateTrackName = () => {
    if (currentTrackIndex === null || !editingNameValue.trim()) {
      setIsEditingName(false);
      return;
    }
    setTracks(prev => prev.map((t, idx) => 
      idx === currentTrackIndex ? { ...t, name: editingNameValue.trim() } : t
    ));
    setIsEditingName(false);
  };

  const addTimestamp = () => {
    if (currentTrackIndex === null || !currentTrack || !audioRef.current) return;
    const currentTimeAtClick = audioRef.current.currentTime;
    const newTs: Timestamp = {
      id: Math.random().toString(36).substr(2, 9),
      time: currentTimeAtClick,
      label: `علامة ${currentTrack.timestamps.length + 1}`
    };
    setTracks(prev => prev.map((t, idx) => 
      idx === currentTrackIndex ? { ...t, timestamps: [...t.timestamps, newTs] } : t
    ));
  };

  const removeTimestamp = (tsId: string) => {
    if (currentTrackIndex === null) return;
    setTracks(prev => prev.map((t, idx) => 
      idx === currentTrackIndex ? { ...t, timestamps: t.timestamps.filter(ts => ts.id !== tsId) } : t
    ));
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#f8fafb] text-slate-700 overflow-hidden font-cairo watercolor-bg relative no-select">
      
      <header className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-slate-100 shrink-0 z-40 lg:hidden">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-[#4da8ab] hover:bg-slate-50 rounded-xl"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-800">ترانيم</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          onImport={addTrack} 
          onRemove={removeTrack}
          tracks={tracks} 
          currentId={currentTrack?.id || null} 
          onSelect={setCurrentTrackIndex}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto scroll-container bg-transparent relative">
          <div className="p-4 md:p-10 lg:p-16 max-w-5xl mx-auto w-full min-h-full">
            {currentTrack ? (
              <div className="flex flex-col items-center space-y-8 pb-12">
                <div className="relative p-2 w-full max-w-[220px] md:max-w-sm">
                  <div className="absolute inset-0 bg-[#4da8ab]/10 rounded-full blur-[60px] transform scale-125"></div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-[32px] md:rounded-[48px] shadow-2xl border-4 border-white">
                    <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt="" />
                    <label className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="bg-white/90 px-6 py-2 rounded-full text-xs font-bold text-[#4da8ab]">تغيير الغلاف</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && updateCover(currentTrack.id, e.target.files[0])} 
                      />
                    </label>
                  </div>
                </div>
                
                <div className="text-center w-full px-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onBlur={updateTrackName}
                      autoFocus
                      className="w-full max-w-lg bg-white border-2 border-[#4da8ab] rounded-2xl px-5 py-3 text-xl font-bold text-slate-800 text-center shadow-lg"
                    />
                  ) : (
                    <h1 
                      className="text-xl md:text-3xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-[#4da8ab] transition-colors break-all leading-snug px-4 group"
                      onClick={() => { setEditingNameValue(currentTrack.name); setIsEditingName(true); }}
                    >
                      {currentTrack.name}
                      <svg className="w-4 h-4 inline-block ms-2 opacity-30 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </h1>
                  )}
                  <p className="text-[#4da8ab] text-sm md:text-base mt-2 font-semibold opacity-70 uppercase tracking-widest">{currentTrack.artist}</p>
                </div>

                <div className="w-full max-w-2xl">
                  <TimestampManager 
                    timestamps={currentTrack.timestamps} 
                    onRemove={removeTimestamp}
                    onSeek={handleSeek}
                    currentTime={playerState.currentTime}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-10 py-20">
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-[#4da8ab]/5">
                  <svg className="w-12 h-12 md:w-20 md:h-20 text-[#4da8ab]/10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-400">ابدأ باستيراد ملف صوتي</h2>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="shrink-0 z-[50] bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-2 md:px-0">
        <audio 
          ref={audioRef} 
          src={currentTrack?.url} 
          className="hidden" 
          preload="auto"
          playsInline
        />
        <Player 
          track={currentTrack} 
          state={playerState} 
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSkip={handleSkip}
          onRateChange={handleRateChange}
          onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack.id)}
          onAddTimestamp={addTimestamp}
        />
      </footer>
    </div>
  );
};

export default App;
