import React, { useState, useEffect, useRef } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  DollarSign,
  ShieldCheck,
  Bell,
  Check,
  Clock,
  Sparkles,
  Eye,
  Plus,
  Tv,
  ListPlus,
  Flag,
  Flame,
  Bookmark,
} from 'lucide-react';
import { VideoItem, Comment } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { CommentsSection } from './CommentsSection';
import { DirectShareModal } from './DirectShareModal';
import { SuperThanksModal } from './SuperThanksModal';
import { ModerationModal } from './ModerationModal';
import { getLocalVideoProgress, setLocalWatchProgress } from '../utils/savedStorage';

interface WatchViewProps {
  video: VideoItem;
  allVideos: VideoItem[];
  isSaved?: boolean;
  onToggleSave?: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  currentUser: { name: string; handle: string; avatar: string };
  onUpdateVideo: (updated: VideoItem) => void;
  initialTime?: number;
  onSelectChannel?: (handle: string) => void;
}

export const WatchView: React.FC<WatchViewProps> = ({
  video,
  allVideos,
  isSaved = false,
  onToggleSave,
  onSelectVideo,
  currentUser,
  onUpdateVideo,
  initialTime = 0,
  onSelectChannel,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Check if there is a saved resume position
  const effectiveInitialTime = useRef(
    initialTime > 0 ? initialTime : (getLocalVideoProgress(video.id) || 0)
  ).current;

  const [currentTime, setCurrentTime] = useState(effectiveInitialTime);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuperThanksModal, setShowSuperThanksModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const lastSavedTimeRef = useRef(0);

  // Load real comments from database on video change
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingComments(true);
    fetch(`/api/videos/${video.id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch((err) => console.error('Failed to load comments:', err))
      .finally(() => {
        if (!isCancelled) setIsLoadingComments(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [video.id]);

  // Check subscription status on creator change
  useEffect(() => {
    let isCancelled = false;
    fetch('/api/channel/subscriptions')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.subscriptions) {
          setIsSubscribed(Boolean(data.subscriptions[video.creator.id]));
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [video.creator.id]);

  // Periodically persist playback progress to ensure resume works when leaving website
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    const now = Math.floor(time);
    // Save every 4 seconds of playback progress
    if (Math.abs(now - lastSavedTimeRef.current) >= 4) {
      lastSavedTimeRef.current = now;
      setLocalWatchProgress(video.id, now, video.duration);
      // Sync to server backend asynchronously
      fetch('/api/user/watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          timestamp: now,
          duration: video.duration,
        }),
      }).catch(() => {});
    }
  };

  // Save on component unmount (e.g. navigation away)
  useEffect(() => {
    return () => {
      if (currentTime > 3) {
        setLocalWatchProgress(video.id, currentTime, video.duration);
        fetch('/api/user/watch-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: video.id,
            timestamp: currentTime,
            duration: video.duration,
          }),
        }).catch(() => {});
      }
    };
  }, [video.id, currentTime, video.duration]);

  const handleLike = async (action: 'like' | 'dislike') => {
    try {
      const res = await fetch(`/api/videos/${video.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateVideo({
          ...video,
          likes: data.likes,
          dislikes: data.dislikes,
          isLikedByUser: data.isLikedByUser,
          isDislikedByUser: data.isDislikedByUser,
        });
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/channel/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: video.creator.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubscribed(data.isSubscribed);
        onUpdateVideo({
          ...video,
          creator: {
            ...video.creator,
            subscribers: Math.max(0, video.creator.subscribers + (data.isSubscribed ? 1 : -1)),
          },
        });
      }
    } catch (err) {
      console.error('Subscribe failed:', err);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => {
      // Check if it is a reply to an existing comment
      const parentIndex = prev.findIndex((c) =>
        c.replies?.some((r) => r.id === newComment.id) ||
        (newComment as any).parentCommentId === c.id
      );

      if (parentIndex !== -1) {
        const copy = [...prev];
        const parent = { ...copy[parentIndex] };
        if (!parent.replies) parent.replies = [];
        if (!parent.replies.some((r) => r.id === newComment.id)) {
          parent.replies = [...parent.replies, newComment];
        }
        copy[parentIndex] = parent;
        return copy;
      }

      // Check if already in comments list (e.g. liked or existing)
      if (prev.some((c) => c.id === newComment.id)) {
        return prev.map((c) => (c.id === newComment.id ? newComment : c));
      }

      return [newComment, ...prev];
    });

    onUpdateVideo({
      ...video,
      commentsCount: video.commentsCount + 1,
    });
  };

  const handleSuperThanksSuccess = (amount: number, _newTotal: number, comment?: Comment) => {
    if (comment) {
      setComments((prev) => [comment, ...prev]);
    } else {
      // Refresh comments from API to catch the new super thanks comment
      fetch(`/api/videos/${video.id}/comments`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.comments)) setComments(d.comments);
        })
        .catch(() => {});
    }

    onUpdateVideo({
      ...video,
      commentsCount: video.commentsCount + 1,
      adSettings: video.adSettings
        ? {
            ...video.adSettings,
            estimatedEarnings: (video.adSettings.estimatedEarnings || 0) + amount,
          }
        : undefined,
    });
  };

  const recommendedVideos = allVideos.filter((v) => v.id !== video.id);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 space-y-6">
      {/* Modals */}
      <DirectShareModal
        video={video}
        currentTime={currentTime}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        currentUser={currentUser}
        onShareSuccess={(newShares) => onUpdateVideo({ ...video, shares: newShares })}
      />

      <SuperThanksModal
        video={video}
        isOpen={showSuperThanksModal}
        onClose={() => setShowSuperThanksModal(false)}
        currentUser={currentUser}
        onSuccess={handleSuperThanksSuccess}
      />

      <ModerationModal
        report={video.moderation}
        videoTitle={video.title}
        isOpen={showModerationModal}
        onClose={() => setShowModerationModal(false)}
      />

      {/* Main Watch Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Video Player & Details Column (8 or 12 cols depending on theatre mode) */}
        <div className={`space-y-4 ${isTheatreMode ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          {/* Custom 4K Player */}
          <VideoPlayer
            video={video}
            initialTime={effectiveInitialTime}
            onTimeUpdate={handleTimeUpdate}
            isTheatreMode={isTheatreMode}
            onToggleTheatre={() => setIsTheatreMode(!isTheatreMode)}
            onVideoEnd={() => {
              if (recommendedVideos.length > 0) {
                onSelectVideo(recommendedVideos[0].id);
              }
            }}
          />

          {/* Video Title & Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {video.is4KMaster && (
                <span className="bg-red-500/20 text-red-400 font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded border border-red-500/30">
                  4K ULTRA HD
                </span>
              )}
              <span className="bg-neutral-800 text-neutral-300 font-semibold text-[10px] px-2 py-0.5 rounded">
                {video.moderation.contentRating.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-neutral-400">{video.category}</span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {video.title}
            </h1>
          </div>

          {/* Creator & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-neutral-800/80">
            {/* Creator Profile */}
            <div className="flex items-center gap-3">
              <img
                src={video.creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                alt={video.creator.name}
                onClick={() => onSelectChannel?.(video.creator.handle)}
                className={`w-10 h-10 rounded-full object-cover ring-2 ring-red-500/40 transition-all ${
                  onSelectChannel ? 'hover:ring-red-400 cursor-pointer hover:scale-105' : ''
                }`}
                title={`View ${video.creator.name}'s channel`}
              />
              <div>
                <div
                  onClick={() => onSelectChannel?.(video.creator.handle)}
                  className={`flex items-center gap-1.5 font-bold text-sm text-white transition-colors ${
                    onSelectChannel ? 'hover:text-red-400 cursor-pointer hover:underline' : ''
                  }`}
                >
                  <span>{video.creator.name}</span>
                  {video.creator.isVerified && (
                    <span className="text-red-400 text-xs">✓</span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400">
                  <span className="font-mono text-neutral-300">{video.creator.handle}</span> • {video.creator.subscribers.toLocaleString()} subscribers
                </div>
              </div>

              {/* Join Channel Membership Button */}
              <button
                onClick={() => setShowJoinModal(true)}
                className={`ml-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isMember
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                    : 'border-neutral-700 hover:border-neutral-500 text-white bg-neutral-900'
                }`}
              >
                {isMember ? 'VIP Member ✓' : 'Join'}
              </button>

              {/* Subscribe Toggle Button */}
              <button
                onClick={handleSubscribe}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSubscribed
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    : 'bg-white hover:bg-neutral-200 text-neutral-950'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Bell className="w-3.5 h-3.5 fill-current" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>

            {/* Action Buttons: Like, Dislike, Share, Super Thanks, AI Moderation */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Like / Dislike pill */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden p-0.5">
                <button
                  onClick={() => handleLike('like')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                    video.isLikedByUser
                      ? 'bg-neutral-800 text-red-400'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${video.isLikedByUser ? 'fill-current' : ''}`} />
                  <span>{video.likes.toLocaleString()}</span>
                </button>
                <div className="w-[1px] h-4 bg-neutral-800" />
                <button
                  onClick={() => handleLike('dislike')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                    video.isDislikedByUser
                      ? 'bg-neutral-800 text-red-400'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${video.isDislikedByUser ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Direct Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Share ({video.shares})</span>
              </button>

              {/* Save Video to Website Library Button */}
              <button
                onClick={() => onToggleSave?.(video.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-red-600/25 border-red-500/50 text-red-400 hover:bg-red-600/35 shadow-sm'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title={isSaved ? 'Saved to website (persists when you leave)' : 'Save video on website'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-red-400' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Creator Monetization Super Thanks Button */}
              {video.isMonetized && (
                <button
                  onClick={() => setShowSuperThanksModal(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 hover:text-amber-200 shadow-sm transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Super Thanks</span>
                </button>
              )}

              {/* AI Moderation Certificate Button */}
              <button
                onClick={() => setShowModerationModal(true)}
                className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-blue-300 transition-colors cursor-pointer"
                title="View Automated Content Moderation details"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">AI Safe ({video.moderation.overallScore}%)</span>
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-3 font-semibold text-neutral-300">
              <span>{video.views.toLocaleString()} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-red-400">{video.maxResolution} Master</span>
              {video.isMonetized && (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <DollarSign className="w-3 h-3" /> Monetized
                </span>
              )}
            </div>

            {/* Description Text */}
            <div className={`text-neutral-300 whitespace-pre-line leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
              {video.description}
            </div>

            {/* Chapters if present */}
            {video.chapters && video.chapters.length > 0 && (
              <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">Chapters:</div>
                <div className="flex flex-wrap gap-2">
                  {video.chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        const v = document.querySelector('video');
                        if (v) v.currentTime = ch.timestamp;
                      }}
                      className="text-[11px] bg-neutral-800/90 hover:bg-red-500/20 hover:text-red-300 text-neutral-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      <span className="font-mono font-bold text-red-400 mr-1">{ch.timestampFormatted}</span>
                      <span>{ch.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {video.tags.map((tag) => (
                <span key={tag} className="text-red-400 hover:underline cursor-pointer text-[11px]">
                  #{tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="font-bold text-white hover:underline text-[11px] pt-1 block cursor-pointer"
            >
              {isDescriptionExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>

          {/* Comments Section */}
          <CommentsSection
            videoId={video.id}
            comments={comments}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
            onOpenSuperThanks={() => setShowSuperThanksModal(true)}
          />
        </div>

        {/* Right Recommended Column */}
        <div className={`space-y-4 ${isTheatreMode ? 'lg:col-span-12' : 'lg:col-span-4'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Up Next</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                Autoplay ON
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {recommendedVideos.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectVideo(rec.id)}
                className="group flex gap-3 p-1.5 rounded-xl hover:bg-neutral-900/90 border border-transparent hover:border-neutral-800 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800">
                  <img
                    src={rec.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop'}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono font-semibold px-1 rounded text-white">
                    {rec.durationFormatted}
                  </span>
                  {rec.is4KMaster && (
                    <span className="absolute top-1 left-1 bg-red-600 text-[9px] font-black px-1 rounded text-white shadow">
                      4K
                    </span>
                  )}
                  {rec.format === 'shorts' && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-black text-[9px] font-black px-1 rounded shadow flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      Short
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                    {rec.title}
                  </h4>
                  <div className="text-[11px] text-neutral-400 mt-1 truncate">
                    {rec.creator.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {rec.views.toLocaleString()} views • {rec.format === 'shorts' ? 'Short' : '4K Video'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Membership Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg border border-emerald-500/40">
              VIP
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Join {video.creator.name}</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Unlock exclusive 4K raw footage, badges in comments, and direct creator chat.
              </p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-left space-y-1.5 text-xs text-neutral-300">
              <div className="font-bold text-white">$4.99 / month tier includes:</div>
              <div>✓ Custom loyalty badge next to your comments</div>
              <div>✓ Behind-the-scenes 4K ProRes camera masters</div>
              <div>✓ Members-only community posts & polls</div>
            </div>
            <button
              onClick={() => {
                setIsMember(true);
                setShowJoinModal(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
            >
              Confirm VIP Membership ($4.99/mo)
            </button>
            <button
              onClick={() => setShowJoinModal(false)}
              className="text-xs text-neutral-400 hover:text-white block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
