
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
      setIsEditingName(false); // Reset editing mode when track changes
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
    if (!file.type.startsWith('audio/')) {
      alert("عذراً، يمكنك استيراد الملفات الصوتية فقط.");
      return;
    }

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
    if (currentTrackIndex === null) setCurrentTrackIndex(0);
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

  const startEditingName = () => {
    if (currentTrack) {
      setEditingNameValue(currentTrack.name);
      setIsEditingName(true);
    }
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
    <div className="flex h-screen bg-[#f8fafb] text-slate-700 overflow-hidden font-cairo watercolor-bg">
      <Sidebar 
        onImport={addTrack} 
        tracks={tracks} 
        currentId={currentTrack?.id || null} 
        onSelect={setCurrentTrackIndex} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {currentTrack ? (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex flex-col items-center">
                <div className="relative p-8">
                  <div className="absolute inset-0 bg-[#4da8ab]/10 rounded-full blur-3xl transform scale-110"></div>
                  <div className="relative group aspect-square w-full max-w-[280px] md:max-w-sm overflow-hidden rounded-[40px] shadow-xl shadow-[#4da8ab]/20 border-4 border-white">
                    <img src={currentTrack.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={currentTrack.name} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="bg-white/90 px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-white transition-all text-[#4da8ab]">
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
                
                <div className="mt-8 text-center w-full max-w-2xl px-4">
                  {isEditingName ? (
                    <div className="flex flex-col items-center gap-4">
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateTrackName()}
                        onBlur={updateTrackName}
                        autoFocus
                        className="w-full bg-white border-2 border-[#4da8ab] rounded-2xl px-6 py-3 text-3xl font-bold text-slate-800 text-center focus:outline-none shadow-lg shadow-[#4da8ab]/10"
                      />
                      <div className="flex gap-2">
                        <button onClick={updateTrackName} className="bg-[#4da8ab] text-white px-4 py-1 rounded-full text-xs font-bold shadow-md hover:bg-[#3d8b8d]">حفظ</button>
                        <button onClick={() => setIsEditingName(false)} className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-slate-300">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative inline-block">
                      <h1 
                        className="text-4xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-[#4da8ab] transition-colors flex items-center justify-center gap-4"
                        onClick={startEditingName}
                      >
                        {currentTrack.name}
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4da8ab]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </h1>
                    </div>
                  )}
                  <p className="text-[#4da8ab] text-lg mt-1 font-medium">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto w-full pb-32">
                <TimestampManager 
                  timestamps={currentTrack.timestamps} 
                  onRemove={removeTimestamp}
                  onSeek={handleSeek}
                  currentTime={playerState.currentTime}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                 <div className="w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-[#4da8ab]/10">
                    <svg className="w-24 h-24 text-[#4da8ab]/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                 </div>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">أهلاً بك في ترانيم</h2>
                <p className="mt-3 text-slate-500 max-w-xs mx-auto">ابدأ برفع ملفاتك الصوتية واستمتع بتجربة استماع فريدة وهادئة</p>
              </div>
            </div>
          )}
        </div>

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
      </main>
    </div>
  );
};

export default App;
