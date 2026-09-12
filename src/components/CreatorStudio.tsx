import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Award,
  Video,
  Eye,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  Edit3,
  User,
} from 'lucide-react';
import { VideoItem, CreatorMonetizationStats } from '../types';

interface CreatorStudioProps {
  videos: VideoItem[];
  currentUser: { name: string; handle: string; avatar: string };
  onOpenUpload: () => void;
  onSelectVideo: (videoId: string) => void;
  onOpenEditProfile?: () => void;
  onViewProfile?: () => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  videos,
  currentUser,
  onOpenUpload,
  onSelectVideo,
  onOpenEditProfile,
  onViewProfile,
}) => {
  const [stats, setStats] = useState<CreatorMonetizationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/monetization/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const totalShares = videos.reduce((acc, v) => acc + (v.shares || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-500/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{currentUser.name} Studio</h1>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> YouTube Partner Program
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Channel Handle: {currentUser.handle} • Automated AI Moderation & 4K Monetization Active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
            >
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span>View Channel</span>
            </button>
          )}

          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-red-400" />
              <span>Customize Profile & Handle</span>
            </button>
          )}

          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenUpload}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload 4K Master</span>
          </button>
        </div>
      </div>

      {/* Monetization & Earnings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Estimated Revenue</span>
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${stats ? stats.totalRevenue.toFixed(2) : '3,842.50'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs last 28 days</span>
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>4K Watch Time (Hours)</span>
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {stats ? stats.watchHours.toLocaleString() : '14,280'} hrs
          </div>
          <div className="text-[11px] text-neutral-400">
            4K Ultra HD streams comprise 82% of watch time
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Effective 4K RPM / CPM</span>
            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${stats ? stats.rpm.toFixed(2) : '18.40'}
          </div>
          <div className="text-[11px] text-neutral-400">
            High 4K advertiser demand ($24.80 CPM average)
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Super Thanks & Tips</span>
            <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${stats ? stats.breakdown.superThanks.toFixed(2) : '680.00'}
          </div>
          <div className="text-[11px] text-neutral-400">
            Direct fan contributions from viewers
          </div>
        </div>
      </div>

      {/* Revenue Streams Breakdown & Moderation Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Distribution */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Monetization Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Video Ad Streams</span>
                <span className="font-bold text-white">
                  ${stats ? stats.breakdown.ads.toFixed(2) : '$2,412.50'} (63%)
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '63%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Super Thanks Fan Funding</span>
                <span className="font-bold text-white">
                  ${stats ? stats.breakdown.superThanks.toFixed(2) : '$680.00'} (18%)
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Channel VIP Memberships</span>
                <span className="font-bold text-white">
                  ${stats ? stats.breakdown.memberships.toFixed(2) : '$750.00'} (19%)
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '19%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80 text-xs text-neutral-400 space-y-1">
            <div className="font-bold text-white">Next Payout:</div>
            <div>Estimated deposit of ${(stats?.totalRevenue || 3842).toFixed(2)} on the 21st to linked banking account.</div>
          </div>
        </div>

        {/* AI Content Moderation Health */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Automated Content Moderation Compliance Center</span>
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              100% Brand Safe
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Every uploaded long-form 4K video and short is automatically verified by the Gemini 3.8 Content Safety Engine. No copyright strikes, hate speech, violence, or technical bitrate defects detected.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
              <div className="text-[11px] text-neutral-400">Copyright Claims</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">0 Active</div>
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
              <div className="text-[11px] text-neutral-400">Community Strikes</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">0 Strikes</div>
            </div>
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
              <div className="text-[11px] text-neutral-400">Green Dollar Status</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">All Monitored</div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Manager Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Your Uploaded Videos & 4K Streams</h3>
          <span className="text-xs text-neutral-400">{videos.length} videos published</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-3">Video</th>
                <th className="px-6 py-3">Format & Res</th>
                <th className="px-6 py-3">AI Moderation Status</th>
                <th className="px-6 py-3">Monetization</th>
                <th className="px-6 py-3">Views</th>
                <th className="px-6 py-3">Shares</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {videos.map((vid) => (
                <tr
                  key={vid.id}
                  className="hover:bg-neutral-800/40 transition-colors cursor-pointer"
                  onClick={() => onSelectVideo(vid.id)}
                >
                  <td className="px-6 py-3 flex items-center gap-3">
                    <img
                      src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop'}
                      alt={vid.title}
                      className="w-16 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="max-w-xs">
                      <div className="font-semibold text-white truncate">{vid.title}</div>
                      <div className="text-[10px] text-neutral-500">{vid.category}</div>
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    <span className="font-mono font-bold text-red-400">{vid.maxResolution}</span>
                    <div className="text-[10px] text-neutral-500">{vid.format === 'shorts' ? 'Short' : '16:9 Long-form'}</div>
                  </td>

                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved ({vid.moderation?.overallScore || 98}%)
                    </span>
                  </td>

                  <td className="px-6 py-3">
                    {vid.isMonetized ? (
                      <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <DollarSign className="w-3 h-3 text-amber-400" />
                        Monetized
                      </span>
                    ) : (
                      <span className="text-neutral-500">Off</span>
                    )}
                  </td>

                  <td className="px-6 py-3 font-mono">{vid.views.toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono">{vid.shares.toLocaleString()}</td>

                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVideo(vid.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Watch 4K →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
