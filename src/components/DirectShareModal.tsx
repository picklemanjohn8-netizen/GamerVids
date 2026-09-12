import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Code2,
  Share2,
  QrCode,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { VideoItem, DirectSharePayload } from '../types';

interface DirectShareModalProps {
  video: VideoItem;
  currentTime?: number;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; handle: string };
  onShareSuccess?: (newTotalShares: number) => void;
}

export const DirectShareModal: React.FC<DirectShareModalProps> = ({
  video,
  currentTime = 0,
  isOpen,
  onClose,
  currentUser,
  onShareSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'direct' | 'embed' | 'qr'>('link');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Direct send state
  const [recipientHandle, setRecipientHandle] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [sendingDirect, setSendingDirect] = useState(false);
  const [directSentSuccess, setDirectSentSuccess] = useState(false);

  if (!isOpen) return null;

  const seconds = Math.floor(currentTime);
  const baseUrl = `${window.location.origin}/watch/${video.id}`;
  const shareableUrl = includeTimestamp && seconds > 0 ? `${baseUrl}?t=${seconds}` : baseUrl;

  const embedCode = `<iframe width="560" height="315" src="${baseUrl}?embed=true" title="${video.title.replace(
    /"/g,
    '&quot;'
  )}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);

      // Record share to backend
      const res = await fetch(`/api/videos/${video.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          senderName: currentUser.name,
          platform: 'copy_link',
          startAtSeconds: includeTimestamp ? seconds : undefined,
        }),
      });
      const data = await res.json();
      if (data.success && onShareSuccess) {
        onShareSuccess(data.totalShares);
      }
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);

      await fetch(`/api/videos/${video.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          senderName: currentUser.name,
          platform: 'embed',
        }),
      });
    } catch (e) {
      console.error('Failed to copy embed', e);
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientHandle.trim()) return;

    setSendingDirect(true);
    try {
      const res = await fetch(`/api/videos/${video.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          recipientHandle: recipientHandle.trim(),
          senderName: currentUser.name,
          message: directMessage.trim(),
          platform: 'internal',
        } as DirectSharePayload),
      });
      const data = await res.json();
      if (data.success) {
        setDirectSentSuccess(true);
        if (onShareSuccess) onShareSuccess(data.totalShares);
        setTimeout(() => {
          setDirectSentSuccess(false);
          setRecipientHandle('');
          setDirectMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending direct share:', err);
    } finally {
      setSendingDirect(false);
    }
  };

  // Social share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Watching "${video.title}" in high quality on Stream4K:`
  )}&url=${encodeURIComponent(shareableUrl)}`;

  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareableUrl)}&title=${encodeURIComponent(
    video.title
  )}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this 4K video "${video.title}": ${shareableUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Share Video</h3>
            {video.is4KMaster && (
              <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                4K Stream
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview mini bar */}
        <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center gap-3">
          <img
            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop'}
            alt={video.title}
            className="w-16 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-neutral-200 truncate">{video.title}</div>
            <div className="text-[11px] text-neutral-400">{video.creator.name} • {video.views.toLocaleString()} views</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-800/80">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'link'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="w-3 h-3 text-rose-400" />
            Send to User
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3 h-3" />
            Embed Code
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <QrCode className="w-3 h-3" />
            QR Code
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4">
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* Link field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">Shareable Video URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Timestamp checkbox */}
              {seconds > 0 && (
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    className="rounded border-neutral-700 text-red-600 focus:ring-red-500 bg-neutral-950"
                  />
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Start at current time ({Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')})</span>
                </label>
              )}

              {/* Social shortcuts */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Instant Social Share
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    𝕏 Twitter
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                  <a
                    href={redditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-orange-950 hover:bg-orange-900 border border-orange-800 text-orange-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Reddit
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <form onSubmit={handleSendDirect} className="space-y-3.5">
              <div className="text-xs text-neutral-400">
                Directly dispatch this video to another creator or user on the platform. It will be delivered with your recommendation.
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Recipient Username or Channel Handle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="@earthexplorer, @cinemalab4k, or friend's name"
                    value={recipientHandle}
                    onChange={(e) => setRecipientHandle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[10px] text-neutral-500">Suggested:</span>
                  {['@cinemalab4k', '@earthexplorer', '@marcusvance'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => setRecipientHandle(handle)}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Add a personal note (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Check out this 4K shot at 1:30..."
                  value={directMessage}
                  onChange={(e) => setDirectMessage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {directSentSuccess ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Video successfully sent directly to {recipientHandle}! Share logged.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={sendingDirect || !recipientHandle.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {sendingDirect ? 'Dispatching...' : 'Send Video Direct'}
                </button>
              )}
            </form>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Copy and paste this responsive iframe into your blog, portfolio, or website to embed this 4K player:
              </div>
              <textarea
                readOnly
                rows={4}
                value={embedCode}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-[11px] font-mono text-neutral-300 focus:outline-none resize-none"
              />
              <button
                onClick={handleCopyEmbed}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  copiedEmbed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                }`}
              >
                {copiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                {/* SVG simulated crisp QR code with embedded logo */}
                <div className="w-40 h-40 bg-neutral-950 p-2 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-80 grid grid-cols-6 grid-rows-6 gap-1 p-2">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 7 === 0 || i === 15 || i === 22) && i !== 14
                            ? 'bg-white'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="z-10 bg-red-600 text-white font-black text-[10px] px-2 py-1 rounded-md shadow-md border border-white/20">
                    4K STREAM
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-400 text-center max-w-xs">
                Scan with any smartphone camera to open and stream this 4K video instantly.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Total Direct Shares: {video.shares.toLocaleString()}</span>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
