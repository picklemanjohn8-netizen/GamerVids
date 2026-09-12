import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Play,
  Trash2,
  Filter,
  Sparkles,
  Compass,
  Flame,
  Tv,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react';
import { VideoItem } from '../types';
import { VideoCard } from './VideoCard';
import { getLocalWatchHistory } from '../utils/savedStorage';

interface SavedVideosViewProps {
  videos: VideoItem[];
  savedVideoIds: string[];
  onSelectVideo: (videoId: string) => void;
  onSelectShort: (videoId: string) => void;
  onShareVideo: (video: VideoItem) => void;
  onToggleSave: (videoId: string) => void;
  onClearSaved: () => void;
  onNavigateHome: () => void;
  onSelectChannel?: (handle: string) => void;
}

export const SavedVideosView: React.FC<SavedVideosViewProps> = ({
  videos,
  savedVideoIds,
  onSelectVideo,
  onSelectShort,
  onShareVideo,
  onToggleSave,
  onClearSaved,
  onNavigateHome,
  onSelectChannel,
}) => {
  const [filterFormat, setFilterFormat] = useState<'all' | '4k' | 'long-form' | 'shorts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const watchHistory = useMemo(() => getLocalWatchHistory(), []);

  // Map saved video IDs to actual video items, preserving saved order
  const savedVideos = useMemo(() => {
    return savedVideoIds
      .map((id) => videos.find((v) => v.id === id))
      .filter((v): v is VideoItem => Boolean(v));
  }, [savedVideoIds, videos]);

  // Filter saved videos
  const filteredSavedVideos = useMemo(() => {
    return savedVideos.filter((v) => {
      // Format filter
      if (filterFormat === '4k' && !v.is4KMaster && !v.maxResolution.includes('4K')) return false;
      if (filterFormat === 'long-form' && v.format !== 'long-form') return false;
      if (filterFormat === 'shorts' && v.format !== 'shorts') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchDesc = v.description.toLowerCase().includes(q);
        const matchCreator = v.creator.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCreator) return false;
      }

      return true;
    });
  }, [savedVideos, filterFormat, searchQuery]);

  // Total duration calculation
  const totalSeconds = useMemo(() => {
    return savedVideos.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  }, [savedVideos]);

  const totalDurationFormatted = useMemo(() => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} mins`;
  }, [totalSeconds]);

  const handlePlayFirst = () => {
    if (filteredSavedVideos.length > 0) {
      const first = filteredSavedVideos[0];
      if (first.format === 'shorts') {
        onSelectShort(first.id);
      } else {
        onSelectVideo(first.id);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Persistent Website Library</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Saved Videos & Watch Later</span>
              <span className="text-xs md:text-sm font-mono font-bold bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-xl border border-neutral-700">
                {savedVideos.length} {savedVideos.length === 1 ? 'Video' : 'Videos'}
              </span>
            </h1>

            <p className="text-xs md:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Videos saved to your website library are stored permanently on the server and your device.
              They remain saved even after you close the tab or leave the website.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Total runtime: <strong className="text-neutral-200">{totalDurationFormatted}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>4K Masters: <strong className="text-neutral-200">{savedVideos.filter((v) => v.is4KMaster || v.maxResolution.includes('4K')).length}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-saved to database</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {savedVideos.length > 0 && (
              <button
                onClick={handlePlayFirst}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All</span>
              </button>
            )}

            {savedVideos.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-red-400 border border-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Clear all saved videos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore More</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Confirmation Modal for Clearing */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Clear All Saved Videos?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to remove all {savedVideos.length} saved videos from your library?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearSaved();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Search Bar */}
      {savedVideos.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Format filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterFormat('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterFormat === 'all'
                  ? 'bg-white text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              All ({savedVideos.length})
            </button>
            <button
              onClick={() => setFilterFormat('4k')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterFormat === '4k'
                  ? 'bg-red-600 text-white shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              4K Ultra HD
            </button>
            <button
              onClick={() => setFilterFormat('long-form')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterFormat === 'long-form'
                  ? 'bg-white text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              Long-Form
            </button>
            <button
              onClick={() => setFilterFormat('shorts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterFormat === 'shorts'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              Shorts
            </button>
          </div>

          {/* Search within saved videos */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search saved videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {savedVideos.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center space-y-4 bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
            <Bookmark className="w-8 h-8 text-neutral-500" />
          </div>
          <h2 className="text-lg font-bold text-white">No Saved Videos Yet</h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
            Save any video or short by clicking the bookmark icon on cards or on the watch page.
            Your saved collection is preserved on the website even after leaving or reloading!
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/30 cursor-pointer"
            >
              Browse 4K Videos & Save
            </button>
          </div>
        </div>
      ) : filteredSavedVideos.length === 0 ? (
        /* No Search Matches */
        <div className="py-16 text-center space-y-3 bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8">
          <Filter className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No saved videos match your filter</h3>
          <p className="text-xs text-neutral-400">
            Try adjusting your search query or switching to &ldquo;All&rdquo;.
          </p>
          <button
            onClick={() => {
              setFilterFormat('all');
              setSearchQuery('');
            }}
            className="text-xs text-red-400 hover:underline font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Grid of Saved Videos */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Showing {filteredSavedVideos.length} saved {filteredSavedVideos.length === 1 ? 'item' : 'items'}</span>
            <span className="text-[11px] text-neutral-500">Click bookmark button to remove from saved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
            {filteredSavedVideos.map((video) => {
              const progress = watchHistory[video.id];
              const progressPct =
                progress && progress.duration > 0
                  ? Math.min(100, Math.round((progress.timestamp / progress.duration) * 100))
                  : 0;

              return (
                <div key={video.id} className="relative group/saved flex flex-col">
                  {/* Standard VideoCard */}
                  <VideoCard
                    video={video}
                    isSaved={true}
                    onToggleSave={onToggleSave}
                    onSelect={(id) => {
                      if (video.format === 'shorts') {
                        onSelectShort(id);
                      } else {
                        onSelectVideo(id);
                      }
                    }}
                    onShare={onShareVideo}
                    onSelectChannel={onSelectChannel}
                  />

                  {/* Watch History Progress Indicator if resumed */}
                  {progressPct > 0 && (
                    <div className="mt-1 px-1 flex items-center justify-between text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1 text-red-400">
                        <Clock className="w-3 h-3" />
                        <span>Watched {progressPct}%</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        Resumes at {Math.floor(progress!.timestamp / 60)}:{((progress!.timestamp % 60) || 0).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
