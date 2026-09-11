import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  DollarSign,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music2,
  ChevronUp,
  ChevronDown,
  Flame,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { VideoItem, Comment } from '../types';
import { DirectShareModal } from './DirectShareModal';
import { SuperThanksModal } from './SuperThanksModal';
import { CommentsSection } from './CommentsSection';

interface ShortsFeedProps {
  shorts: VideoItem[];
  currentUser: { name: string; handle: string; avatar: string };
  onUpdateShort: (updated: VideoItem) => void;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  shorts,
  currentUser,
  onUpdateShort,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuperThanks, setShowSuperThanks] = useState(false);
  const [shortVideoSrc, setShortVideoSrc] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  const currentShort = shorts[currentIndex];

  useEffect(() => {
    if (!currentShort) return;
    const src = currentShort.videoUrl || '/videos/nature_short.mp4';
    setShortVideoSrc(src);
    setIsBuffering(true);
  }, [currentIndex, currentShort?.id, currentShort?.videoUrl]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.currentTime = 0;
    const startPlay = async () => {
      try {
        await el.play();
        setIsPlaying(true);
        setIsBuffering(false);
      } catch (err: any) {
        // Autoplay muted fallback if restricted
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

    startPlay();
  }, [shortVideoSrc]);

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (showUnmutePrompt) {
          videoRef.current!.muted = false;
          setIsMuted(false);
          setShowUnmutePrompt(false);
        }
      }).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) setShowUnmutePrompt(false);
  };

  const handleShortError = () => {
    console.warn(`Shorts stream failed for ${shortVideoSrc}, falling back`);
    if (shortVideoSrc !== '/videos/nature_short.mp4') {
      setShortVideoSrc('/videos/nature_short.mp4');
    }
    setIsBuffering(false);
  };

  const handleLike = async () => {
    if (!currentShort) return;
    try {
      const res = await fetch(`/api/videos/${currentShort.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateShort({
          ...currentShort,
          likes: data.likes,
          dislikes: data.dislikes,
          isLikedByUser: data.isLikedByUser,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Keyboard arrow listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shorts.length]);

  if (!currentShort) {
    return (
      <div className="py-20 text-center text-neutral-400">
        No shorts available. Upload your first short video!
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Share & Super Thanks Modals */}
      <DirectShareModal
        video={currentShort}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        currentUser={currentUser}
        onShareSuccess={(newShares) =>
          onUpdateShort({ ...currentShort, shares: newShares })
        }
      />

      <SuperThanksModal
        video={currentShort}
        isOpen={showSuperThanks}
        onClose={() => setShowSuperThanks(false)}
        currentUser={currentUser}
        onSuccess={(amount) => {
          onUpdateShort({
            ...currentShort,
            adSettings: currentShort.adSettings
              ? {
                  ...currentShort.adSettings,
                  estimatedEarnings: currentShort.adSettings.estimatedEarnings + amount,
                }
              : undefined,
          });
        }}
      />

      {/* Main Shorts Container */}
      <div className="relative flex items-center justify-center gap-4">
        {/* Short Player Box (9:16 vertical ratio) */}
        <div className="relative w-[340px] sm:w-[380px] h-[640px] sm:h-[700px] bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl group select-none">
          {/* Video */}
          <video
            ref={videoRef}
            src={shortVideoSrc}
            poster={currentShort.thumbnailUrl}
            loop
            autoPlay
            playsInline
            muted={isMuted}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onCanPlay={() => setIsBuffering(false)}
            onError={handleShortError}
            preload="auto"
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Buffering Loading Spinner Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white pointer-events-none z-20">
              <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
            </div>
          )}

          {/* Unmute Prompt for Shorts */}
          {showUnmutePrompt && isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute top-16 right-4 z-30 flex items-center gap-1.5 bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xl animate-bounce cursor-pointer transition-all"
            >
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              <span>Tap to Unmute</span>
            </button>
          )}

          {/* Top Indicators */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs font-bold text-white">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Shorts 4K</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 pointer-events-auto transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center Play Icon if paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/70 flex items-center justify-center text-white cursor-pointer z-20"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          )}

          {/* Bottom Information Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-5 z-20 space-y-3">
            {/* Creator Row */}
            <div className="flex items-center gap-2.5">
              <img
                src={currentShort.creator.avatar}
                alt={currentShort.creator.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{currentShort.creator.handle}</span>
                  {currentShort.creator.isVerified && (
                    <span className="text-red-400 text-xs">✓</span>
                  )}
                </div>
              </div>
              <button className="ml-auto bg-white hover:bg-neutral-200 text-neutral-950 text-[11px] font-bold px-3 py-1 rounded-full transition-colors cursor-pointer">
                Subscribe
              </button>
            </div>

            {/* Title & Description */}
            <p className="text-xs text-white line-clamp-2 leading-relaxed">
              {currentShort.title}
            </p>

            {/* Audio Track Tag with rotating disc */}
            <div className="flex items-center justify-between text-[11px] text-neutral-300">
              <div className="flex items-center gap-1.5 truncate">
                <Music2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">Original Sound • 4K Master Mix</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center animate-spin duration-3000">
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Icons Column */}
        <div className="flex flex-col items-center gap-4 text-white">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                currentShort.isLikedByUser
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:scale-110'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${currentShort.isLikedByUser ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold">{currentShort.likes.toLocaleString()}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:scale-110 flex items-center justify-center transition-all">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">{currentShort.commentsCount}</span>
          </button>

          {/* Direct Share */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:scale-110 flex items-center justify-center transition-all">
              <Share2 className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[11px] font-bold">Share</span>
          </button>

          {/* Super Thanks Tip */}
          <button
            onClick={() => setShowSuperThanks(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-bold flex items-center justify-center shadow-lg shadow-amber-950 hover:scale-110 transition-all">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-300">Tip</span>
          </button>

          {/* Up & Down Scroll Controls */}
          <div className="flex flex-col gap-1 pt-4 border-t border-neutral-800">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous Short (Arrow Up)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Next Short (Arrow Down)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide-over Comments Drawer */}
        {showComments && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-3xl p-4 z-40 shadow-2xl flex flex-col animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h4 className="text-xs font-bold text-white">Comments</h4>
              <button
                onClick={() => setShowComments(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <CommentsSection
                videoId={currentShort.id}
                comments={[]}
                currentUser={currentUser}
                onCommentAdded={() => {
                  onUpdateShort({
                    ...currentShort,
                    commentsCount: currentShort.commentsCount + 1,
                  });
                }}
                onOpenSuperThanks={() => setShowSuperThanks(true)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
