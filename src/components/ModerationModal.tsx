import React from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, FileText, Cpu, DollarSign } from 'lucide-react';
import { ModerationReport } from '../types';

interface ModerationModalProps {
  report: ModerationReport;
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  report,
  videoTitle,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isApproved = report.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isApproved ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Automated AI Content Moderation Certificate
              </h3>
              <p className="text-[11px] text-neutral-400">Powered by {report.automatedBy}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isApproved
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800 text-amber-300'
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Overall Verdict: {report.status.replace(/_/g, ' ')}
              </div>
              <p className="text-xs text-neutral-200 mt-1 leading-relaxed">{report.summary}</p>
              <div className="mt-2 text-[10px] text-neutral-400">
                Scanned on: {new Date(report.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
              <div className="text-[11px] text-neutral-400">Safety Score</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{report.overallScore}%</div>
              <div className="text-[10px] text-emerald-400 mt-1">High Standard</div>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
              <div className="text-[11px] text-neutral-400">Content Rating</div>
              <div className="text-base font-bold text-white mt-1">
                {report.contentRating.replace(/_/g, ' ')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Audience Tier</div>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
              <div className="text-[11px] text-neutral-400">Ad Suitability</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">
                {report.adEligibility === 'MONETIZED_FULL' ? '100% Eligible' : 'Limited Ads'}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">YPP Monetized</div>
            </div>
          </div>

          {/* Detailed Category Audits */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Automated Safety Dimensions Evaluation
            </h4>
            <div className="space-y-2">
              {report.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-950/80 border border-neutral-800/80 p-3 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-200">{cat.category}</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          cat.score >= 90
                            ? 'text-emerald-400'
                            : cat.score >= 70
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {cat.score}/100
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.score >= 90
                            ? 'bg-emerald-500'
                            : cat.score >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1.5">{cat.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright & 4K Verification */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>4K Technical Master & IP Verification</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Automated checksum analysis verified the file against copyright registries. Video meets 4K Ultra HD bitrate threshold with original audio stream.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Automated Audit ID: MOD-{report.overallScore}X</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
          >
            Close Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
