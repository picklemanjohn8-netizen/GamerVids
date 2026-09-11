import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Heart,
  Send,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  CornerDownRight,
} from 'lucide-react';
import { Comment } from '../types';

interface CommentsSectionProps {
  videoId: string;
  comments: Comment[];
  currentUser: { name: string; avatar: string; handle: string };
  onCommentAdded: (newComment: Comment) => void;
  onOpenSuperThanks: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  videoId,
  comments,
  currentUser,
  onCommentAdded,
  onOpenSuperThanks,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsSubmitting(true);
    setModerationError(null);

    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentInput.trim(),
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModerationError(data.error || 'Comment blocked by automated moderation engine.');
        return;
      }

      onCommentAdded(data.comment);
      setCommentInput('');
    } catch (err: any) {
      setModerationError(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (parentCommentId: string) => {
    if (!replyInput.trim()) return;

    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyInput.trim(),
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          parentCommentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onCommentAdded(data.comment);
        setReplyInput('');
        setActiveReplyId(null);
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    // Super thanks comments always stick near top
    if (a.isSuperThanks && !b.isSuperThanks) return -1;
    if (!a.isSuperThanks && b.isSuperThanks) return 1;

    if (sortBy === 'top') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return 0; // default order is newest
  });

  return (
    <div className="space-y-6 pt-6 border-t border-neutral-800/80">
      {/* Header with count and sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <span>{comments.length} Comments</span>
          </h3>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Gemini Automated Safety Filter Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-neutral-200 focus:outline-none"
          >
            <option value="top">Top Comments</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-700 shrink-0"
          />
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Add a comment... (real-time automated moderation checks enabled)"
              value={commentInput}
              onChange={(e) => {
                setCommentInput(e.target.value);
                if (moderationError) setModerationError(null);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />

            {moderationError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Automated Safety Engine Block:</div>
                  <div>{moderationError}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onOpenSuperThanks}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Tip Creator via Super Thanks</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !commentInput.trim()}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-md shadow-red-950/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Verifying...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3.5 rounded-2xl transition-all ${
              comment.isSuperThanks
                ? 'bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-900 border border-amber-500/40 shadow-lg shadow-amber-950/20'
                : 'bg-neutral-900/50 border border-neutral-800/70'
            }`}
          >
            <div className="flex items-start gap-3">
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className={`w-8 h-8 rounded-full object-cover shrink-0 ${
                  comment.isSuperThanks ? 'ring-2 ring-amber-500' : 'ring-1 ring-neutral-700'
                }`}
              />
              <div className="flex-1 overflow-hidden">
                {/* User row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white">{comment.userName}</span>
                  {comment.isCreator && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-500/30">
                      Creator
                    </span>
                  )}
                  {comment.isSuperThanks && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      Super Thanks ${comment.superThanksAmount || 10}
                    </span>
                  )}
                  <span className="text-[11px] text-neutral-500">{comment.timestamp}</span>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-neutral-200 mt-1 leading-relaxed break-words">
                  {comment.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2.5 text-xs text-neutral-400">
                  <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes || 0}</span>
                  </button>

                  {comment.isCreatorHearted && (
                    <div className="flex items-center gap-1 text-red-400 text-[11px]">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>Hearted by creator</span>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                    className="hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {activeReplyId === comment.id && (
                  <div className="mt-3 pl-2 flex items-center gap-2 border-l-2 border-neutral-700">
                    <input
                      type="text"
                      placeholder={`Reply to ${comment.userName}...`}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-neutral-800 space-y-2.5">
                    {comment.replies.map((rep) => (
                      <div key={rep.id} className="flex items-start gap-2.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-1" />
                        <img
                          src={rep.userAvatar}
                          alt={rep.userName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-white">{rep.userName}</span>
                            {rep.isCreator && (
                              <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-1 rounded">
                                Creator
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-500">{rep.timestamp}</span>
                          </div>
                          <p className="text-xs text-neutral-200 mt-0.5">{rep.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
