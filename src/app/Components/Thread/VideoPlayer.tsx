'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls, { ErrorTypes, ErrorDetails } from 'hls.js';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onMediaClick?: () => void;
  isPlaying?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
  isInModal?: boolean;
}

interface HlsError {
  type: ErrorTypes;
  details: ErrorDetails;
  fatal: boolean;
}

export function VideoPlayer({ 
  src, 
  poster, 
  title, 
  className, 
  onThumbnailGenerated,
  currentTime = 0,
  onTimeUpdate,
  onMediaClick,
  isPlaying = false,
  onPlayingChange,
  isInModal = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTimeState, setCurrentTimeState] = useState(currentTime);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonction pour formater le temps
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  // Fonction pour formater le temps restant
  const formatRemainingTime = useCallback((currentTime: number, duration: number) => {
    const remainingTime = duration - currentTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  // Initialisation du lecteur
  const initializePlayer = useCallback(async () => {
    if (!videoRef.current || isInitialized || !src) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const video = videoRef.current;
      if (!video) {
        reject(new Error('Référence vidéo non disponible'));
        return;
      }

      const isHLSSource = src.includes('.m3u8');

      if (isHLSSource && Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          progressive: true,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play()
            .then(() => resolve())
            .catch((error) => {
              console.log('Lecture automatique bloquée:', error);
              resolve();
            });
        });

        hls.on(Hls.Events.ERROR, (_event: unknown, data: HlsError) => {
          if (data.fatal) {
            switch (data.type) {
              case ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                reject(new Error('Erreur fatale HLS'));
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play()
          .then(() => resolve())
          .catch((error) => {
            console.log('Lecture automatique bloquée:', error);
            resolve();
          });
      } else {
        video.src = src;
        video.play()
          .then(() => resolve())
          .catch((error) => {
            console.log('Lecture automatique bloquée:', error);
            resolve();
          });
      }

      setIsInitialized(true);
    });
  }, [src, isInitialized]);

  // Synchroniser l'état de lecture
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      initializePlayer().then(() => {
        videoRef.current?.play().catch(() => {
          onPlayingChange?.(false);
        });
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, onPlayingChange, src, initializePlayer]);

  // Synchroniser le temps de lecture
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Gestion de la lecture/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    const newIsPlaying = !isPlaying;
    onPlayingChange?.(newIsPlaying);
  };

  // Gestion du volume
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Gestion du plein écran
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Gestion de la progression
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const progress = (time / videoRef.current.duration) * 100;
    setProgress(progress);
    setCurrentTimeState(time);
    onTimeUpdate?.(time);
  }, [onTimeUpdate]);

  // Gestion du clic sur la barre de progression
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    
    const video = videoRef.current;
    if (!video.duration || !Number.isFinite(video.duration)) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    // S'assurer que pos est entre 0 et 1
    const clampedPos = Math.max(0, Math.min(1, pos));
    const newTime = clampedPos * video.duration;
    
    if (Number.isFinite(newTime)) {
      video.currentTime = newTime;
    }
  };

  // Fonction pour générer une miniature
  const generateThumbnail = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
    onThumbnailGenerated?.(thumbnailUrl);
  }, [onThumbnailGenerated]);

  // Gestion des événements de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => onPlayingChange?.(true);
    const handlePause = () => onPlayingChange?.(false);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onPlayingChange, handleTimeUpdate]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Générer la miniature si elle n'existe pas déjà
    if (!poster && videoRef.current && !isPlaying && src) {
      const video = videoRef.current;
      video.preload = 'metadata';
      video.src = src;

      const handleLoadedMetadata = () => {
        if (video.readyState >= 2) {
          video.currentTime = 1;
        }
      };

      const handleSeeked = () => {
        generateThumbnail();
        // Nettoyer la source après la génération de la miniature
        video.src = '';
        video.removeAttribute('src');
        video.load();
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('seeked', handleSeeked);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('seeked', handleSeeked);
      };
    }
  }, [src, poster, isPlaying, generateThumbnail]);

  // Gestionnaire de clic sur la vidéo
  const handleVideoClick = (e: React.MouseEvent) => {
    // Vérifier si le clic est sur les contrôles de la vidéo
    const target = e.target as HTMLElement;
    const isControlsClick = target.closest('.video-controls');
    
    if (!isControlsClick && onMediaClick) {
      e.preventDefault();
      e.stopPropagation();
      onMediaClick();
    }
  };

  // Gestion du survol et des événements tactiles
  const handleInteractionStart = () => {
    setShowControls(true);
    if (!isInModal && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      onPlayingChange?.(true);
    }
  };

  const handleInteractionEnd = () => {
    setShowControls(false);
    if (!isInModal) {
      onPlayingChange?.(false);
    }
  };

  return (
    <div 
      className={`relative group overflow-hidden bg-black ${className}`}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        poster={poster || undefined}
        className="w-full h-full"
        playsInline
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        controls={false}
        src={src || undefined}
        onTimeUpdate={handleTimeUpdate}
        title={title}
      />

      {/* Overlay de lecture/pause (uniquement dans le thread) */}
      {!isInModal && (
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {!isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-black/50 text-white/90 hover:bg-black/60 transition-colors"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Temps restant (uniquement dans le thread) */}
      {!isInModal && isPlaying && (
        <div className="absolute bottom-3 right-3 px-1 py-0.5 rounded bg-black/60">
          <span className="text-white text-xs font-medium">
            {formatRemainingTime(currentTimeState, duration)}
          </span>
        </div>
      )}

      {/* Contrôles complets (uniquement dans la galerie) */}
      {isInModal && (
        <div 
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent pt-12 pb-4 px-4 transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Barre de progression */}
          <div 
            ref={progressBarRef}
            className="relative h-1 group/progress bg-white/30 rounded-full cursor-pointer mb-4"
            onClick={handleProgressBarClick}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full group-hover/progress:bg-[#1d9bf0]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Bouton lecture/pause */}
              <button 
                onClick={togglePlay}
                className="text-white/90 hover:text-white transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Contrôle du volume */}
              <div className="group/volume relative flex items-center">
                <button 
                  onClick={toggleMute}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Temps */}
              <span className="text-white/90 text-[13px] tabular-nums">
                {formatTime(currentTimeState)} / {formatTime(duration)}
              </span>
            </div>

            {/* Bouton plein écran */}
            <button 
              onClick={toggleFullscreen}
              className="text-white/90 hover:text-white transition-colors"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
} 