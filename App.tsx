
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

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (currentTrack) {
      if (playerState.isPlaying) {
        audioRef.current?.play().catch(e => console.error("Playback error:", e));
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
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
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
    <div className="flex flex-col h-screen h-[100dvh] bg-[#f8fafb] text-slate-700 overflow-hidden font-cairo watercolor-bg relative">
      {/* Navbar Mobile/Tablet */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-40 lg:hidden">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-[#4da8ab] hover:bg-slate-50 rounded-xl transition-colors"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-800">ترانيم</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          onImport={addTrack} 
          tracks={tracks} 
          currentId={currentTrack?.id || null} 
          onSelect={setCurrentTrackIndex}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto relative bg-transparent scroll-smooth">
          <div className="p-4 md:p-10 lg:p-16 max-w-5xl mx-auto w-full">
            {currentTrack ? (
              <div className="flex flex-col items-center space-y-10 pb-40">
                {/* Cover Image */}
                <div className="relative p-2 w-full max-w-[240px] md:max-w-sm">
                  <div className="absolute inset-0 bg-[#4da8ab]/10 rounded-full blur-[60px] transform scale-125"></div>
                  <div className="relative group aspect-square w-full overflow-hidden rounded-[40px] shadow-2xl border-4 border-white">
                    <img src={currentTrack.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="bg-white/90 px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-white transition-all text-[#4da8ab] shadow-lg">
                        تغيير الغلاف
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => e.target.files?.[0] && updateCover(currentTrack.id, e.target.files[0])} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Track Info */}
                <div className="text-center w-full px-4">
                  {isEditingName ? (
                    <div className="flex flex-col items-center max-w-lg mx-auto">
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        onBlur={updateTrackName}
                        autoFocus
                        className="w-full bg-white border-2 border-[#4da8ab] rounded-2xl px-5 py-3 text-xl font-bold text-slate-800 text-center focus:outline-none shadow-xl"
                      />
                    </div>
                  ) : (
                    <div className="group relative inline-block max-w-full">
                      <h1 
                        className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-[#4da8ab] transition-colors flex items-center justify-center gap-4 break-all leading-snug"
                        onClick={() => { setEditingNameValue(currentTrack.name); setIsEditingName(true); }}
                      >
                        <span className="break-all">{currentTrack.name}</span>
                        <svg className="w-5 h-5 opacity-30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </h1>
                    </div>
                  )}
                  <p className="text-[#4da8ab] text-sm md:text-lg mt-3 font-semibold tracking-widest opacity-80 uppercase">{currentTrack.artist}</p>
                </div>

                {/* Timestamps Section */}
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
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-10">
                <div className="w-32 h-32 md:w-52 md:h-52 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-[#4da8ab]/5 animate-pulse">
                  <svg className="w-16 h-16 md:w-24 md:h-24 text-[#4da8ab]/10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-slate-800">ترانيم</h2>
                  <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">قم باستيراد ألحانك المفضلة لتبدأ رحلة استماع فريدة</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Player Section - Ensure it's on top and doesn't overlap */}
      <footer className="shrink-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] relative">
        <audio ref={audioRef} src={currentTrack?.url} className="hidden" />
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
