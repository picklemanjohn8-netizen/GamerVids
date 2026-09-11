export type VideoFormat = 'long-form' | 'shorts';

export type ResolutionOption = '4K (2160p)' | '1440p' | '1080p 60fps' | '720p' | '480p' | '360p' | 'Auto';

export type ModerationStatus = 'APPROVED' | 'RESTRICTED_18_PLUS' | 'MONETIZATION_FLAGGED' | 'REJECTED';

export type ContentRating = 'ALL_AGES' | 'TEEN_13' | 'MATURE_18';

export type MonetizationStatus = 'MONETIZED_FULL' | 'MONETIZED_LIMITED' | 'DEMONETIZED' | 'PENDING_REVIEW';

export interface ModerationCategoryCheck {
  category: string;
  score: number; // 0 to 100 safe score (100 = completely safe)
  flagged: boolean;
  notes: string;
}

export interface ModerationReport {
  status: ModerationStatus;
  overallScore: number; // 0 to 100
  contentRating: ContentRating;
  adEligibility: MonetizationStatus;
  isCopyrightSafe: boolean;
  categories: ModerationCategoryCheck[];
  summary: string;
  timestamp: string;
  automatedBy: string; // e.g. "Gemini 3.8 Automated Safety Engine"
}

export interface Chapter {
  id: string;
  title: string;
  timestamp: number; // in seconds
  timestampFormatted: string;
}

export interface CreatorChannel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: number;
  isVerified: boolean;
  isPartner: boolean;
  bannerUrl?: string;
  description?: string;
  totalEarnings?: number;
  monthlyRevenue?: number;
  membershipTiers?: {
    name: string;
    price: number;
    perks: string[];
  }[];
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLikedByUser?: boolean;
  isCreator?: boolean;
  isCreatorHearted?: boolean;
  isSuperThanks?: boolean;
  superThanksAmount?: number;
  replies?: Comment[];
  moderationScore?: number;
}

export interface VideoResolutionStreams {
  '4K'?: string;
  '1440p'?: string;
  '1080p'?: string;
  '720p'?: string;
  '480p'?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  format: VideoFormat;
  videoUrl: string;
  resolutions?: VideoResolutionStreams;
  maxResolution: string; // '4K (2160p)', '1080p', etc.
  fps: number; // 60, 30
  aspectRatio: '16:9' | '9:16';
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string;
  views: number;
  likes: number;
  dislikes: number;
  shares: number;
  isLikedByUser?: boolean;
  isDislikedByUser?: boolean;
  creator: CreatorChannel;
  createdAt: string;
  tags: string[];
  category: string;
  chapters?: Chapter[];
  isMonetized: boolean;
  adSettings?: {
    hasPreRoll: boolean;
    hasMidRoll: boolean;
    midRollPoints?: number[];
    cpmRate: number; // e.g. $14.50
    estimatedEarnings: number;
  };
  moderation: ModerationReport;
  commentsCount: number;
  directSharesCount: number;
  is4KMaster: boolean;
  fileSizeMb: number;
}

export interface DirectSharePayload {
  videoId: string;
  recipientHandle?: string;
  senderName: string;
  message?: string;
  startAtSeconds?: number;
  platform?: 'internal' | 'copy_link' | 'embed' | 'twitter' | 'whatsapp' | 'reddit';
}

export interface SuperThanksPayload {
  videoId: string;
  creatorId: string;
  amount: number;
  donorName: string;
  donorAvatar: string;
  message: string;
}

export interface CreatorMonetizationStats {
  subscriberCount: number;
  subscriberGoal: number; // 1000
  watchHours: number;
  watchHoursGoal: number; // 4000
  isEligibleForYPP: boolean;
  isPartnerEnrolled: boolean;
  estimatedMonthlyEarnings: number;
  allTimeEarnings: number;
  superThanksEarnings: number;
  adEarnings: number;
  rpm: number; // Revenue Per Mille
  cpm: number;
  recentTransactions: {
    id: string;
    type: 'ad_revenue' | 'super_thanks' | 'membership';
    amount: number;
    fromUser?: string;
    videoTitle?: string;
    date: string;
  }[];
}

export interface SocialLink {
  id: string;
  platform: string; // 'Twitter / X', 'Instagram', 'YouTube', 'TikTok', 'GitHub', 'Website', etc.
  url: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string; // custom username e.g. @pickleman
  avatar: string;
  bannerUrl: string;
  bio: string;
  category?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLink[];
  subscribers: number;
  isVerified: boolean;
  isPartner: boolean;
  joinedDate: string;
}
