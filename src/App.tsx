import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeFeed } from './components/HomeFeed';
import { WatchView } from './components/WatchView';
import { ShortsFeed } from './components/ShortsFeed';
import { CreatorStudio } from './components/CreatorStudio';
import { ModerationDashboard } from './components/ModerationDashboard';
import { ProfilePage } from './components/ProfilePage';
import { EditProfileModal } from './components/EditProfileModal';
import { UploadModal } from './components/UploadModal';
import { DirectShareModal } from './components/DirectShareModal';
import { VideoItem, UserProfile } from './types';
import { Sparkles, CheckCircle2, Film, Flame, DollarSign, ShieldCheck } from 'lucide-react';

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-current-1',
  name: 'Alex Chen (4K Studio)',
  handle: '@alexchen4k',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop',
  bio: 'Filmmaker and 4K cinematographer documenting the future of visual arts, urban architectures, and HDR color technology. Subscribe for weekly 2160p masters.',
  category: 'Film & Animation',
  location: 'San Francisco, CA',
  website: 'https://alexchen.video',
  socialLinks: [
    { id: 'sl-1', platform: 'Twitter / X', url: 'https://x.com/alexchen4k' },
    { id: 'sl-2', platform: 'Instagram', url: 'https://instagram.com/alexchen4k' },
    { id: 'sl-3', platform: 'YouTube', url: 'https://youtube.com/@alexchen4k' },
  ],
  subscribers: 245000,
  isVerified: true,
  isPartner: true,
  joinedDate: 'March 2024',
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'shorts' | 'studio' | 'moderation' | 'watch' | 'profile'>('home');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [shareVideoTarget, setShareVideoTarget] = useState<VideoItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active current user profile (customizable and persistent)
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [selectedChannelProfile, setSelectedChannelProfile] = useState<UserProfile | null>(null);

  // Current user representation for components
  const currentUser = {
    name: userProfile.name,
    handle: userProfile.handle,
    avatar: userProfile.avatar,
  };

  // Fetch initial profile
  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  // Fetch initial videos
  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);

        // Check if URL has query parameter for watch
        const params = new URLSearchParams(window.location.search);
        const watchParam = params.get('watch');
        const timeParam = params.get('t');
        if (watchParam) {
          setSelectedVideoId(watchParam);
          if (timeParam) setInitialTime(parseFloat(timeParam) || 0);
          setCurrentView('watch');
        }
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchVideos();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setInitialTime(0);
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track view count
    fetch(`/api/videos/${videoId}/view`, { method: 'POST' }).catch(() => {});
  };

  const handleSelectShort = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentView('shorts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoPublished = (newVideo: VideoItem) => {
    setVideos([newVideo, ...videos]);
    showToast(`"${newVideo.title}" successfully published and verified in 4K!`);
    handleSelectVideo(newVideo.id);
  };

  const handleUpdateVideo = (updated: VideoItem) => {
    setVideos(videos.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    if (selectedChannelProfile && selectedChannelProfile.id === updated.id) {
      setSelectedChannelProfile(updated);
    }
    // Propagate updated creator name and avatar to local video list
    setVideos((prevVideos) =>
      prevVideos.map((v) => {
        if (
          v.creator.handle === userProfile.handle ||
          v.creator.handle === updated.handle ||
          v.creator.name === userProfile.name ||
          v.creator.id === updated.id
        ) {
          return {
            ...v,
            creator: {
              ...v.creator,
              name: updated.name,
              handle: updated.handle,
              avatar: updated.avatar,
            },
          };
        }
        return v;
      })
    );
    showToast(`Profile & username successfully updated to ${updated.handle}!`);
  };

  const handleSelectChannel = async (identifier: string) => {
    if (
      identifier.toLowerCase() === userProfile.handle.toLowerCase() ||
      identifier.toLowerCase() === userProfile.name.toLowerCase()
    ) {
      setSelectedChannelProfile(null);
      setCurrentView('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(identifier)}`);
      const data = await res.json();
      if (data.success && data.channel) {
        setSelectedChannelProfile(data.channel);
        setCurrentView('profile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback channel info
        const matchingVideo = videos.find(
          (v) =>
            v.creator.handle.toLowerCase() === identifier.toLowerCase() ||
            v.creator.name.toLowerCase() === identifier.toLowerCase()
        );
        if (matchingVideo) {
          setSelectedChannelProfile({
            id: matchingVideo.creator.id || 'chan-' + identifier,
            name: matchingVideo.creator.name,
            handle: matchingVideo.creator.handle,
            avatar: matchingVideo.creator.avatar,
            bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
            bio: `${matchingVideo.creator.name} official 4K channel. Producing high fidelity content.`,
            category: 'Creators & 4K Masters',
            location: 'Global',
            website: '',
            socialLinks: [],
            subscribers: matchingVideo.creator.subscribers,
            isVerified: matchingVideo.creator.isVerified,
            isPartner: true,
            joinedDate: '2024',
          });
          setCurrentView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (e) {
      console.error('Failed to open channel:', e);
    }
  };

  const handleSwitchUser = async (user: { name: string; handle: string; avatar: string }) => {
    const updated: UserProfile = {
      ...userProfile,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      bio: `Official creator profile for ${user.name}. Creating top-tier 4K and HDR content.`,
    };
    setUserProfile(updated);
    setSelectedChannelProfile(null);
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
    }
    showToast(`Switched active profile to ${user.name}`);
  };

  const activeVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];
  const shortsList = videos.filter((v) => v.format === 'shorts');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView === 'watch' ? 'home' : currentView}
        onViewChange={(view) => {
          if (view === 'profile') {
            setSelectedChannelProfile(null);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        onVideoPublished={handleVideoPublished}
      />

      {/* Edit Profile & Username Customizer Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={userProfile}
        onSave={handleUpdateProfile}
      />

      {/* Share Modal Triggered from Home Cards */}
      {shareVideoTarget && (
        <DirectShareModal
          video={shareVideoTarget}
          isOpen={true}
          onClose={() => setShareVideoTarget(null)}
          currentUser={currentUser}
          onShareSuccess={(newShares) => {
            handleUpdateVideo({ ...shareVideoTarget, shares: newShares });
            showToast('Direct share logged and link copied!');
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 font-mono">Connecting to 4K Master Video Network...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeFeed
                videos={videos}
                searchQuery={searchQuery}
                onSelectVideo={handleSelectVideo}
                onSelectShort={handleSelectShort}
                onShareVideo={(v) => setShareVideoTarget(v)}
                onOpenUpload={() => setIsUploadOpen(true)}
                onSelectChannel={handleSelectChannel}
              />
            )}

            {currentView === 'watch' && activeVideo && (
              <WatchView
                video={activeVideo}
                allVideos={videos}
                onSelectVideo={handleSelectVideo}
                currentUser={currentUser}
                onUpdateVideo={handleUpdateVideo}
                initialTime={initialTime}
                onSelectChannel={handleSelectChannel}
              />
            )}

            {currentView === 'shorts' && (
              <ShortsFeed
                shorts={shortsList.length > 0 ? shortsList : videos}
                currentUser={currentUser}
                onUpdateShort={handleUpdateVideo}
              />
            )}

            {currentView === 'studio' && (
              <CreatorStudio
                videos={videos}
                currentUser={currentUser}
                onOpenUpload={() => setIsUploadOpen(true)}
                onSelectVideo={handleSelectVideo}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
                onViewProfile={() => {
                  setSelectedChannelProfile(null);
                  setCurrentView('profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentView === 'profile' && (
              <ProfilePage
                profile={selectedChannelProfile || userProfile}
                isOwnProfile={!selectedChannelProfile || selectedChannelProfile.handle === userProfile.handle}
                videos={videos}
                onSelectVideo={handleSelectVideo}
                onSelectShort={handleSelectShort}
                onShareVideo={(v) => setShareVideoTarget(v)}
                onOpenUpload={() => setIsUploadOpen(true)}
                onUpdateProfile={handleUpdateProfile}
                onOpenEditModal={() => setIsEditProfileOpen(true)}
              />
            )}

            {currentView === 'moderation' && <ModerationDashboard />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-6 px-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-white text-[10px] font-black">
              4K
            </div>
            <span className="font-bold text-neutral-300">Stream4K</span>
            <span>• Video Social Media & Long-form 4K Ultra HD Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1 text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Automated AI Content Moderation
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <DollarSign className="w-3.5 h-3.5" /> Creator Partner Monetization
            </span>
            <span>•</span>
            <span>Custom Profiles & @usernames</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
