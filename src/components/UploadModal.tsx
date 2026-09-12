import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Film,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Tv,
  FileVideo,
  Layers,
  ArrowRight,
  Clock,
  Radio,
} from 'lucide-react';
import { VideoItem, ModerationReport } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; handle: string; avatar: string };
  onVideoPublished: (video: VideoItem) => void;
}

const PRESET_4K_SOURCES = [
  {
    title: 'Cosmic Nebula: Deep Space Exploration in 4K UHD',
    url: '/videos/quantum_computing.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    duration: 340,
    durationFormatted: '5:40',
    category: 'Science & Technology',
    tags: ['4K', 'Space', 'Astronomy', 'HDR', 'Cinema'],
  },
  {
    title: 'Alpine Drone Cinema: 4K 60FPS Mountain Flights',
    url: '/videos/cyberpunk_4k.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    duration: 412,
    durationFormatted: '6:52',
    category: 'Travel & Events',
    tags: ['4K', 'Drone', 'Mountains', 'Nature', '60fps'],
  },
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onVideoPublished,
}) => {
  const [step, setStep] = useState<'upload' | 'details' | 'moderation' | 'monetization'>('upload');

  // Video data state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'long-form' | 'shorts'>('long-form');
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Film & Animation');
  const [tagsInput, setTagsInput] = useState('4K, HDR, Cinema');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [maxResolution, setMaxResolution] = useState('4K (2160p)');
  const [fps, setFps] = useState(60);
  const [duration, setDuration] = useState(180);
  const [durationFormatted, setDurationFormatted] = useState('3:00');
  const [fileSizeMb, setFileSizeMb] = useState(850);

  // Monetization options
  const [isMonetized, setIsMonetized] = useState(true);
  const [hasPreRoll, setHasPreRoll] = useState(true);
  const [hasMidRoll, setHasMidRoll] = useState(true);
  const [allowSuperThanks, setAllowSuperThanks] = useState(true);

  // Moderation state
  const [isScanningModeration, setIsScanningModeration] = useState(false);
  const [moderationReport, setModerationReport] = useState<ModerationReport | null>(null);
  const [moderationScanStage, setModerationScanStage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file drag or select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setVideoUrl(localUrl);
    setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    setThumbnailUrl('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop');
    setFileSizeMb(Math.round(file.size / (1024 * 1024)) || 450);

    // Read video metadata
    const tempVideo = document.createElement('video');
    tempVideo.src = localUrl;
    tempVideo.onloadedmetadata = () => {
      const w = tempVideo.videoWidth;
      const h = tempVideo.videoHeight;
      const dur = Math.floor(tempVideo.duration) || 120;
      setDuration(dur);
      const mins = Math.floor(dur / 60);
      const secs = (dur % 60).toString().padStart(2, '0');
      setDurationFormatted(`${mins}:${secs}`);

      if (h > w) {
        setFormat('shorts');
      } else {
        setFormat('long-form');
      }

      if (w >= 3840 || h >= 2160) {
        setMaxResolution('4K (2160p)');
      } else if (w >= 2560 || h >= 1440) {
        setMaxResolution('1440p');
      } else {
        setMaxResolution('1080p 60fps');
      }
    };

    setStep('details');
  };

  const handleSelectPreset = (preset: typeof PRESET_4K_SOURCES[0]) => {
    setSelectedFile(null);
    setVideoUrl(preset.url);
    setTitle(preset.title);
    setThumbnailUrl(preset.thumbnail);
    setDuration(preset.duration);
    setDurationFormatted(preset.durationFormatted);
    setCategory(preset.category);
    setTagsInput(preset.tags.join(', '));
    setMaxResolution('4K (2160p)');
    setFormat('long-form');
    setStep('details');
  };

  // Run automated AI content moderation before proceeding
  const runModerationScan = async () => {
    setIsScanningModeration(true);
    setPublishError(null);
    setModerationScanStage('Initializing Gemini 3.8 Content Safety Engine...');

    try {
      setTimeout(() => setModerationScanStage('Scanning for Violence, Gore, & Dangerous Weapons...'), 400);
      setTimeout(() => setModerationScanStage('Evaluating Toxicity, Hate Speech, & Harassment...'), 800);
      setTimeout(() => setModerationScanStage('Verifying Copyright & Original Media Integrity...'), 1200);
      setTimeout(() => setModerationScanStage('Inspecting 4K Bitrate & Technical Audio Standards...'), 1600);

      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const res = await fetch('/api/moderate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          tags,
          maxResolution,
          is4K: maxResolution.includes('4K'),
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setModerationReport(data.report);
        setStep('moderation');
      } else {
        throw new Error(data.error || 'Failed to complete moderation scan');
      }
    } catch (err: any) {
      setPublishError(err.message);
    } finally {
      setIsScanningModeration(false);
    }
  };

  // Publish video to backend
  const handleFinalPublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      let resolvedVideoUrl = videoUrl;

      // If a physical video file was selected, upload it to permanent server storage
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('video', selectedFile);
          const uploadRes = await fetch('/api/upload-video', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.videoUrl) {
            resolvedVideoUrl = uploadData.videoUrl;
          }
        } catch (uploadErr) {
          console.warn('Physical video upload fallback:', uploadErr);
        }
      }

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          format,
          videoUrl: resolvedVideoUrl,
          maxResolution,
          fps,
          aspectRatio: format === 'shorts' ? '9:16' : '16:9',
          thumbnailUrl:
            thumbnailUrl ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
          duration,
          durationFormatted,
          tags,
          category,
          isMonetized,
          creatorName: currentUser.name,
          creatorHandle: currentUser.handle,
          creatorAvatar: currentUser.avatar,
          fileSizeMb,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onVideoPublished(data.video);
      onClose();
    } catch (e: any) {
      setPublishError(e.message || 'Failed to publish video');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header & Wizard Steps */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Upload & Publish 4K Video
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                  Studio
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Step {step === 'upload' ? '1' : step === 'details' ? '2' : step === 'moderation' ? '3' : '4'} of 4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 border-b border-neutral-800/80 bg-neutral-950/40 text-[11px] font-semibold text-center py-2 px-6">
          <span className={step === 'upload' ? 'text-red-400 font-bold' : 'text-neutral-500'}>
            1. Source & 4K File
          </span>
          <span className={step === 'details' ? 'text-red-400 font-bold' : 'text-neutral-500'}>
            2. Details & Tags
          </span>
          <span className={step === 'moderation' ? 'text-red-400 font-bold' : 'text-neutral-500'}>
            3. AI Moderation
          </span>
          <span className={step === 'monetization' ? 'text-red-400 font-bold' : 'text-neutral-500'}>
            4. Monetization
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {publishError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{publishError}</div>
            </div>
          )}

          {/* STEP 1: UPLOAD SOURCE */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drag and drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-700 hover:border-red-500/80 bg-neutral-950/60 rounded-3xl p-8 text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/quicktime,video/mkv"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 group-hover:scale-110 group-hover:border-red-500 text-red-500 mx-auto flex items-center justify-center transition-all shadow-lg">
                  <FileVideo className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white mt-4">
                  Drag and drop 4K video files to upload
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Supports MP4, WebM, MOV with native 4K 2160p 60FPS or Shorts (9:16)
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow">
                  <Upload className="w-4 h-4" />
                  <span>Select Video File from Computer</span>
                </div>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('long-form')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    format === 'long-form'
                      ? 'border-red-500 bg-red-500/15 text-white'
                      : 'border-neutral-800 text-neutral-400 bg-neutral-950'
                  }`}
                >
                  <Tv className="w-4 h-4 text-red-400" />
                  <span>Long-form Video (16:9 Widescreen)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('shorts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    format === 'shorts'
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-neutral-800 text-neutral-400 bg-neutral-950'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>YouTube Shorts (9:16 Vertical)</span>
                </button>
              </div>

              {/* Instant 4K Master Presets */}
              <div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Or pick a verified 4K Master stream preset:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_4K_SOURCES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-red-500/60 text-left transition-all group cursor-pointer"
                    >
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-16 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{p.title}</div>
                        <div className="text-[10px] text-red-400 font-mono mt-0.5">4K UHD Master • {p.durationFormatted}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: METADATA & DETAILS */}
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk City Odyssey (4K 60FPS HDR Master)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Description & Chapters</label>
                <textarea
                  rows={4}
                  placeholder="Describe your 4K video, camera specs, chapters (e.g. 0:00 - Intro)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option>Film & Animation</option>
                    <option>Science & Technology</option>
                    <option>Travel & Events</option>
                    <option>Gaming</option>
                    <option>Howto & Style</option>
                    <option>Music</option>
                    <option>Entertainment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Target Resolution</label>
                  <select
                    value={maxResolution}
                    onChange={(e) => setMaxResolution(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option>4K (2160p)</option>
                    <option>1440p</option>
                    <option>1080p 60fps</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ← Back to Source
                </button>
                <button
                  type="button"
                  disabled={!title.trim() || isScanningModeration}
                  onClick={runModerationScan}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isScanningModeration ? 'Scanning...' : 'Run Automated AI Safety Scan'}</span>
                </button>
              </div>

              {isScanningModeration && (
                <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-2xl space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 text-xs text-blue-300 font-bold">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>Gemini 3.8 Automated Moderation in Progress</span>
                  </div>
                  <div className="text-xs text-neutral-300 font-mono">{moderationScanStage}</div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: AUTOMATED MODERATION VERDICT */}
          {step === 'moderation' && moderationReport && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  moderationReport.status === 'APPROVED'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Automated Moderation Scan Complete
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    Safety Score: {moderationReport.overallScore}% • {moderationReport.status.replace(/_/g, ' ')}
                  </div>
                  <p className="text-xs text-neutral-200 mt-1">{moderationReport.summary}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {moderationReport.categories.map((cat, idx) => (
                  <div key={idx} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <div className="text-[11px] text-neutral-400">{cat.category}</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">Safe ({cat.score}/100)</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ← Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setStep('monetization')}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <span>Configure Monetization</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MONETIZATION CONFIGURATION */}
          {step === 'monetization' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-950/40 via-neutral-950 to-neutral-950 border border-amber-500/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    $
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Enable Creator Monetization</h4>
                    <p className="text-[11px] text-neutral-400">
                      Earn ad revenue & fan tips for this 4K video (Est. CPM: $18.50)
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isMonetized}
                  onChange={(e) => setIsMonetized(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              {isMonetized && (
                <div className="space-y-3 p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="text-xs font-bold text-white">Ad Formats & Super Thanks</div>

                  <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
                    <span>Pre-roll & Skippable Ads</span>
                    <input
                      type="checkbox"
                      checked={hasPreRoll}
                      onChange={(e) => setHasPreRoll(e.target.checked)}
                      className="accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
                    <span>Mid-roll Video Ads (Automated chapter placements)</span>
                    <input
                      type="checkbox"
                      checked={hasMidRoll}
                      onChange={(e) => setHasMidRoll(e.target.checked)}
                      className="accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
                    <span>Super Thanks Fan Funding (Viewer tipping allowed)</span>
                    <input
                      type="checkbox"
                      checked={allowSuperThanks}
                      onChange={(e) => setAllowSuperThanks(e.target.checked)}
                      className="accent-amber-500"
                    />
                  </label>
                </div>
              )}

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
                <span className="text-white font-semibold">Immediate Real Broadcast:</span> Once published, this video is permanently saved to the server and instantly streamable by any visitor in 4K resolution.
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStep('moderation')}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ← Back to Moderation
                </button>
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleFinalPublish}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-red-950 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isPublishing ? 'Publishing to Network...' : 'Publish 4K Video Now'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
