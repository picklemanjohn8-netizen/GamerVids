import React, { useState } from 'react';
import { Flame, Tv, Sparkles, Filter, ShieldCheck, Film, Compass } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface HomeFeedProps {
  videos: VideoItem[];
  searchQuery: string;
  onSelectVideo: (videoId: string) => void;
  onSelectShort: (videoId: string) => void;
  onShareVideo: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onSelectChannel?: (handle: string) => void;
}

const CATEGORY_CHIPS = [
  'All',
  '4K Ultra HD',
  'Long-form (YouTube style)',
  'Shorts',
  'Film & Animation',
  'Science & Technology',
  'Travel & Events',
  'Gaming',
];

export const HomeFeed: React.FC<HomeFeedProps> = ({
  videos,
  searchQuery,
  onSelectVideo,
  onSelectShort,
  onShareVideo,
  onOpenUpload,
  onSelectChannel,
}) => {
  const [selectedChip, setSelectedChip] = useState('All');

  // Filter logic
  const filteredVideos = videos.filter((v) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      const matchCreator = v.creator.name.toLowerCase().includes(q);
      const matchTags = v.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCreator && !matchTags) return false;
    }

    // Category chips
    if (selectedChip === '4K Ultra HD') {
      return v.is4KMaster || v.maxResolution.includes('4K');
    }
    if (selectedChip === 'Long-form (YouTube style)') {
      return v.format === 'long-form';
    }
    if (selectedChip === 'Shorts') {
      return v.format === 'shorts';
    }
    if (selectedChip !== 'All') {
      return v.category.toLowerCase() === selectedChip.toLowerCase();
    }

    return true;
  });

  const longFormVideos = filteredVideos.filter((v) => v.format === 'long-form');
  const shorts = videos.filter((v) => v.format === 'shorts');

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 space-y-6">
      {/* Category Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setSelectedChip(chip)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedChip === chip
                ? 'bg-white text-neutral-950 shadow-md font-bold'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Featured 4K Master Banner */}
      {selectedChip === 'All' && !searchQuery && longFormVideos.length > 0 && (
        <div
          onClick={() => onSelectVideo(longFormVideos[0].id)}
          className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-red-500/50 shadow-2xl transition-all cursor-pointer group"
        >
          <div className="aspect-[21/9] sm:aspect-[24/9] w-full relative">
            <img
              src={longFormVideos[0].thumbnailUrl}
              alt={longFormVideos[0].title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded shadow">
                  FEATURED 4K ULTRA HD PREMIERE
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white font-semibold text-xs px-2 py-0.5 rounded border border-white/20">
                  {longFormVideos[0].durationFormatted}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white group-hover:text-red-400 transition-colors max-w-2xl leading-tight">
                {longFormVideos[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl line-clamp-2">
                {longFormVideos[0].description}
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
                <span className="text-white font-bold">{longFormVideos[0].creator.name}</span>
                <span>•</span>
                <span>{longFormVideos[0].views.toLocaleString()} views</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> AI Moderation Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated YouTube Shorts Horizontal Row */}
      {shorts.length > 0 && selectedChip !== 'Long-form (YouTube style)' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-current" />
              <h2 className="text-base font-bold text-white">Shorts</h2>
              <span className="text-[11px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-800">
                4K Vertical
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {shorts.map((short) => (
              <div
                key={short.id}
                onClick={() => onSelectShort(short.id)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 shadow-lg cursor-pointer transition-all duration-300"
              >
                <img
                  src={short.thumbnailUrl}
                  alt={short.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3 space-y-1">
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                    {short.title}
                  </h4>
                  <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                    <span>{short.views.toLocaleString()} views</span>
                    <span className="text-amber-400 font-bold">4K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Long-Form Videos Section (YouTube-style) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Long-form 4K Videos & Streams'}
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            {longFormVideos.length} videos available
          </span>
        </div>

        {longFormVideos.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8">
            <Film className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No videos found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Be the first to upload and publish a 4K masterpiece or short to the network!
            </p>
            <button
              onClick={onOpenUpload}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Upload 4K Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
            {longFormVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onShare={onShareVideo}
                onSelectChannel={onSelectChannel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
