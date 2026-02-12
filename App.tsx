
import React, { useState, useRef, useEffect } from 'react';
import { Track, Timestamp, PlayerState } from './types';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import TimestampManager from './components/TimestampManager';

const UNIFORM_PLACEHOLDER = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&h=600&auto=format&fit=crop";

const DB_NAME = 'TraneemDB';
const STORE_NAME = 'tracks';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveTrackToDB = async (track: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).put(track);
  });
};

const deleteTrackFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).delete(id);
  });
};

const getAllTracksFromDB = async (): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(tx.error);
  });
};

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    playbackRate: 1,
    isLoading: false,
    isLooping: false,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const savedTracks = await getAllTracksFromDB();
      const sortedTracks = savedTracks.sort((a, b) => (a.order || 0) - (b.order || 0));
      const tracksWithUrls = sortedTracks.map(t => ({
        ...t,
        url: URL.createObjectURL(t.fileBlob),
        coverUrl: t.coverBlob ? URL.createObjectURL(t.coverBlob) : (t.coverUrl || UNIFORM_PLACEHOLDER)
      }));
      setTracks(tracksWithUrls);
      if (tracksWithUrls.length > 0) setCurrentTrackIndex(0);
    };
    loadData();
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.artist || 'ترانيم',
        album: 'مكتبتي',
        artwork: [
          { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => handlePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => handlePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (currentTrackIndex !== null && currentTrackIndex > 0) handleSelectTrack(currentTrackIndex - 1);
        else if (currentTrackIndex === 0) handleSelectTrack(tracks.length - 1);
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleSkipToNext();
      });
    }
  }, [currentTrack, currentTrackIndex, tracks.length]);

  const handleSkipToNext = () => {
    if (currentTrackIndex !== null) {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      handleSelectTrack(nextIndex);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    
    const onEnded = () => {
      if (playerState.isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleSkipToNext();
      }
    };

    const onWaiting = () => setPlayerState(prev => ({ ...prev, isLoading: true }));
    const onPlaying = () => setPlayerState(prev => ({ ...prev, isLoading: false }));
    
    const onCanPlay = () => {
      setLoadError(null);
      setPlayerState(prev => ({ ...prev, isLoading: false }));
      if (playerState.isPlaying) audio.play().catch(() => {});
    };

    const onLoadedMetadata = () => {
      if (audio && currentTrackIndex !== null) {
        setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, duration: audio.duration } : t));
        audio.playbackRate = playerState.playbackRate;
      }
    };

    const onError = () => {
      setLoadError("فشل تشغيل المقطع.");
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
  }, [currentTrack?.url, currentTrackIndex, playerState.playbackRate, playerState.isPlaying, playerState.isLooping, tracks.length]);

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setPlayerState(prev => ({ ...prev, isPlaying: true, currentTime: 0 }));
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playerState.isPlaying) {
      audioRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play().catch(() => {});
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleToggleLoop = () => {
    setPlayerState(prev => ({ ...prev, isLooping: !prev.isLooping }));
  };

  const handleRateChange = (rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  const handleToggleFavorite = () => {
    if (!currentTrack) return;
    const updatedTrack = { ...currentTrack, isFavorite: !currentTrack.isFavorite };
    setTracks(prev => prev.map(t => t.id === currentTrack.id ? updatedTrack : t));
    saveTrackToDB(updatedTrack);
  };

  const handleUpdateName = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentTrack) return;
    const oldName = currentTrack.name;
    const newName = window.prompt("تعديل اسم الأنشودة:", oldName);
    if (newName !== null && newName.trim() !== "" && newName !== oldName) {
      const updatedTrack = { ...currentTrack, name: newName.trim() };
      setTracks(prev => prev.map(t => t.id === currentTrack.id ? updatedTrack : t));
      saveTrackToDB(updatedTrack);
    }
  };

  const handleUpdateArtist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentTrack) return;
    const oldArtist = currentTrack.artist || "";
    const newArtist = window.prompt("تعديل اسم الفنان:", oldArtist);
    if (newArtist !== null && newArtist !== oldArtist) {
      const updatedTrack = { ...currentTrack, artist: newArtist.trim() };
      setTracks(prev => prev.map(t => t.id === currentTrack.id ? updatedTrack : t));
      saveTrackToDB(updatedTrack);
    }
  };

  const handleUpdateCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentTrack) {
      const newCoverUrl = URL.createObjectURL(file);
      const updatedTrack = { ...currentTrack, coverUrl: newCoverUrl, coverBlob: file };
      setTracks(prev => prev.map(t => t.id === currentTrack.id ? updatedTrack : t));
      saveTrackToDB(updatedTrack);
    }
  };

  const handleAddTimestamp = () => {
    if (!audioRef.current || !currentTrack) return;
    const time = audioRef.current.currentTime;
    const label = `علامة ${currentTrack.timestamps.length + 1}`;
    const newTimestamp: Timestamp = {
      id: Math.random().toString(36).substr(2, 9),
      time,
      label
    };
    const updatedTrack = { ...currentTrack, timestamps: [...currentTrack.timestamps, newTimestamp] };
    setTracks(prev => prev.map(t => t.id === currentTrack.id ? updatedTrack : t));
    saveTrackToDB(updatedTrack);
  };

  const handleRemoveTimestamp = (timestampId: string) => {
    if (!currentTrack) return;
    const updatedTrack = { ...currentTrack, timestamps: currentTrack.timestamps.filter(ts => ts.id !== timestampId) };
    setTracks(prev => prev.map(t => t.id === currentTrack.id ? updatedTrack : t));
    saveTrackToDB(updatedTrack);
  };

  const addTrack = async (file: File) => {
    const name = file.name.replace(/\.[^/.]+$/, "");
    const id = Math.random().toString(36).substr(2, 9);
    const newTrack: any = {
      id, name, artist: "",
      url: URL.createObjectURL(file),
      coverUrl: UNIFORM_PLACEHOLDER,
      isFavorite: false,
      timestamps: [],
      duration: 0,
      playbackRate: 1,
      order: tracks.length,
      fileBlob: file,
    };
    await saveTrackToDB(newTrack);
    setTracks(prev => {
      const updated = [...prev, newTrack];
      setCurrentTrackIndex(updated.length - 1);
      setPlayerState(ps => ({...ps, isPlaying: true}));
      return updated;
    });
  };

  const removeTrack = async (id: string) => {
    await deleteTrackFromDB(id);
    setTracks(prev => {
      const newTracks = prev.filter(t => t.id !== id);
      if (newTracks.length === 0) setCurrentTrackIndex(null);
      else if (currentTrackIndex !== null && currentTrackIndex >= newTracks.length) setCurrentTrackIndex(newTracks.length - 1);
      return newTracks;
    });
  };

  const handleMoveTrack = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tracks.length) return;
    const newTracks = [...tracks];
    const [moved] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, moved);
    const updatedTracks = newTracks.map((t, idx) => ({ ...t, order: idx }));
    setTracks(updatedTracks);
    const newIdx = updatedTracks.findIndex(t => t.id === currentTrack?.id);
    if (newIdx !== -1) setCurrentTrackIndex(newIdx);
    for (const track of updatedTracks) await saveTrackToDB(track);
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#f8fafb] dark:bg-slate-950 text-slate-700 dark:text-slate-200 overflow-hidden font-cairo watercolor-bg relative transition-colors duration-300">
      <header className="flex lg:hidden items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 shrink-0 z-40 landscape:py-2">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#4da8ab] active:scale-95 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-xl font-black text-[#4da8ab]">ترانيم</h1>
        <button onClick={toggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400">
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-12.37a.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06a.996.996 0 000-1.41zM5.99 19.42a.996.996 0 001.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.38.39-.38 1.03 0 1.41z"/></svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
          )}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          onImport={addTrack} onRemove={removeTrack} onMove={handleMoveTrack}
          tracks={tracks} currentId={currentTrack?.id || null} onSelect={handleSelectTrack}
          isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode}
        />
        
        <main className="flex-1 overflow-y-auto scroll-container bg-transparent relative z-10">
          <div className="px-4 py-8 md:p-12 max-w-4xl mx-auto w-full flex flex-col items-center">
            {currentTrack ? (
              <div className="w-full flex flex-col items-center space-y-6 md:space-y-10 animate-in fade-in duration-500">
                <div className="relative group w-full max-w-[200px] md:max-w-xs lg:max-w-sm shrink-0">
                  <div className="relative aspect-square w-full overflow-hidden rounded-[40px] md:rounded-[60px] shadow-2xl border-[4px] md:border-[6px] border-white dark:border-slate-800 group-hover:scale-[1.01] transition-all duration-500">
                    <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => coverInputRef.current?.click()} className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-20 cursor-pointer">
                      <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleUpdateCover} />
                  </div>
                </div>

                <div className="relative z-30 text-center w-full px-4 min-w-0 space-y-3 md:space-y-6">
                  <div className="flex justify-center w-full">
                    <button 
                      onClick={handleUpdateName} 
                      className="flex items-center gap-2 group/title hover:bg-[#4da8ab]/10 bg-[#4da8ab]/5 px-5 py-3 rounded-2xl transition-all active:scale-95 cursor-pointer border border-[#4da8ab]/20 dark:border-[#4da8ab]/30 max-w-[90vw] md:max-w-[70vw] lg:max-w-[600px]"
                    >
                      <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-800 dark:text-slate-100 leading-tight truncate group-hover/title:text-[#4da8ab] flex-1">
                        {currentTrack.name}
                      </h1>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-[#4da8ab] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-center w-full">
                    <button 
                      onClick={handleUpdateArtist} 
                      className="flex items-center gap-2 group/artist hover:bg-slate-200 dark:hover:bg-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer max-w-[80vw] md:max-w-[50vw]"
                    >
                      <span className={`text-sm md:text-xl font-bold transition-colors group-hover/artist:text-[#4da8ab] truncate ${currentTrack.artist ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                        {currentTrack.artist || "إضافة اسم الفنان..."}
                      </span>
                      <svg className="w-4 h-4 text-slate-400 group-hover/artist:text-[#4da8ab] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                </div>

                <div className="w-full max-w-2xl px-2">
                  <TimestampManager timestamps={currentTrack.timestamps} onRemove={handleRemoveTimestamp} onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)} currentTime={playerState.currentTime} />
                </div>
                <div className="h-64 md:h-80 shrink-0 w-full" aria-hidden="true" />
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-6 opacity-30">
                <div className="w-20 h-20 bg-[#4da8ab]/5 rounded-[24px] flex items-center justify-center text-[#4da8ab]">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-400">مكتبتك خالية</h2>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-[50] p-4 md:p-8 pointer-events-none mb-[env(safe-area-inset-bottom,0px)]">
        <audio key={currentTrack?.url} ref={audioRef} src={currentTrack?.url} className="hidden" preload="auto" crossOrigin="anonymous" />
        <div className="max-w-3xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/50 dark:border-slate-800 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.3)] rounded-[32px] pointer-events-auto overflow-hidden transition-colors duration-300">
          <Player track={currentTrack} state={playerState} onPlayPause={handlePlayPause} onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)} onSkip={(s) => audioRef.current && (audioRef.current.currentTime += s)} onRateChange={handleRateChange} onToggleFavorite={handleToggleFavorite} onToggleLoop={handleToggleLoop} onAddTimestamp={handleAddTimestamp} hasError={!!loadError} />
        </div>
      </footer>
    </div>
  );
};

export default App;
