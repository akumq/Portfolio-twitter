'use client';

import { createContext, useContext, useRef, useCallback, useState } from 'react';

interface VideoPlayerContextType {
  registerPlayer: (id: string, player: HTMLVideoElement) => void;
  unregisterPlayer: (id: string) => void;
  playVideo: (id: string) => Promise<void>;
  currentPlayingId: string | null;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const playersRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const registerPlayer = useCallback((id: string, player: HTMLVideoElement) => {
    playersRef.current.set(id, player);
  }, []);

  const unregisterPlayer = useCallback((id: string) => {
    if (currentPlayingId === id) {
      setCurrentPlayingId(null);
    }
    playersRef.current.delete(id);
  }, [currentPlayingId]);

  const playVideo = useCallback(async (id: string) => {
    // Si une vidéo est déjà en cours de lecture, la mettre en pause
    if (currentPlayingId && currentPlayingId !== id) {
      const currentPlayer = playersRef.current.get(currentPlayingId);
      if (currentPlayer && !currentPlayer.paused) {
        try {
          await currentPlayer.pause();
        } catch (error) {
          console.error('Erreur lors de la mise en pause de la vidéo:', error);
        }
      }
    }

    // Lire la nouvelle vidéo
    const player = playersRef.current.get(id);
    if (player) {
      try {
        // Attendre que la vidéo soit prête
        if (player.readyState < 2) { // HAVE_CURRENT_DATA
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              player.removeEventListener('canplay', handleCanPlay);
              resolve(null);
            };
            player.addEventListener('canplay', handleCanPlay);
          });
        }

        await player.play();
        setCurrentPlayingId(id);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erreur lors de la lecture de la vidéo:', error);
          throw error;
        }
      }
    }
  }, [currentPlayingId]);

  return (
    <VideoPlayerContext.Provider value={{ 
      registerPlayer, 
      unregisterPlayer, 
      playVideo,
      currentPlayingId 
    }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer doit être utilisé dans un VideoPlayerProvider');
  }
  return context;
} 