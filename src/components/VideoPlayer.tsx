import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  Sparkles,
  Check,
  Subtitles,
  DollarSign,
  Tv,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { VideoItem, ResolutionOption } from '../types';

interface VideoPlayerProps {
  video: VideoItem;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  isTheatreMode?: boolean;
  onToggleTheatre?: () => void;
  onVideoEnd?: () => void;
}

const RESOLUTIONS: ResolutionOption[] = [
  '4K (2160p)',
  '1440p',
  '1080p 60fps',
  '720p',
  '480p',
  'Auto',
];

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Reliable local fallback streams
const DEFAULT_FALLBACK_VIDEO = '/videos/cyberpunk_4k.mp4';
const SHORT_FALLBACK_VIDEO = '/videos/nature_short.mp4';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  initialTime = 0,
  onTimeUpdate,
  isTheatreMode = false,
  onToggleTheatre,
  onVideoEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(video.duration || 0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
  const [videoSrc, setVideoSrc] = useState(video.videoUrl || DEFAULT_FALLBACK_VIDEO);
  const [hasStreamError, setHasStreamError] = useState(false);
  const [activeResolution, setActiveResolution] = useState<ResolutionOption>(
    video.maxResolution?.includes('4K') ? '4K (2160p)' : '1080p 60fps'
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'quality' | 'speed'>('main');
  const [showAdBanner, setShowAdBanner] = useState(video.isMonetized);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adSkipped, setAdSkipped] = useState(!video.isMonetized);

  const controlsTimeoutRef = useRef<any>(null);

  // Sync video source on video prop change
  useEffect(() => {
    const src = video.videoUrl || (video.format === 'shorts' ? SHORT_FALLBACK_VIDEO : DEFAULT_FALLBACK_VIDEO);
    setVideoSrc(src);
    setHasStreamError(false);
    setIsBuffering(true);
    setCurrentTime(initialTime);
  }, [video.id, video.videoUrl]);

  // Autoplay handler when video loads or changes
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.currentTime = initialTime;

    const attemptPlay = async () => {
      try {
        await el.play();
        setIsPlaying(true);
        setIsBuffering(false);
      } catch (err: any) {
        // Autoplay with sound restricted by browser policy -> try muted autoplay
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
          el.muted = true;
          setIsMuted(true);
          try {
            await el.play();
            setIsPlaying(true);
            setIsBuffering(false);
            setShowUnmutePrompt(true);
          } catch {
            setIsPlaying(false);
            setIsBuffering(false);
          }
        } else {
          setIsPlaying(false);
          setIsBuffering(false);
        }
      }
    };

    attemptPlay();
  }, [videoSrc, initialTime]);

  // Reset ad banner on video change
  useEffect(() => {
    if (video.isMonetized) {
      setShowAdBanner(true);
      setAdCountdown(5);
      setAdSkipped(false);
    } else {
      setShowAdBanner(false);
      setAdSkipped(true);
    }
  }, [video.id, video.isMonetized]);

  // Ad countdown timer
  useEffect(() => {
    let timer: any;
    if (showAdBanner && !adSkipped && isPlaying && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAdBanner, adSkipped, isPlaying, adCountdown]);

  // Autohide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsMenu) {
        setShowControls(false);
      }
    }, 3200);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (showUnmutePrompt) {
            videoRef.current!.muted = false;
            setIsMuted(false);
            setShowUnmutePrompt(false);
          }
        })
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleUnmute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.volume = volume || 0.8;
    setIsMuted(false);
    setShowUnmutePrompt(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) onTimeUpdate(curr);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || video.duration);
    setIsBuffering(false);
    if (initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    const muted = vol === 0;
    videoRef.current.muted = muted;
    setIsMuted(muted);
    if (!muted) setShowUnmutePrompt(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
      setShowUnmutePrompt(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const changeResolution = (res: ResolutionOption) => {
    setActiveResolution(res);
    setShowSettingsMenu(false);
    setSettingsSubmenu('main');
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);
    setSettingsSubmenu('main');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Gracefully handle video loading errors and recover immediately
  const handleVideoError = () => {
    console.warn(`Video stream error on ${videoSrc}, falling back to local master`);
    setHasStreamError(true);
    const fallback = video.format === 'shorts' ? SHORT_FALLBACK_VIDEO : DEFAULT_FALLBACK_VIDEO;
    if (videoSrc !== fallback) {
      setVideoSrc(fallback);
      setIsBuffering(true);
    } else {
      setIsBuffering(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isMuted, volume, showUnmutePrompt]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showSettingsMenu && setShowControls(false)}
      className={`relative w-full bg-black overflow-hidden group select-none ${
        isTheatreMode ? 'aspect-[21/9] max-h-[70vh]' : 'aspect-video rounded-2xl border border-neutral-800/80 shadow-2xl'
      }`}
    >
      {/* Native Video Element */}
      <video
        ref={videoRef}
        src={videoSrc || DEFAULT_FALLBACK_VIDEO}
        poster={video.thumbnailUrl || undefined}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onCanPlay={() => setIsBuffering(false)}
        onError={handleVideoError}
        onEnded={onVideoEnd}
        playsInline
        preload="auto"
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* 4K Stream Badge on Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none transition-opacity duration-300 opacity-90">
        <div className="flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px] font-bold text-white shadow-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>{activeResolution}</span>
          <span className="text-neutral-400">({video.fps}fps)</span>
        </div>
        {video.is4KMaster && (
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
            ULTRA HD MASTER
          </div>
        )}
        {hasStreamError && (
          <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold px-2 py-0.5 rounded shadow flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Active Master Stream
          </div>
        )}
      </div>

      {/* Unmute Prompt Pill for Autoplay */}
      {showUnmutePrompt && isPlaying && (
        <button
          onClick={handleUnmute}
          className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xl animate-bounce cursor-pointer transition-all"
        >
          <VolumeX className="w-4 h-4 text-red-400" />
          <span>Click to Unmute</span>
        </button>
      )}

      {/* Buffering Loading Spinner Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none z-20">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      )}

      {/* Monetization Ad Simulation Overlay */}
      {showAdBanner && !adSkipped && (
        <div className="absolute bottom-16 left-4 z-30 max-w-sm bg-neutral-950/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-2xl animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Creator Monetization Active
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1 rounded">YPP</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Ad CPM: ${video.adSettings?.cpmRate || 14.50} • Supporting {video.creator.name}
                </div>
              </div>
            </div>
            {adCountdown === 0 ? (
              <button
                onClick={() => setAdSkipped(true)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1 rounded-lg font-semibold border border-neutral-700 cursor-pointer"
              >
                Skip Ad
              </button>
            ) : (
              <span className="text-[11px] text-neutral-400 font-mono py-1">Skip in {adCountdown}s</span>
            )}
          </div>
        </div>
      )}

      {/* Center Play Button Overlay on Pause */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-red-600/95 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-950/80 transform hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
          title="Play Video"
        >
          <Play className="w-8 h-8 fill-current ml-1" />
        </button>
      )}

      {/* Custom Bottom Control Bar Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 transition-opacity duration-300 z-30 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrub Bar */}
        <div className="relative mb-3 flex items-center group/scrub">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2 transition-all"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3.5">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1 text-white hover:text-red-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (space)' : 'Play (space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="p-1 hover:text-red-400 transition-colors cursor-pointer" title={isMuted ? 'Unmute (m)' : 'Mute (m)'}>
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white hidden group-hover/volume:block transition-all"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-neutral-300">
              <span>{formatTime(currentTime)}</span>
              <span className="text-neutral-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Player Actions */}
          <div className="flex items-center gap-3 relative">
            {/* Active Resolution Chip */}
            <button
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu);
                setSettingsSubmenu('quality');
              }}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold font-mono tracking-tight text-white border border-neutral-700 transition-colors cursor-pointer"
            >
              {activeResolution}
            </button>

            {/* Settings Gear */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setSettingsSubmenu('main');
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showSettingsMenu ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:text-white'
                }`}
                title="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Dropdown Menu */}
              {showSettingsMenu && (
                <div className="absolute right-0 bottom-10 w-56 bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in slide-in-from-bottom-2">
                  {settingsSubmenu === 'main' && (
                    <div className="space-y-1">
                      <button
                        onClick={() => setSettingsSubmenu('quality')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 text-left text-neutral-200 cursor-pointer"
                      >
                        <span>Quality / Resolution</span>
                        <span className="text-red-400 font-bold">{activeResolution}</span>
                      </button>
                      <button
                        onClick={() => setSettingsSubmenu('speed')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 text-left text-neutral-200 cursor-pointer"
                      >
                        <span>Playback Speed</span>
                        <span className="text-neutral-400 font-bold">{playbackSpeed}x</span>
                      </button>
                      <div className="border-t border-neutral-800 my-1 pt-1 px-2 text-[10px] text-neutral-400">
                        Bitrate: 45 Mbps (Native 4K UHD)
                      </div>
                    </div>
                  )}

                  {settingsSubmenu === 'quality' && (
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-800">
                        Stream Quality
                      </div>
                      {RESOLUTIONS.map((res) => (
                        <button
                          key={res}
                          onClick={() => changeResolution(res)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                            activeResolution === res
                              ? 'bg-red-600/20 text-red-400 font-bold'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <span>{res}</span>
                          {activeResolution === res && <Check className="w-3.5 h-3.5 text-red-400" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {settingsSubmenu === 'speed' && (
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-800">
                        Playback Speed
                      </div>
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                            playbackSpeed === s
                              ? 'bg-red-600/20 text-red-400 font-bold'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <span>{s === 1 ? 'Normal' : `${s}x`}</span>
                          {playbackSpeed === s && <Check className="w-3.5 h-3.5 text-red-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theatre Mode Toggle */}
            {onToggleTheatre && (
              <button
                onClick={onToggleTheatre}
                className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title={isTheatreMode ? 'Default View' : 'Theatre Mode'}
              >
                <Tv className="w-5 h-5" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen (f)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

