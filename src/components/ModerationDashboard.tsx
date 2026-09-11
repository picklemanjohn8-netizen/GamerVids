import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  FileCheck,
  BarChart3,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ModerationReport } from '../types';

export const ModerationDashboard: React.FC = () => {
  const [testTitle, setTestTitle] = useState('Deep Space Cyber Odyssey: 4K HDR Star Voyage');
  const [testDescription, setTestDescription] = useState(
    'An cinematic voyage across the Carina and Orion nebulae captured using 4K 60FPS space simulation telemetry. All soundtrack master rights cleared for global broadcast.'
  );
  const [testCategory, setTestCategory] = useState('Science & Technology');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<ModerationReport | null>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    setIsAuditing(true);
    try {
      const res = await fetch('/api/moderate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testTitle,
          description: testDescription,
          category: testCategory,
          tags: ['4K', 'Space', 'Astronomy'],
          maxResolution: '4K (2160p)',
          is4K: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-900 border border-neutral-800 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Automated AI Content Moderation Engine
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                Gemini 3.8
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Real-time multi-dimensional safety auditing for 4K video uploads, comments, and creator streams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-neutral-950 px-4 py-2 rounded-2xl border border-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-neutral-300 font-semibold">100% Automated Scanning Active</span>
        </div>
      </div>

      {/* Safety Policy & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
          <div className="text-xs text-neutral-400">Total Scanned Uploads</div>
          <div className="text-2xl font-black text-white mt-1">100% Automated</div>
          <div className="text-[11px] text-emerald-400 mt-1">Zero human latency delay</div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
          <div className="text-xs text-neutral-400">Network Approval Rate</div>
          <div className="text-2xl font-black text-white mt-1">99.4%</div>
          <div className="text-[11px] text-blue-400 mt-1">Certified Safe for All Ages / Teens</div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
          <div className="text-xs text-neutral-400">4K Technical Gate</div>
          <div className="text-2xl font-black text-white mt-1">2160p Verified</div>
          <div className="text-[11px] text-red-400 mt-1">Bitrate & HDR color audit</div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
          <div className="text-xs text-neutral-400">Toxic Comments Blocked</div>
          <div className="text-2xl font-black text-white mt-1">Instant</div>
          <div className="text-[11px] text-emerald-400 mt-1">Proactive sentiment shield</div>
        </div>
      </div>

      {/* Interactive Live AI Moderation Tester Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Test Video Content Against Automated AI Safety Policy</span>
          </div>
          <p className="text-xs text-neutral-400">
            Submit sample video title, script, and category to see the live Gemini safety audit verdict in real-time.
          </p>

          <form onSubmit={handleRunAudit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Candidate Video Title
              </label>
              <input
                type="text"
                required
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Candidate Script / Description / Dialogue
              </label>
              <textarea
                rows={4}
                required
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Category</label>
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option>Science & Technology</option>
                <option>Film & Animation</option>
                <option>Travel & Events</option>
                <option>Gaming</option>
                <option>News & Politics</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAuditing || !testTitle.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAuditing ? 'AI Safety Engine Auditing...' : 'Run Automated Safety Audit'}</span>
            </button>
          </form>
        </div>

        {/* Live Verdict Column */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Audit Results</span>
            </h3>
            {auditReport && (
              <span className="text-xs font-mono font-bold text-blue-400">
                Score: {auditReport.overallScore}%
              </span>
            )}
          </div>

          {!auditReport ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40">
              <ShieldCheck className="w-10 h-10 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400">
                Click "Run Automated Safety Audit" to evaluate the sample content across all 6 safety dimensions.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  auditReport.status === 'APPROVED'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {auditReport.status.replace(/_/g, ' ')} • {auditReport.contentRating.replace(/_/g, ' ')}
                  </div>
                  <p className="text-xs text-neutral-200 mt-1 leading-relaxed">
                    {auditReport.summary}
                  </p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                {auditReport.categories.map((cat, i) => (
                  <div
                    key={i}
                    className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-200">{cat.category}</span>
                      <span className="font-mono font-bold text-emerald-400">{cat.score}/100</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.score}%` }} />
                    </div>
                    <div className="text-[11px] text-neutral-400">{cat.notes}</div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-neutral-500 text-right">
                Audited by {auditReport.automatedBy} • Timestamp: {new Date(auditReport.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
