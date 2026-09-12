import React, { useState } from 'react';
import {
  User,
  AtSign,
  Edit3,
  Upload,
  Film,
  Flame,
  Globe,
  MapPin,
  Calendar,
  Share2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  DollarSign,
  ExternalLink,
  SlidersHorizontal,
  Play,
  Eye,
  Heart,
  Plus,
  Tv,
} from 'lucide-react';
import { UserProfile, VideoItem } from '../types';
import { VideoCard } from './VideoCard';
import { EditProfileModal } from './EditProfileModal';

interface ProfilePageProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  videos: VideoItem[];
  savedVideoIds?: string[];
  onToggleSave?: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  onSelectShort: (videoId: string) => void;
  onShareVideo?: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenStudio?: () => void;
  onOpenEditModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  isOwnProfile,
  videos,
  savedVideoIds = [],
  onToggleSave,
  onSelectVideo,
  onSelectShort,
  onShareVideo,
  onOpenUpload,
  onUpdateProfile,
  onOpenStudio,
  onOpenEditModal,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'about' | 'customize'>('videos');
  const [videoSort, setVideoSort] = useState<'latest' | 'views'>('latest');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter videos belonging to this creator
  const channelVideos = videos.filter((v) => {
    const creatorHandle = v.creator.handle.toLowerCase();
    const targetHandle = profile.handle.toLowerCase();
    const creatorName = v.creator.name.toLowerCase();
    const targetName = profile.name.toLowerCase();
    return (
      creatorHandle === targetHandle ||
      creatorName === targetName ||
      (isOwnProfile && v.creator.id === 'chan-current-user')
    );
  });

  const longFormVideos = channelVideos.filter((v) => v.format === 'long-form' || !v.format);
  const shortsVideos = channelVideos.filter((v) => v.format === 'shorts');

  // Sorted long-form videos
  const sortedVideos = [...longFormVideos].sort((a, b) => {
    if (videoSort === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalChannelViews = channelVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = channelVideos.reduce((acc, v) => acc + (v.likes || 0), 0);

  const handleShareChannel = () => {
    const url = window.location.origin + '?channel=' + encodeURIComponent(profile.handle);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 space-y-6 animate-in fade-in duration-200">
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={(updated) => {
          onUpdateProfile(updated);
        }}
      />

      {/* Hero Channel Header & Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Banner */}
        <div className="relative aspect-[4/1] sm:aspect-[5/1] lg:aspect-[6/1] w-full overflow-hidden bg-neutral-950">
          <img
            src={profile.bannerUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop'}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />

          {/* Banner 4K Badge */}
          <div className="absolute top-3 right-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>4K Master Profile</span>
          </div>

          {/* Quick Edit Banner Button (for owner) */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-3 right-4 bg-black/75 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <Edit3 className="w-3.5 h-3.5 text-red-400" />
              <span>Edit Header Banner</span>
            </button>
          )}
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 sm:-mt-16 relative z-10">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative group">
                <img
                  src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-neutral-900 shadow-2xl bg-neutral-950"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer ring-4 ring-neutral-900"
                    title="Change Avatar"
                  >
                    <Edit3 className="w-5 h-5 text-red-400" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.isVerified && (
                    <span
                      className="text-red-400 text-sm font-bold"
                      title="Verified 4K Creator"
                    >
                      ✓
                    </span>
                  )}
                  {profile.isPartner && (
                    <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> YPP Partner
                    </span>
                  )}
                  {profile.category && (
                    <span className="bg-neutral-800 text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {profile.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <span className="font-mono font-bold text-neutral-200">
                    {profile.handle}
                  </span>
                  <span>•</span>
                  <span>{profile.subscribers.toLocaleString()} subscribers</span>
                  <span>•</span>
                  <span>{channelVideos.length} videos</span>
                  <span>•</span>
                  <span>{totalChannelViews.toLocaleString()} total views</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-950 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Customize Profile & Username</span>
                  </button>

                  <button
                    onClick={onOpenUpload}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-red-400" />
                    <span>Upload Video</span>
                  </button>

                  {onOpenStudio && (
                    <button
                      onClick={onOpenStudio}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span>Studio</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSubscribed
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-white text-neutral-950 hover:bg-neutral-200'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                </>
              )}

              <button
                onClick={handleShareChannel}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                title="Share Channel URL"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copiedLink && (
                <span className="text-xs text-emerald-400 font-semibold">Link copied!</span>
              )}
            </div>
          </div>

          {/* Bio & Social Links Bar */}
          <div className="mt-4 pt-4 border-t border-neutral-800/80 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                {profile.bio || 'Welcome to my official 4K video channel.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-neutral-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.joinedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{profile.joinedDate}</span>
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 hover:underline font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Social Link Badges */}
            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div className="lg:col-span-4 flex flex-wrap items-center lg:justify-end gap-2">
                {profile.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[11px] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>{link.platform}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Channel Tab Navigation */}
        <div className="flex border-t border-neutral-800 bg-neutral-950/60 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'videos'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="w-4 h-4 text-red-400" />
            <span>4K Videos ({longFormVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shorts')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'shorts'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Shorts ({shortsVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>About & Stats</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('customize')}
              className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'customize'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>Customize Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT: VIDEOS */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Channel Uploads</span>
              <span className="text-xs text-neutral-500 font-normal">
                ({sortedVideos.length} available)
              </span>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Sort by:</span>
              <button
                onClick={() => setVideoSort('latest')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  videoSort === 'latest'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setVideoSort('views')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  videoSort === 'views'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Most Popular
              </button>
            </div>
          </div>

          {sortedVideos.length === 0 ? (
            <div className="p-12 text-center bg-neutral-900/60 border border-neutral-800 rounded-3xl space-y-3">
              <Film className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No 4K videos uploaded yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {isOwnProfile
                  ? 'Upload your first 4K ultra-high-definition video to showcase your cinematography.'
                  : 'This creator has not uploaded any 4K videos yet.'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={onOpenUpload}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload 4K Video Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {sortedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isSaved={savedVideoIds.includes(video.id)}
                  onToggleSave={onToggleSave}
                  onSelect={onSelectVideo}
                  onShare={onShareVideo || (() => {})}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SHORTS */}
      {activeTab === 'shorts' && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Vertical 9:16 Shorts</span>
            <span className="text-xs text-neutral-500 font-normal">
              ({shortsVideos.length} available)
            </span>
          </div>

          {shortsVideos.length === 0 ? (
            <div className="p-12 text-center bg-neutral-900/60 border border-neutral-800 rounded-3xl space-y-3">
              <Flame className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No shorts yet</h3>
              <p className="text-xs text-neutral-400">
                Capture quick vertical video moments and publish to YouTube Shorts format.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {shortsVideos.map((short) => (
                <div
                  key={short.id}
                  onClick={() => onSelectShort(short.id)}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer shadow-md hover:shadow-xl transition-all"
                >
                  <img
                    src={short.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop'}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <span className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                      {short.title}
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{short.views.toLocaleString()} views</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ABOUT */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Description</h3>
              <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {profile.bio || 'No channel description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <h3 className="text-sm font-bold text-white mb-3">Links & Communities</h3>
              <div className="space-y-2">
                {profile.website && (
                  <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                    <span className="text-xs text-neutral-300 font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-red-400" />
                      <span>Official Website</span>
                    </span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-red-400 hover:underline flex items-center gap-1"
                    >
                      <span>{profile.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {profile.socialLinks?.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800/80"
                  >
                    <span className="text-xs text-neutral-300 font-semibold">{link.platform}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono truncate max-w-xs"
                    >
                      <span>{link.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automated AI Content Safety Certification</span>
              </h3>
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Automated Gemini Safety Audited</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  All 4K video uploads and comment streams on this channel are scanned in real-time by the Gemini AI safety protocol for IP integrity, child safety, and high-bitrate technical compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Channel Statistics</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-neutral-800">
                  <span className="text-neutral-400">Custom Username</span>
                  <span className="text-white font-mono font-bold">{profile.handle}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-800">
                  <span className="text-neutral-400">Joined</span>
                  <span className="text-white">{profile.joinedDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-800">
                  <span className="text-neutral-400">Location</span>
                  <span className="text-white">{profile.location || 'Global'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-800">
                  <span className="text-neutral-400">Total 4K Videos</span>
                  <span className="text-white font-bold">{channelVideos.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-800">
                  <span className="text-neutral-400">Total Views</span>
                  <span className="text-white font-bold">{totalChannelViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Partner Program</span>
                  <span className="text-amber-400 font-bold">YPP Certified Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INLINE CUSTOMIZE PROFILE TAB */}
      {activeTab === 'customize' && isOwnProfile && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-400" />
                <span>Customize Profile, Username & Branding</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Directly customize your handle, identity, avatar, and 4K banner. Changes take effect across your channel immediately.
              </p>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Open Customizer Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <AtSign className="w-4 h-4 text-red-400" />
                <span>Custom Username (Handle)</span>
              </div>
              <p className="text-xs text-neutral-400">
                Current custom handle is <span className="text-white font-mono font-bold">{profile.handle}</span>.
                You can change it to any unique handle you desire.
              </p>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Change Username
              </button>
            </div>

            <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>Avatar & Channel Icon</span>
              </div>
              <p className="text-xs text-neutral-400">
                Upload your custom photo or choose from verified creator avatar presets.
              </p>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Update Avatar
              </button>
            </div>

            <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>4K Header Banner</span>
              </div>
              <p className="text-xs text-neutral-400">
                Set a 4K wide-format cinema banner that highlights your creative style.
              </p>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Change Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
