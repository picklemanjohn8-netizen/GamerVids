import React, { useRef, useState } from 'react';
import { Play, Share2, ShieldCheck, DollarSign, Flame, MoreVertical, Bookmark, BookmarkCheck } from 'lucide-react';
import { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  isSaved?: boolean;
  onToggleSave?: (videoId: string) => void;
  onSelect: (videoId: string) => void;
  onShare: (video: VideoItem) => void;
  onSelectChannel?: (handle: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isSaved = false,
  onToggleSave,
  onSelect,
  onShare,
  onSelectChannel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverVideoRef.current) {
      hoverVideoRef.current.currentTime = 2;
      hoverVideoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverVideoRef.current) {
      hoverVideoRef.current.pause();
    }
  };

  return (
    <div
      className="group flex flex-col space-y-3 cursor-pointer"
      onClick={() => onSelect(video.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Video Preview Box */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 transition-all duration-300 shadow-md group-hover:shadow-xl">
        {/* Still thumbnail */}
        <img
          src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop'}
          alt={video.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Hover preview video */}
        {video.videoUrl ? (
          <video
            ref={hoverVideoRef}
            src={video.videoUrl}
            muted
            playsInline
            loop
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Duration Badge */}
        <span className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-xs text-white text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md border border-white/10">
          {video.durationFormatted}
        </span>

        {/* 4K Resolution Master Badge */}
        {video.is4KMaster && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded shadow-lg border border-red-400/30">
            4K UHD
          </span>
        )}

        {/* Format tag */}
        {video.format === 'shorts' && (
          <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
            <Flame className="w-3 h-3" />
            SHORT
          </span>
        )}

        {/* Fast Action Quick Share overlay on hover */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(video);
            }}
            className="p-1.5 rounded-lg bg-black/75 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md backdrop-blur-xs"
            title="Direct Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(video.id);
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer shadow-md backdrop-blur-xs ${
                isSaved
                  ? 'bg-red-600 text-white opacity-100 ring-1 ring-red-400/50 hover:bg-red-500'
                  : 'bg-black/75 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100'
              }`}
              title={isSaved ? 'Saved to website (click to remove)' : 'Save video on website'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Video Info Details */}
      <div className="flex gap-3 px-1">
        {/* Creator Avatar */}
        <img
          src={video.creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
          alt={video.creator.name}
          onClick={(e) => {
            if (onSelectChannel) {
              e.stopPropagation();
              onSelectChannel(video.creator.handle);
            }
          }}
          className={`w-9 h-9 rounded-full object-cover ring-1 ring-neutral-700 shrink-0 mt-0.5 transition-all ${
            onSelectChannel ? 'hover:ring-red-500 cursor-pointer' : ''
          }`}
        />

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>

          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-400">
            <span
              onClick={(e) => {
                if (onSelectChannel) {
                  e.stopPropagation();
                  onSelectChannel(video.creator.handle);
                }
              }}
              className={`truncate ${
                onSelectChannel
                  ? 'hover:text-red-300 hover:underline cursor-pointer'
                  : 'hover:text-neutral-200'
              }`}
            >
              {video.creator.name}
            </span>
            {video.creator.isVerified && (
              <span className="text-red-400 text-[11px] font-bold">✓</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
            <span>{video.views.toLocaleString()} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            {video.isMonetized && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                  <DollarSign className="w-2.5 h-2.5" /> YPP
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
