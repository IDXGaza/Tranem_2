
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
    <div className="flex flex-col md:flex-row h-screen h-[100dvh] bg-[#f8fafb] text-slate-700 overflow-hidden font-cairo watercolor-bg relative">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#4da8ab]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-lg font-bold text-slate-800">ترانيم</h1>
        <div className="w-10"></div>
      </header>

      <Sidebar 
        onImport={addTrack} 
        tracks={tracks} 
        currentId={currentTrack?.id || null} 
        onSelect={setCurrentTrackIndex}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-44 md:pb-48">
          {currentTrack ? (
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-12">
              <div className="flex flex-col items-center">
                <div className="relative p-2 md:p-8 w-full max-w-[200px] md:max-w-xs lg:max-w-sm">
                  <div className="absolute inset-0 bg-[#4da8ab]/10 rounded-full blur-3xl transform scale-110"></div>
                  <div className="relative group aspect-square w-full overflow-hidden rounded-[24px] md:rounded-[40px] shadow-2xl border-4 border-white">
                    <img src={currentTrack.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={currentTrack.name} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold cursor-pointer hover:bg-white transition-all text-[#4da8ab]">
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
                
                <div className="mt-6 text-center w-full max-w-2xl px-2">
                  {isEditingName ? (
                    <div className="flex flex-col items-center">
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        onBlur={updateTrackName}
                        autoFocus
                        className="w-full bg-white border-2 border-[#4da8ab] rounded-xl px-4 py-2 text-lg md:text-2xl font-bold text-slate-800 text-center focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="inline-block max-w-full">
                      <h1 
                        className="text-xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-[#4da8ab] transition-colors flex items-center justify-center gap-2 break-words"
                        onClick={() => { setEditingNameValue(currentTrack.name); setIsEditingName(true); }}
                      >
                        <span className="line-clamp-2">{currentTrack.name}</span>
                        <svg className="w-4 h-4 md:w-5 md:h-5 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </h1>
                    </div>
                  )}
                  <p className="text-[#4da8ab] text-xs md:text-base mt-1 font-medium opacity-80">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto w-full">
                <TimestampManager 
                  timestamps={currentTrack.timestamps} 
                  onRemove={removeTimestamp}
                  onSeek={handleSeek}
                  currentTime={playerState.currentTime}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6 px-4">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-[#4da8ab]/5">
                <svg className="w-12 h-12 md:w-20 md:h-20 text-[#4da8ab]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">أهلاً بك في ترانيم</h2>
                <p className="mt-2 text-slate-500 max-w-[240px] mx-auto text-xs md:text-sm">ابدأ برفع ملفاتك الصوتية واستمتع بتجربة استماع هادئة</p>
              </div>
            </div>
          )}
        </div>

        <audio ref={audioRef} src={currentTrack?.url} className="hidden" />

        <div className="absolute bottom-0 left-0 right-0 z-50">
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
        </div>
      </main>
    </div>
  );
};

export default App;
