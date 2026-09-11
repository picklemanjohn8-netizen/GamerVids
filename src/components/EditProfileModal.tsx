import React, { useState, useRef } from 'react';
import {
  X,
  User,
  AtSign,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Layers,
  Save,
  Tv,
} from 'lucide-react';
import { UserProfile, SocialLink } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const AVATAR_PRESETS = [
  {
    name: 'Cyberpunk Visionary',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Cinema Director',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Indie Filmmaker',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Nature Documentarian',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Tech Creator',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Digital Artist',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Sound & Audio Master',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=250&auto=format&fit=crop',
  },
  {
    name: 'Drone Pilot',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop',
  },
];

const BANNER_PRESETS = [
  {
    name: 'Neo Cyberpunk City',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Radiant Gradient Studio',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Alpine 4K Peaks',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Deep Cosmos Nebula',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Golden Hour Coast',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Minimal Obsidian Dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle.replace(/^@/, ''));
  const [avatar, setAvatar] = useState(profile.avatar);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);
  const [bio, setBio] = useState(profile.bio || '');
  const [category, setCategory] = useState(profile.category || 'Film & Animation');
  const [location, setLocation] = useState(profile.location || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    profile.socialLinks || [
      { id: 'sl-1', platform: 'Twitter / X', url: 'https://x.com' },
      { id: 'sl-2', platform: 'YouTube', url: 'https://youtube.com' },
    ]
  );

  const [activeTab, setActiveTab] = useState<'basic' | 'branding' | 'links'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image file upload via FileReader
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'avatar' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'avatar') {
          setAvatar(reader.result);
        } else {
          setBannerUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Clean and sanitize custom username
  const cleanHandle = (val: string) => {
    return val.replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase();
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHandle(cleanHandle(e.target.value));
  };

  // Social link helpers
  const handleAddLink = () => {
    const newLink: SocialLink = {
      id: 'sl-' + Date.now(),
      platform: 'Website',
      url: 'https://',
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleUpdateLink = (id: string, field: 'platform' | 'url', value: string) => {
    setSocialLinks(
      socialLinks.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveLink = (id: string) => {
    setSocialLinks(socialLinks.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Display name is required.');
      return;
    }
    if (!handle.trim()) {
      setErrorMessage('Username/handle is required.');
      return;
    }

    const formattedHandle = '@' + cleanHandle(handle);

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          handle: formattedHandle,
          avatar,
          bannerUrl,
          bio: bio.trim(),
          category,
          location: location.trim(),
          website: website.trim(),
          socialLinks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      onSave(data.profile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedPreviewHandle = '@' + (handle.trim() ? cleanHandle(handle) : 'username');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Customize Profile & Username
              </h2>
              <p className="text-[11px] text-neutral-400">
                Update your custom handle, channel banner, avatar, bio, and social links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'basic'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Basic Info & Username
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'branding'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Avatar & 4K Banner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'links'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Links & About
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFO & USERNAME */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Custom Username (Handle) Field */}
              <div className="p-4 bg-neutral-950/90 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-red-400" />
                    <span>Custom Username / Handle</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={handleHandleChange}
                    placeholder="e.g. pickleman or alexchen4k"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>

                <p className="text-[11px] text-neutral-400">
                  Your custom username creates your personal channel link: <span className="text-white font-mono">stream4k.tv/{formattedPreviewHandle}</span>.
                  Can contain letters, numbers, periods, and underscores.
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Display Channel Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen or Pickle Man Studios"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  This is the public title shown across your 4K uploads, comments, and home feed.
                </p>
              </div>

              {/* Channel Category */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Primary Content Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option>Film & Animation</option>
                  <option>Science & Technology</option>
                  <option>Travel & Events</option>
                  <option>Gaming</option>
                  <option>Music</option>
                  <option>Howto & Style</option>
                  <option>Entertainment</option>
                  <option>News & Politics</option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Channel Bio / Description</label>
                  <span className="text-[11px] text-neutral-500 font-mono">{bio.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell viewers about your 4K content, production gear, upload schedule, and community..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING (AVATAR & BANNER) */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white">Profile Picture / Avatar</label>
                <div className="flex flex-wrap items-center gap-4 p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800">
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-red-500/50 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold cursor-pointer"
                    >
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>Upload</span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={avatarInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'avatar')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Computer</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Avatar Preset Gallery */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Or select a verified creator avatar:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        title={p.name}
                        className={`relative rounded-xl overflow-hidden aspect-square border transition-all cursor-pointer ${
                          avatar === p.url
                            ? 'border-red-500 ring-2 ring-red-500/40 scale-105'
                            : 'border-neutral-800 hover:border-neutral-600'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Channel Banner Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-white">4K Channel Header Banner</label>
                <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 group shadow-md">
                  <img
                    src={bannerUrl}
                    alt="Channel Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4">
                    <div className="text-white text-xs font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-red-400" />
                      <span>4K Ultra HD Display Banner</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bannerInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'banner')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-neutral-800 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Or paste custom banner image URL (https://...)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />

                {/* Banner Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Or select a cinematic 4K master banner:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
                    {BANNER_PRESETS.map((bp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerUrl(bp.url)}
                        className={`relative rounded-xl overflow-hidden aspect-[16/7] border transition-all cursor-pointer group text-left ${
                          bannerUrl === bp.url
                            ? 'border-red-500 ring-2 ring-red-500/40 scale-102'
                            : 'border-neutral-800 hover:border-neutral-600'
                        }`}
                      >
                        <img src={bp.url} alt={bp.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 left-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                          {bp.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LINKS & LOCATION */}
          {activeTab === 'links' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Tokyo, Japan"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Primary Website / Portfolio</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Social Links List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-red-400" />
                    <span>Custom Social & Community Links</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl"
                    >
                      <select
                        value={link.platform}
                        onChange={(e) => handleUpdateLink(link.id, 'platform', e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option>Twitter / X</option>
                        <option>Instagram</option>
                        <option>YouTube</option>
                        <option>TikTok</option>
                        <option>Discord</option>
                        <option>GitHub</option>
                        <option>Twitch</option>
                        <option>Website</option>
                        <option>Other</option>
                      </select>

                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Preview Card */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Live Identity Preview
            </span>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/50"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{name || 'Your Name'}</span>
                  <span className="text-red-400 text-xs font-bold">✓</span>
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">
                    4K
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono truncate">
                  {formattedPreviewHandle}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile & Username'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
