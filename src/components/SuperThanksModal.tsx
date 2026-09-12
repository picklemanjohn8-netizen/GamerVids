import React, { useState } from 'react';
import { X, DollarSign, Sparkles, Heart, Check, Gift } from 'lucide-react';
import { VideoItem, SuperThanksPayload } from '../types';

interface SuperThanksModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; avatar: string };
  onSuccess: (amount: number, newTotal: number, comment?: any) => void;
}

const TIER_OPTIONS = [
  { amount: 2, label: '$2.00', tier: 'Bronze Spark', color: 'from-amber-700 to-amber-500', badge: '🥉' },
  { amount: 5, label: '$5.00', tier: 'Silver Wave', color: 'from-slate-400 to-slate-200', badge: '🥈' },
  { amount: 10, label: '$10.00', tier: 'Gold Cinema', color: 'from-amber-400 to-yellow-300', badge: '🥇' },
  { amount: 50, label: '$50.00', tier: 'Platinum Executive', color: 'from-cyan-400 to-blue-500', badge: '💎' },
];

export const SuperThanksModal: React.FC<SuperThanksModalProps> = ({
  video,
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('Love the high resolution 4K production! Keep it up!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/super-thanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          creatorId: video.creator.id,
          amount: currentAmount,
          donorName: currentUser.name,
          donorAvatar: currentUser.avatar,
          message: message.trim(),
        } as SuperThanksPayload),
      });

      const data = await res.json();
      if (data.success) {
        setCompleted(true);
        onSuccess(currentAmount, data.newTotal, data.comment);
        setTimeout(() => {
          setCompleted(false);
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Super thanks donation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-black text-sm shadow-md shadow-amber-900/40">
              $
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Send Super Thanks
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-neutral-400">Support {video.creator.name} directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Super Thanks Sent!</h4>
              <p className="text-xs text-neutral-300 mt-1">
                Your ${currentAmount.toFixed(2)} contribution has been deposited to {video.creator.name}'s revenue pool.
              </p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-amber-500/30 text-xs text-amber-300 italic">
              "{message}"
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Creator Card */}
            <div className="flex items-center gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <img
                src={video.creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                alt={video.creator.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {video.creator.name}
                  {video.creator.isVerified && (
                    <span className="text-[10px] text-red-400 font-normal">✓ Verified</span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {video.creator.subscribers.toLocaleString()} subscribers • 100% Creator Share
                </div>
              </div>
            </div>

            {/* Select Tier */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Select Super Thanks Contribution Amount
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIER_OPTIONS.map((tier) => (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(tier.amount);
                      setCustomAmount('');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedAmount === tier.amount && !customAmount
                        ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500/40'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-sm">{tier.badge}</div>
                    <div className="text-xs font-bold mt-1">{tier.label}</div>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs text-neutral-400">Or custom:</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Other amount (e.g. 25)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-1.5 pl-7 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Your Public Super Thanks Message (Highlighted in Comments)
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message to pin with your Super Thanks badge..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Preview Banner */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Super Thanks Badge Tier
                </span>
                <span className="font-bold text-white">${currentAmount.toFixed(2)} USD</span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Your comment will receive a glowing gold frame and pin directly below the creator's video.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || currentAmount <= 0}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/60 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {isSubmitting ? 'Processing Payment...' : `Buy and Send Super Thanks • $${currentAmount.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
