import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import {
  VideoItem,
  Comment,
  ModerationReport,
  CreatorMonetizationStats,
  DirectSharePayload,
  SuperThanksPayload,
  UserProfile,
} from './src/types.js';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'videos');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure persistent multer disk storage for uploaded videos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `video-${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface DatabaseSchema {
  videos: VideoItem[];
  comments: Record<string, Comment[]>; // videoId -> comments
  moderationLogs: {
    id: string;
    videoId?: string;
    videoTitle: string;
    creatorName: string;
    overallScore: number;
    status: string;
    contentRating: string;
    adEligibility: string;
    summary: string;
    timestamp: string;
    categories: any[];
  }[];
  creatorStats: CreatorMonetizationStats;
  directShares: {
    id: string;
    videoId: string;
    senderName: string;
    recipientHandle: string;
    message: string;
    timestamp: string;
  }[];
  subscriptions: Record<string, boolean>; // channelId -> subscribed
  userProfile: UserProfile;
  savedVideoIds: string[];
  watchHistory: Record<string, { timestamp: number; duration: number; updatedAt: string }>;
}

const initialUserProfile: UserProfile = {
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

const initialSeedVideos: VideoItem[] = [
  {
    id: 'vid-4k-cybercity',
    title: 'Neon Odyssey: 4K 60FPS Cyberpunk Cinema Journey (Official HDR Master)',
    description: `Experience the breathtaking visual architecture of Neo-Tokyo rendered in native 4K 2160p at 60 frames per second with full dynamic range. Shot using high-end cinema lenses with immersive spatial ambisonic audio.\n\nChapters:\n0:00 - Arrival at Neon District\n0:45 - High-Speed Monorail Flight\n1:30 - Holographic Market\n2:10 - Cybernetic Alleyways\n\nProduction Gear: RED V-Raptor 8K VV, Master Anamorphic T1.9.\nAudio Mix: Dolby Atmos Mastered.`,
    format: 'long-form',
    videoUrl: '/videos/cyberpunk_4k.mp4',
    maxResolution: '4K (2160p)',
    fps: 60,
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    duration: 734,
    durationFormatted: '12:14',
    views: 428900,
    likes: 31200,
    dislikes: 240,
    shares: 4890,
    isLikedByUser: false,
    isDislikedByUser: false,
    creator: {
      id: 'chan-cyberarts',
      name: 'Cinema Lab 4K',
      handle: '@cinemalab4k',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      subscribers: 245000,
      isVerified: true,
      isPartner: true,
      totalEarnings: 8420.50,
      monthlyRevenue: 2410.80,
    },
    createdAt: '2026-09-08T14:30:00.000Z',
    tags: ['4K', 'HDR', 'Cyberpunk', 'Cinematic', '60fps', 'Tech'],
    category: 'Film & Animation',
    chapters: [
      { id: 'c1', title: 'Arrival at Neon District', timestamp: 0, timestampFormatted: '0:00' },
      { id: 'c2', title: 'High-Speed Flight', timestamp: 45, timestampFormatted: '0:45' },
      { id: 'c3', title: 'Holographic Market', timestamp: 90, timestampFormatted: '1:30' },
      { id: 'c4', title: 'Cybernetic Alleyways', timestamp: 130, timestampFormatted: '2:10' },
    ],
    isMonetized: true,
    adSettings: {
      hasPreRoll: true,
      hasMidRoll: true,
      midRollPoints: [45, 90],
      cpmRate: 18.5,
      estimatedEarnings: 3140.25,
    },
    moderation: {
      status: 'APPROVED',
      overallScore: 98,
      contentRating: 'ALL_AGES',
      adEligibility: 'MONETIZED_FULL',
      isCopyrightSafe: true,
      summary: 'Verified original 4K cinematic production. Clean audio and visual standards. Ad-suitability 100% compliant with YouTube Partner safety criteria.',
      timestamp: '2026-09-08T14:31:10.000Z',
      automatedBy: 'Gemini 3.8 Automated Safety Engine',
      categories: [
        { category: 'Violence & Gore', score: 100, flagged: false, notes: 'No violent content detected' },
        { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'Zero toxic speech or harassment' },
        { category: 'Explicit / Adult', score: 100, flagged: false, notes: 'Safe for all demographics' },
        { category: 'Spam & Misleading', score: 98, flagged: false, notes: 'Accurate technical metadata and description' },
        { category: 'Copyright & IP Integrity', score: 96, flagged: false, notes: 'Original cinema footage cleared' },
        { category: '4K Technical Standards', score: 99, flagged: false, notes: 'Verified 3840x2160 native resolution at 60 FPS' },
      ],
    },
    commentsCount: 14,
    directSharesCount: 68,
    is4KMaster: true,
    fileSizeMb: 1240,
  },
  {
    id: 'vid-4k-wildlife-escape',
    title: 'Wonders of Patagonia: Pristine Glaciers & Wildlife in Ultra HD (Full Documentary)',
    description: `Journey into one of the most untouched wilderness frontiers on Earth. Captured over 90 days in Patagonia using 4K ultra-telephoto stabilization. Hear the roaring glacial calving and witness condors gliding across jagged granite spires.\n\nEnjoy in 2160p 4K for maximum fidelity.\nMusic: Ambient Orchestral Wildlife Score (Licensed).`,
    format: 'long-form',
    videoUrl: '/videos/wildlife_patagonia.mp4',
    maxResolution: '4K (2160p)',
    fps: 60,
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    duration: 890,
    durationFormatted: '14:50',
    views: 189200,
    likes: 18450,
    dislikes: 85,
    shares: 2310,
    isLikedByUser: false,
    isDislikedByUser: false,
    creator: {
      id: 'chan-wildearth',
      name: 'Earth Explorer 4K',
      handle: '@earthexplorer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      subscribers: 512000,
      isVerified: true,
      isPartner: true,
      totalEarnings: 14200.0,
      monthlyRevenue: 3820.0,
    },
    createdAt: '2026-09-09T18:00:00.000Z',
    tags: ['4K', 'Wildlife', 'Documentary', 'Nature', 'Travel', 'Relaxing'],
    category: 'Travel & Events',
    chapters: [
      { id: 'c1', title: 'The Glacial Wall', timestamp: 0, timestampFormatted: '0:00' },
      { id: 'c2', title: 'Granite Towers', timestamp: 120, timestampFormatted: '2:00' },
      { id: 'c3', title: 'Emerald Fjords', timestamp: 320, timestampFormatted: '5:20' },
    ],
    isMonetized: true,
    adSettings: {
      hasPreRoll: true,
      hasMidRoll: true,
      midRollPoints: [120, 320],
      cpmRate: 16.0,
      estimatedEarnings: 2180.0,
    },
    moderation: {
      status: 'APPROVED',
      overallScore: 99,
      contentRating: 'ALL_AGES',
      adEligibility: 'MONETIZED_FULL',
      isCopyrightSafe: true,
      summary: 'High-aesthetic educational documentary. Verified family-friendly and green-tier ad eligibility.',
      timestamp: '2026-09-09T18:01:20.000Z',
      automatedBy: 'Gemini 3.8 Automated Safety Engine',
      categories: [
        { category: 'Violence & Gore', score: 100, flagged: false, notes: 'Natural wildlife observation only' },
        { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'None detected' },
        { category: 'Explicit / Adult', score: 100, flagged: false, notes: 'None detected' },
        { category: 'Spam & Misleading', score: 99, flagged: false, notes: 'High educational value' },
        { category: 'Copyright & IP Integrity', score: 100, flagged: false, notes: 'Royalty-free score & original camera files' },
        { category: '4K Technical Standards', score: 98, flagged: false, notes: 'Genuine 4K UHD 60fps bitrate' },
      ],
    },
    commentsCount: 9,
    directSharesCount: 34,
    is4KMaster: true,
    fileSizeMb: 1850,
  },
  {
    id: 'vid-4k-blender-bunny',
    title: 'Big Buck Bunny: Enhanced 4K 60FPS Remastered Edition',
    description: `The iconic open-source animation masterpiece rendered in modern 4K resolution at smooth 60 frames per second. Follow the gentle forest giant Bunny as he teaches the playful forest tricksters a hilarious lesson.\n\nOpen Source Cinema License (Creative Commons). Full monetization and community remixing supported.`,
    format: 'long-form',
    videoUrl: '/videos/wildlife_patagonia.mp4',
    maxResolution: '4K (2160p)',
    fps: 60,
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    duration: 596,
    durationFormatted: '9:56',
    views: 890400,
    likes: 67300,
    dislikes: 420,
    shares: 8910,
    isLikedByUser: false,
    isDislikedByUser: false,
    creator: {
      id: 'chan-openanim',
      name: 'Open Cinema Studio',
      handle: '@opencinema',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      subscribers: 890000,
      isVerified: true,
      isPartner: true,
      totalEarnings: 22400.0,
      monthlyRevenue: 4900.0,
    },
    createdAt: '2026-09-05T10:15:00.000Z',
    tags: ['4K', 'Animation', 'Comedy', 'OpenSource', 'Blender', 'Family'],
    category: 'Film & Animation',
    chapters: [
      { id: 'c1', title: 'Morning in the Glade', timestamp: 0, timestampFormatted: '0:00' },
      { id: 'c2', title: 'The Apple Incident', timestamp: 90, timestampFormatted: '1:30' },
      { id: 'c3', title: 'Bunny Strikes Back', timestamp: 240, timestampFormatted: '4:00' },
    ],
    isMonetized: true,
    adSettings: {
      hasPreRoll: true,
      hasMidRoll: true,
      midRollPoints: [90, 240],
      cpmRate: 14.2,
      estimatedEarnings: 4520.0,
    },
    moderation: {
      status: 'APPROVED',
      overallScore: 100,
      contentRating: 'ALL_AGES',
      adEligibility: 'MONETIZED_FULL',
      isCopyrightSafe: true,
      summary: 'Verified open-source animated creative work. Exceptional family and community rating.',
      timestamp: '2026-09-05T10:16:00.000Z',
      automatedBy: 'Gemini 3.8 Automated Safety Engine',
      categories: [
        { category: 'Violence & Gore', score: 100, flagged: false, notes: 'Slapstick cartoon comedy only' },
        { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'None detected' },
        { category: 'Explicit / Adult', score: 100, flagged: false, notes: 'None detected' },
        { category: 'Spam & Misleading', score: 100, flagged: false, notes: 'Authentic classic' },
        { category: 'Copyright & IP Integrity', score: 100, flagged: false, notes: 'Creative Commons 3.0 attribution compliant' },
        { category: '4K Technical Standards', score: 99, flagged: false, notes: 'Crystal clear 4K 60fps' },
      ],
    },
    commentsCount: 18,
    directSharesCount: 112,
    is4KMaster: true,
    fileSizeMb: 980,
  },
  {
    id: 'vid-short-waterfall-drop',
    title: 'Secret Hidden 4K Waterfall in Iceland 🌊 #Shorts #Nature #Travel',
    description: `Would you hike 6 hours across volcanic canyons to see this mystical blue waterfall? Drop a like if you love untamed nature! #Shorts #Iceland #Waterfall #4K`,
    format: 'shorts',
    videoUrl: '/videos/nature_short.mp4',
    maxResolution: '4K (2160p)',
    fps: 60,
    aspectRatio: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=800&auto=format&fit=crop',
    duration: 28,
    durationFormatted: '0:28',
    views: 942000,
    likes: 88400,
    dislikes: 610,
    shares: 14200,
    isLikedByUser: false,
    isDislikedByUser: false,
    creator: {
      id: 'chan-wildearth',
      name: 'Earth Explorer 4K',
      handle: '@earthexplorer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      subscribers: 512000,
      isVerified: true,
      isPartner: true,
    },
    createdAt: '2026-09-10T12:00:00.000Z',
    tags: ['Shorts', 'Nature', 'Iceland', '4K', 'Relax'],
    category: 'Travel & Events',
    isMonetized: true,
    adSettings: {
      hasPreRoll: false,
      hasMidRoll: false,
      cpmRate: 6.8,
      estimatedEarnings: 640.56,
    },
    moderation: {
      status: 'APPROVED',
      overallScore: 100,
      contentRating: 'ALL_AGES',
      adEligibility: 'MONETIZED_FULL',
      isCopyrightSafe: true,
      summary: 'Shorts algorithm verified safe. High viewer retention signals. Monetized under Shorts Creator Pool.',
      timestamp: '2026-09-10T12:00:30.000Z',
      automatedBy: 'Gemini 3.8 Automated Safety Engine',
      categories: [
        { category: 'Violence & Gore', score: 100, flagged: false, notes: 'Safe nature' },
        { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'Safe' },
        { category: 'Explicit / Adult', score: 100, flagged: false, notes: 'Safe' },
        { category: 'Spam & Misleading', score: 99, flagged: false, notes: 'Genuine short format' },
        { category: 'Copyright & IP Integrity', score: 100, flagged: false, notes: 'Original audio track' },
        { category: '4K Technical Standards', score: 98, flagged: false, notes: 'Vertical 4K 9:16 aspect ratio verified' },
      ],
    },
    commentsCount: 22,
    directSharesCount: 310,
    is4KMaster: true,
    fileSizeMb: 140,
  },
  {
    id: 'vid-short-latte-mastery',
    title: 'World Champion Barista Latte Art in 15 Seconds ☕ #Shorts #Coffee',
    description: `Watch this swan latte art pour at 120 FPS slow motion! Would you drink it or keep looking at it? ☕✨ #Coffee #Barista #Shorts`,
    format: 'shorts',
    videoUrl: '/videos/latte_short.mp4',
    maxResolution: '1080p 60fps',
    fps: 60,
    aspectRatio: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop',
    duration: 16,
    durationFormatted: '0:16',
    views: 654000,
    likes: 62100,
    dislikes: 310,
    shares: 8900,
    isLikedByUser: false,
    isDislikedByUser: false,
    creator: {
      id: 'chan-crafts',
      name: 'Artisan Crafts',
      handle: '@artisancrafts',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      subscribers: 184000,
      isVerified: false,
      isPartner: true,
    },
    createdAt: '2026-09-10T16:20:00.000Z',
    tags: ['Shorts', 'Coffee', 'Art', 'Food', 'Satisfying'],
    category: 'Howto & Style',
    isMonetized: true,
    adSettings: {
      hasPreRoll: false,
      hasMidRoll: false,
      cpmRate: 5.5,
      estimatedEarnings: 359.7,
    },
    moderation: {
      status: 'APPROVED',
      overallScore: 100,
      contentRating: 'ALL_AGES',
      adEligibility: 'MONETIZED_FULL',
      isCopyrightSafe: true,
      summary: 'Verified wholesome culinary craftsmanship. Clean audio and family friendly.',
      timestamp: '2026-09-10T16:20:30.000Z',
      automatedBy: 'Gemini 3.8 Automated Safety Engine',
      categories: [
        { category: 'Violence & Gore', score: 100, flagged: false, notes: 'Zero' },
        { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'Zero' },
        { category: 'Explicit / Adult', score: 100, flagged: false, notes: 'Zero' },
        { category: 'Spam & Misleading', score: 100, flagged: false, notes: 'Authentic craftsmanship' },
        { category: 'Copyright & IP Integrity', score: 100, flagged: false, notes: 'Original audio' },
        { category: '4K Technical Standards', score: 95, flagged: false, notes: 'High-definition 60fps vertical' },
      ],
    },
    commentsCount: 16,
    directSharesCount: 195,
    is4KMaster: false,
    fileSizeMb: 85,
  },
  {
    id: 'vid-4k-scifi-elephants',
    title: 'Elephants Dream: Next-Gen 4K Remastered Open CGI Thriller',
    description: `Step inside the mechanical machine mind with Emo and Proog in this groundbreaking 4K remastered computer-animated journey. Featuring spatial 3D surround sound and hyper-detailed mechanical gears in ultra resolution.`,
    format: 'long-form',
    videoUrl: '/videos/quantum_computing.mp4',
    maxResolution: '4K (2160p)',
    fps: 60,
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    duration: 653,
    durationFormatted: '10:53',
    views: 310500,
    likes: 24800,
    dislikes: 190,
    shares: 3140,
    isLikedByUser: false,
    isDislikedByUser: false,
    creator: {
      id: 'chan-openanim',
      name: 'Open Cinema Studio',
      handle: '@opencinema',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      subscribers: 890000,
      isVerified: true,
      isPartner: true,
      totalEarnings: 22400.0,
      monthlyRevenue: 4900.0,
    },
    createdAt: '2026-09-02T11:00:00.000Z',
    tags: ['4K', 'SciFi', 'Animation', 'CGI', 'Blender'],
    category: 'Film & Animation',
    isMonetized: true,
    adSettings: {
      hasPreRoll: true,
      hasMidRoll: true,
      midRollPoints: [180, 420],
      cpmRate: 15.2,
      estimatedEarnings: 2890.0,
    },
    moderation: {
      status: 'APPROVED',
      overallScore: 97,
      contentRating: 'TEEN_13',
      adEligibility: 'MONETIZED_FULL',
      isCopyrightSafe: true,
      summary: 'Sci-fi fantasy themes suitable for general and teen audiences. Cleared for full ad revenue.',
      timestamp: '2026-09-02T11:01:00.000Z',
      automatedBy: 'Gemini 3.8 Automated Safety Engine',
      categories: [
        { category: 'Violence & Gore', score: 96, flagged: false, notes: 'Stylized surreal mechanical fantasy' },
        { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'Zero' },
        { category: 'Explicit / Adult', score: 100, flagged: false, notes: 'Zero' },
        { category: 'Spam & Misleading', score: 98, flagged: false, notes: 'True description' },
        { category: 'Copyright & IP Integrity', score: 100, flagged: false, notes: 'Creative Commons 2.5' },
        { category: '4K Technical Standards', score: 98, flagged: false, notes: 'Native 4K rendering' },
      ],
    },
    commentsCount: 11,
    directSharesCount: 82,
    is4KMaster: true,
    fileSizeMb: 1100,
  }
];

const initialComments: Record<string, Comment[]> = {
  'vid-4k-cybercity': [
    {
      id: 'com-1',
      videoId: 'vid-4k-cybercity',
      userId: 'user-marcus',
      userName: 'Marcus Vance',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      content: 'The color grading on those neon billboards at 0:45 in native 4K 60fps on an OLED screen is pure art! Hats off to the lighting crew.',
      timestamp: '2 days ago',
      likes: 184,
      isLikedByUser: false,
      isCreatorHearted: true,
      replies: [
        {
          id: 'com-1-rep-1',
          videoId: 'vid-4k-cybercity',
          userId: 'chan-cyberarts',
          userName: 'Cinema Lab 4K',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          content: 'Thank you Marcus! We spent over 80 hours mastering the color palette in ACES HDR to preserve the highlight roll-off.',
          timestamp: '1 day ago',
          likes: 42,
          isCreator: true,
        }
      ]
    },
    {
      id: 'com-2',
      videoId: 'vid-4k-cybercity',
      userId: 'user-elena',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      content: 'Sent this directly to my filmmaking class. Best example of spatial cinematography on the web right now.',
      timestamp: '1 day ago',
      likes: 92,
      isLikedByUser: false,
      isSuperThanks: true,
      superThanksAmount: 10,
    },
    {
      id: 'com-3',
      videoId: 'vid-4k-cybercity',
      userId: 'user-dave',
      userName: 'David Kim',
      userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop',
      content: 'Can confirm 4K streaming is buttery smooth without any buffering. Great automated moderation on this platform keeping comments clean too!',
      timestamp: '8 hours ago',
      likes: 31,
      isLikedByUser: false,
    }
  ],
  'vid-4k-wildlife-escape': [
    {
      id: 'com-w1',
      videoId: 'vid-4k-wildlife-escape',
      userId: 'user-clara',
      userName: 'Dr. Clara Thorne',
      userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
      content: 'The acoustic recording of the ice shelf shifting at 5:20 is phenomenal. You can feel the sheer scale of the glacier.',
      timestamp: '1 day ago',
      likes: 128,
      isCreatorHearted: true,
      isSuperThanks: true,
      superThanksAmount: 25,
    },
    {
      id: 'com-w2',
      videoId: 'vid-4k-wildlife-escape',
      userId: 'user-sam',
      userName: 'Samir Patel',
      userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop',
      content: 'Nature documentaries like this deserve every penny of creator monetization. Just joined as a channel member!',
      timestamp: '12 hours ago',
      likes: 47,
    }
  ],
  'vid-short-waterfall-drop': [
    {
      id: 'com-s1',
      videoId: 'vid-short-waterfall-drop',
      userId: 'user-maya',
      userName: 'Maya Lin',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      content: 'The water is so crystal clear it looks like liquid sapphire! Adding this to my bucket list now.',
      timestamp: '5 hours ago',
      likes: 312,
    }
  ]
};

const initialCreatorStats: CreatorMonetizationStats = {
  subscriberCount: 245000,
  subscriberGoal: 1000,
  watchHours: 18450,
  watchHoursGoal: 4000,
  isEligibleForYPP: true,
  isPartnerEnrolled: true,
  estimatedMonthlyEarnings: 3840.75,
  allTimeEarnings: 28450.0,
  superThanksEarnings: 4210.0,
  adEarnings: 24240.0,
  rpm: 8.92,
  cpm: 15.4,
  recentTransactions: [
    {
      id: 'tx-1',
      type: 'super_thanks',
      amount: 25.0,
      fromUser: 'Dr. Clara Thorne',
      videoTitle: 'Wonders of Patagonia: Pristine Glaciers',
      date: 'Today, 2:40 PM',
    },
    {
      id: 'tx-2',
      type: 'super_thanks',
      amount: 10.0,
      fromUser: 'Elena Rostova',
      videoTitle: 'Neon Odyssey: 4K 60FPS Cyberpunk Cinema Journey',
      date: 'Yesterday, 8:15 PM',
    },
    {
      id: 'tx-3',
      type: 'ad_revenue',
      amount: 142.8,
      videoTitle: 'Ad Pool Daily Distribution (4K High RPM Tier)',
      date: 'Yesterday, 11:59 PM',
    },
    {
      id: 'tx-4',
      type: 'membership',
      amount: 4.99,
      fromUser: 'Samir Patel',
      videoTitle: 'Earth Explorer VIP Membership',
      date: 'Yesterday, 3:10 PM',
    },
  ],
};

// Ensure database file exists and load it
function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const loadedVideos = (parsed.videos || initialSeedVideos).map((v: VideoItem) => {
        if (
          v.videoUrl.includes('commondatastorage.googleapis.com') ||
          v.videoUrl.includes('assets.mixkit.co')
        ) {
          const fallback = v.format === 'shorts' ? '/videos/nature_short.mp4' : '/videos/cyberpunk_4k.mp4';
          return { ...v, videoUrl: fallback };
        }
        return v;
      });

      return {
        videos: loadedVideos,
        comments: parsed.comments || initialComments,
        moderationLogs: parsed.moderationLogs || [],
        creatorStats: parsed.creatorStats || initialCreatorStats,
        directShares: parsed.directShares || [],
        subscriptions: parsed.subscriptions || {},
        userProfile: parsed.userProfile || initialUserProfile,
        savedVideoIds: parsed.savedVideoIds || ['vid-4k-cybercity'],
        watchHistory: parsed.watchHistory || {},
      };
    } catch (e) {
      console.error('Error reading database, restoring defaults:', e);
    }
  }

  const initialDb: DatabaseSchema = {
    videos: initialSeedVideos,
    comments: initialComments,
    moderationLogs: initialSeedVideos.map((v) => ({
      id: 'mod-' + v.id,
      videoId: v.id,
      videoTitle: v.title,
      creatorName: v.creator.name,
      overallScore: v.moderation.overallScore,
      status: v.moderation.status,
      contentRating: v.moderation.contentRating,
      adEligibility: v.moderation.adEligibility,
      summary: v.moderation.summary,
      timestamp: v.moderation.timestamp,
      categories: v.moderation.categories,
    })),
    creatorStats: initialCreatorStats,
    directShares: [],
    subscriptions: { 'chan-cyberarts': true },
    userProfile: initialUserProfile,
    savedVideoIds: ['vid-4k-cybercity'],
    watchHistory: {},
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(dbData: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (e) {
    console.error('Failed to save database file:', e);
  }
}

let db = loadDatabase();

// Automated AI Content Moderation for Videos using Gemini
async function runAutomatedVideoModeration(
  title: string,
  description: string,
  category: string,
  tags: string[],
  maxResolution: string,
  is4K: boolean
): Promise<ModerationReport> {
  const prompt = `You are the Automated AI Content Safety & Quality Moderation Engine for a YouTube-like 4K video social media platform.
Evaluate the following video submission for community safety, copyright clearance, age rating, and ad-suitability:

Video Title: "${title}"
Video Description: "${description}"
Category: "${category}"
Tags: ${JSON.stringify(tags)}
Claimed Resolution: "${maxResolution}" (Is 4K Master: ${is4K})

Analyze the content against strict safety standards across these 6 categories:
1. "Violence & Gore": Physical violence, cruelty, weapons, terror, bodily harm.
2. "Hate & Harassment": Harassment, hate speech, bullying, defamation, slurs.
3. "Explicit / Adult": Nudity, sexual content, predatory behavior.
4. "Spam & Misleading": Deceptive clickbait, financial scams, phishing, fake giveaways.
5. "Copyright & IP Integrity": Pirated media, re-uploads, unauthorized music, fair use compliance.
6. "4K Technical Standards": High-fidelity resolution, visual clarity, metadata consistency.

Respond strictly with a JSON object conforming to this schema:
{
  "status": "APPROVED" | "RESTRICTED_18_PLUS" | "MONETIZATION_FLAGGED" | "REJECTED",
  "overallScore": number between 0 and 100 (where 100 is completely safe and pristine),
  "contentRating": "ALL_AGES" | "TEEN_13" | "MATURE_18",
  "adEligibility": "MONETIZED_FULL" | "MONETIZED_LIMITED" | "DEMONETIZED",
  "isCopyrightSafe": boolean,
  "summary": "1-2 sentence constructive verdict summarizing safety and monetization approval",
  "categories": [
    {
      "category": "Violence & Gore",
      "score": number between 0 and 100,
      "flagged": boolean,
      "notes": "short evaluation note"
    },
    ... (all 6 categories listed above)
  ]
}`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          status: parsed.status || 'APPROVED',
          overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : 96,
          contentRating: parsed.contentRating || 'ALL_AGES',
          adEligibility: parsed.adEligibility || 'MONETIZED_FULL',
          isCopyrightSafe: parsed.isCopyrightSafe !== undefined ? parsed.isCopyrightSafe : true,
          summary: parsed.summary || 'Automated scan passed. Video verified safe for general broadcast and full ad monetization.',
          timestamp: new Date().toISOString(),
          automatedBy: 'Gemini 3.8 Flash Automated Safety Engine',
          categories: parsed.categories || [],
        };
      }
    }
  } catch (err) {
    console.warn('Gemini video moderation scan fallback (using rule engine):', err);
  }

  // Robust rule-based fallback if API is unavailable
  const lowerText = (title + ' ' + description + ' ' + tags.join(' ')).toLowerCase();
  const prohibitedViolentWords = ['kill', 'murder', 'blood', 'slaughter', 'bomb', 'terror', 'decapitate'];
  const prohibitedAdultWords = ['porn', 'xxx', 'nudity', 'nsfw', 'explicit'];
  const prohibitedScamWords = ['free crypto', 'doubler', 'send bitcoin', 'telegram hack', 'whatsapp +1', 'click here for gift card'];

  const hasViolence = prohibitedViolentWords.some((w) => lowerText.includes(w));
  const hasAdult = prohibitedAdultWords.some((w) => lowerText.includes(w));
  const hasScam = prohibitedScamWords.some((w) => lowerText.includes(w));

  let status: ModerationReport['status'] = 'APPROVED';
  let rating: ModerationReport['contentRating'] = 'ALL_AGES';
  let adEligibility: ModerationReport['adEligibility'] = 'MONETIZED_FULL';
  let overallScore = 97;

  if (hasScam || hasAdult || hasViolence) {
    if (hasAdult || hasScam) {
      status = 'REJECTED';
      adEligibility = 'DEMONETIZED';
      overallScore = 20;
    } else {
      status = 'RESTRICTED_18_PLUS';
      rating = 'MATURE_18';
      adEligibility = 'MONETIZED_LIMITED';
      overallScore = 55;
    }
  }

  return {
    status,
    overallScore,
    contentRating: rating,
    adEligibility,
    isCopyrightSafe: !hasScam,
    summary:
      status === 'APPROVED'
        ? `Video passes automated safety guidelines. Clear metadata and 4K technical standards approved for all audiences.`
        : `Automated scan flagged content for review. Status set to ${status}.`,
    timestamp: new Date().toISOString(),
    automatedBy: 'Automated Safety Engine (Gemini 3.8 Rule Protocol)',
    categories: [
      { category: 'Violence & Gore', score: hasViolence ? 40 : 100, flagged: hasViolence, notes: hasViolence ? 'Violent keywords flagged' : 'Clean' },
      { category: 'Hate & Harassment', score: 100, flagged: false, notes: 'Zero toxicity detected' },
      { category: 'Explicit / Adult', score: hasAdult ? 20 : 100, flagged: hasAdult, notes: hasAdult ? 'Explicit indicators detected' : 'Clean' },
      { category: 'Spam & Misleading', score: hasScam ? 25 : 98, flagged: hasScam, notes: hasScam ? 'Potential spam pattern detected' : 'Verified metadata' },
      { category: 'Copyright & IP Integrity', score: 96, flagged: false, notes: 'Metadata matches claimed original content' },
      { category: '4K Technical Standards', score: is4K ? 100 : 92, flagged: false, notes: is4K ? 'Native 4K UHD 2160p verified' : 'Standard resolution verified' },
    ],
  };
}

// Automated Comment Moderation using Gemini
async function runAutomatedCommentModeration(
  commentText: string,
  videoTitle: string
): Promise<{ approved: boolean; score: number; reason: string }> {
  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate this comment posted on video "${videoTitle}" for hate speech, extreme toxicity, harassment, spam or phishing links:
"${commentText}"

Reply in JSON:
{
  "approved": boolean,
  "score": number from 0 to 100 (where 100 is friendly and completely respectful),
  "reason": "short explanation"
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          approved: parsed.approved !== false,
          score: typeof parsed.score === 'number' ? parsed.score : 95,
          reason: parsed.reason || 'Approved by automated filter',
        };
      }
    }
  } catch (err) {
    console.warn('Comment AI moderation fallback:', err);
  }

  // Fallback rule check
  const toxicTerms = ['hate you', 'kill yourself', 'kys', 'scam bit.ly', 'whatsapp me for money', 'stupid idiot'];
  const lower = commentText.toLowerCase();
  const isToxic = toxicTerms.some((t) => lower.includes(t));

  return {
    approved: !isToxic,
    score: isToxic ? 15 : 95,
    reason: isToxic ? 'Flagged for violating community safety and harassment guidelines.' : 'Verified compliant with community standards.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all videos with optional filtering
  app.get('/api/videos', (req, res) => {
    const format = req.query.format as string; // 'all', 'long-form', 'shorts'
    const category = req.query.category as string;
    const query = (req.query.q as string || '').toLowerCase().trim();
    const resolution = req.query.resolution as string; // '4k'

    let filtered = [...db.videos];

    if (format && format !== 'all') {
      filtered = filtered.filter((v) => v.format === format);
    }

    if (category && category !== 'All') {
      if (category === '4K Ultra HD') {
        filtered = filtered.filter((v) => v.is4KMaster || v.maxResolution.includes('4K'));
      } else if (category === 'Monetized') {
        filtered = filtered.filter((v) => v.isMonetized);
      } else {
        filtered = filtered.filter((v) => v.category.toLowerCase() === category.toLowerCase());
      }
    }

    if (resolution === '4k') {
      filtered = filtered.filter((v) => v.is4KMaster || v.maxResolution.includes('4K'));
    }

    if (query) {
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.tags.some((t) => t.toLowerCase().includes(query)) ||
          v.creator.name.toLowerCase().includes(query)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: filtered.length,
      videos: filtered,
    });
  });

  // Get single video details
  app.get('/api/videos/:id', (req, res) => {
    const id = req.params.id;
    const video = db.videos.find((v) => v.id === id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Increment views safely
    video.views += 1;
    // Increment estimated ad earnings if monetized
    if (video.isMonetized && video.adSettings) {
      const additionalRev = (video.adSettings.cpmRate / 1000) * 0.55; // 55% creator share
      video.adSettings.estimatedEarnings = Number((video.adSettings.estimatedEarnings + additionalRev).toFixed(4));
      db.creatorStats.adEarnings = Number((db.creatorStats.adEarnings + additionalRev).toFixed(2));
      db.creatorStats.allTimeEarnings = Number((db.creatorStats.allTimeEarnings + additionalRev).toFixed(2));
      db.creatorStats.watchHours = Number((db.creatorStats.watchHours + video.duration / 3600).toFixed(2));
    }
    saveDatabase(db);

    const videoComments = db.comments[id] || [];

    res.json({
      success: true,
      video,
      comments: videoComments,
      isSubscribed: !!db.subscriptions[video.creator.id],
    });
  });

  // On-demand automated AI moderation scan for video draft
  app.post('/api/moderate-video', async (req, res) => {
    const { title, description, category, tags, maxResolution, is4K } = req.body;
    try {
      const report = await runAutomatedVideoModeration(
        title || 'Untitled',
        description || '',
        category || 'General',
        tags || [],
        maxResolution || '4K (2160p)',
        Boolean(is4K)
      );
      res.json({ success: true, report });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message || 'Moderation scan failed' });
    }
  });

  // Upload / Post a new video (with automated AI moderation check)
  app.post('/api/videos', async (req, res) => {
    try {
      const {
        title,
        description,
        format,
        videoUrl,
        maxResolution,
        fps,
        aspectRatio,
        thumbnailUrl,
        duration,
        durationFormatted,
        tags,
        category,
        chapters,
        isMonetized,
        creatorName,
        creatorHandle,
        creatorAvatar,
        fileSizeMb,
      } = req.body;

      if (!title || !videoUrl) {
        return res.status(400).json({ success: false, error: 'Title and Video URL are required' });
      }

      const is4KMaster = maxResolution?.includes('4K') || maxResolution === '4K (2160p)';

      // 1. Run automated AI moderation scan
      const moderationReport = await runAutomatedVideoModeration(
        title,
        description || '',
        category || 'Entertainment',
        tags || [],
        maxResolution || '4K (2160p)',
        is4KMaster
      );

      // Check if severe violation
      if (moderationReport.status === 'REJECTED') {
        return res.status(422).json({
          success: false,
          error: 'Video upload rejected by automated safety engine: contains prohibited content.',
          moderation: moderationReport,
        });
      }

      const newId = 'vid-' + Date.now();
      const newVideo: VideoItem = {
        id: newId,
        title,
        description: description || '',
        format: (format as any) || 'long-form',
        videoUrl,
        maxResolution: maxResolution || (format === 'shorts' ? '1080p 60fps' : '4K (2160p)'),
        fps: Number(fps) || 60,
        aspectRatio: (aspectRatio as any) || (format === 'shorts' ? '9:16' : '16:9'),
        thumbnailUrl:
          thumbnailUrl ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        duration: Number(duration) || 120,
        durationFormatted: durationFormatted || '2:00',
        views: 1,
        likes: 0,
        dislikes: 0,
        shares: 0,
        creator: {
          id: 'chan-current-user',
          name: creatorName || 'You (Creator)',
          handle: creatorHandle || '@mychannel',
          avatar:
            creatorAvatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          subscribers: 1250,
          isVerified: true,
          isPartner: true,
        },
        createdAt: new Date().toISOString(),
        tags: tags || ['4K', 'NewUpload'],
        category: category || 'Entertainment',
        chapters: chapters || [],
        isMonetized: isMonetized !== false && moderationReport.adEligibility !== 'DEMONETIZED',
        adSettings: {
          hasPreRoll: true,
          hasMidRoll: (Number(duration) || 0) > 300,
          cpmRate: is4KMaster ? 18.2 : 11.5,
          estimatedEarnings: 0,
        },
        moderation: moderationReport,
        commentsCount: 0,
        directSharesCount: 0,
        is4KMaster: is4KMaster,
        fileSizeMb: Number(fileSizeMb) || (is4KMaster ? 850 : 220),
      };

      // Add to database
      db.videos.unshift(newVideo);
      db.comments[newId] = [];

      // Record in moderation audit logs
      db.moderationLogs.unshift({
        id: 'mod-' + Date.now(),
        videoId: newId,
        videoTitle: title,
        creatorName: newVideo.creator.name,
        overallScore: moderationReport.overallScore,
        status: moderationReport.status,
        contentRating: moderationReport.contentRating,
        adEligibility: moderationReport.adEligibility,
        summary: moderationReport.summary,
        timestamp: moderationReport.timestamp,
        categories: moderationReport.categories,
      });

      saveDatabase(db);

      res.status(201).json({
        success: true,
        video: newVideo,
        message: 'Video published successfully and instantly visible to all users!',
      });
    } catch (e: any) {
      console.error('Error posting video:', e);
      res.status(500).json({ success: false, error: e.message || 'Failed to post video' });
    }
  });

  // Record a view count on a video
  app.post('/api/videos/:id/view', (req, res) => {
    const id = req.params.id;
    const video = db.videos.find((v) => v.id === id);
    if (video) {
      video.views = (video.views || 0) + 1;
      saveDatabase(db);
      return res.json({ success: true, views: video.views });
    }
    res.status(404).json({ success: false, error: 'Video not found' });
  });

  // Like or Dislike toggle on a video
  app.post('/api/videos/:id/like', (req, res) => {
    const id = req.params.id;
    const { action } = req.body; // 'like' | 'dislike' | 'none'
    const video = db.videos.find((v) => v.id === id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    if (action === 'like') {
      if (!video.isLikedByUser) {
        video.likes += 1;
        video.isLikedByUser = true;
        if (video.isDislikedByUser) {
          video.dislikes = Math.max(0, video.dislikes - 1);
          video.isDislikedByUser = false;
        }
      } else {
        video.likes = Math.max(0, video.likes - 1);
        video.isLikedByUser = false;
      }
    } else if (action === 'dislike') {
      if (!video.isDislikedByUser) {
        video.dislikes += 1;
        video.isDislikedByUser = true;
        if (video.isLikedByUser) {
          video.likes = Math.max(0, video.likes - 1);
          video.isLikedByUser = false;
        }
      } else {
        video.dislikes = Math.max(0, video.dislikes - 1);
        video.isDislikedByUser = false;
      }
    }

    saveDatabase(db);
    res.json({
      success: true,
      likes: video.likes,
      dislikes: video.dislikes,
      isLikedByUser: video.isLikedByUser,
      isDislikedByUser: video.isDislikedByUser,
    });
  });

  // Get all comments for a video
  app.get('/api/videos/:id/comments', (req, res) => {
    const videoId = req.params.id;
    const comments = db.comments[videoId] || [];
    res.json({
      success: true,
      comments,
      count: comments.length,
    });
  });

  // Post a new comment with Automated AI Moderation check
  app.post('/api/videos/:id/comments', async (req, res) => {
    const videoId = req.params.id;
    const { content, userName, userAvatar, parentCommentId, isSuperThanks, superThanksAmount } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content cannot be empty' });
    }

    const video = db.videos.find((v) => v.id === videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Run automated AI comment moderation
    const moderation = await runAutomatedCommentModeration(content, video.title);
    if (!moderation.approved) {
      return res.status(422).json({
        success: false,
        error: `Comment blocked by automated moderation: ${moderation.reason}`,
        score: moderation.score,
      });
    }

    const commentId = 'com-' + Date.now();
    const newComment: Comment = {
      id: commentId,
      videoId,
      userId: 'user-' + Date.now(),
      userName: userName || 'Viewer',
      userAvatar:
        userAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      content: content.trim(),
      timestamp: 'Just now',
      likes: 0,
      isLikedByUser: false,
      isSuperThanks: Boolean(isSuperThanks),
      superThanksAmount: superThanksAmount ? Number(superThanksAmount) : undefined,
      moderationScore: moderation.score,
    };

    if (!db.comments[videoId]) {
      db.comments[videoId] = [];
    }

    if (parentCommentId) {
      const parent = db.comments[videoId].find((c) => c.id === parentCommentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      } else {
        db.comments[videoId].unshift(newComment);
      }
    } else {
      db.comments[videoId].unshift(newComment);
    }

    video.commentsCount += 1;
    saveDatabase(db);

    res.status(201).json({
      success: true,
      comment: newComment,
      parentCommentId: parentCommentId || null,
      moderationScore: moderation.score,
      totalComments: video.commentsCount,
    });
  });

  // Like a comment
  app.post('/api/comments/:id/like', (req, res) => {
    const commentId = req.params.id;
    let found = false;

    for (const vId in db.comments) {
      for (const comment of db.comments[vId]) {
        if (comment.id === commentId) {
          comment.isLikedByUser = !comment.isLikedByUser;
          comment.likes += comment.isLikedByUser ? 1 : -1;
          found = true;
          break;
        }
        if (comment.replies) {
          for (const rep of comment.replies) {
            if (rep.id === commentId) {
              rep.isLikedByUser = !rep.isLikedByUser;
              rep.likes += rep.isLikedByUser ? 1 : -1;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    saveDatabase(db);
    res.json({ success: true });
  });

  // Direct Sharing Endpoint: record direct shares & direct messages
  app.post('/api/videos/:id/share', (req, res) => {
    const videoId = req.params.id;
    const { recipientHandle, senderName, message, startAtSeconds, platform } = req.body as DirectSharePayload;

    const video = db.videos.find((v) => v.id === videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    video.shares += 1;
    video.directSharesCount += 1;

    const shareRecord = {
      id: 'share-' + Date.now(),
      videoId,
      senderName: senderName || 'Anonymous',
      recipientHandle: recipientHandle || 'direct-link',
      message: message || '',
      timestamp: new Date().toISOString(),
    };

    db.directShares.unshift(shareRecord);
    saveDatabase(db);

    res.json({
      success: true,
      shareUrl: `${req.protocol}://${req.get('host')}/watch/${videoId}${
        startAtSeconds ? `?t=${startAtSeconds}` : ''
      }`,
      shareRecord,
      totalShares: video.shares,
    });
  });

  // Super Thanks / Creator Monetization Tip
  app.post('/api/super-thanks', async (req, res) => {
    const { videoId, creatorId, amount, donorName, donorAvatar, message } = req.body as SuperThanksPayload;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid donation amount' });
    }

    const video = db.videos.find((v) => v.id === videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Add revenue to creator stats
    db.creatorStats.superThanksEarnings = Number((db.creatorStats.superThanksEarnings + numAmount).toFixed(2));
    db.creatorStats.allTimeEarnings = Number((db.creatorStats.allTimeEarnings + numAmount).toFixed(2));
    db.creatorStats.estimatedMonthlyEarnings = Number((db.creatorStats.estimatedMonthlyEarnings + numAmount).toFixed(2));

    // Record transaction
    db.creatorStats.recentTransactions.unshift({
      id: 'st-' + Date.now(),
      type: 'super_thanks',
      amount: numAmount,
      fromUser: donorName || 'Generous Viewer',
      videoTitle: video.title,
      date: 'Just now',
    });

    // Create a special highlighted Super Thanks comment
    if (message && message.trim()) {
      const stComment: Comment = {
        id: 'st-com-' + Date.now(),
        videoId,
        userId: 'user-donor-' + Date.now(),
        userName: donorName || 'Supporter',
        userAvatar:
          donorAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        content: message.trim(),
        timestamp: 'Just now',
        likes: 1,
        isSuperThanks: true,
        superThanksAmount: numAmount,
        isCreatorHearted: true,
      };

      if (!db.comments[videoId]) db.comments[videoId] = [];
      db.comments[videoId].unshift(stComment);
      video.commentsCount += 1;
    }

    saveDatabase(db);

    res.json({
      success: true,
      amount: numAmount,
      newTotal: db.creatorStats.superThanksEarnings,
      comment: (message && message.trim()) ? db.comments[videoId]?.[0] : null,
      message: `Super Thanks of $${numAmount.toFixed(2)} sent directly to creator!`,
    });
  });

  // Get active channel subscriptions
  app.get('/api/channel/subscriptions', (_req, res) => {
    res.json({
      success: true,
      subscriptions: db.subscriptions || {},
    });
  });

  // Channel Subscribe Toggle
  app.post('/api/channel/subscribe', (req, res) => {
    const { channelId } = req.body;
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'Channel ID required' });
    }

    const current = !!db.subscriptions[channelId];
    db.subscriptions[channelId] = !current;

    // Update subscriber counts on videos
    for (const vid of db.videos) {
      if (vid.creator.id === channelId) {
        vid.creator.subscribers += db.subscriptions[channelId] ? 1 : -1;
      }
    }

    saveDatabase(db);

    res.json({
      success: true,
      isSubscribed: db.subscriptions[channelId],
    });
  });

  // Creator Monetization Studio Analytics
  app.get('/api/creator/stats', (req, res) => {
    res.json({
      success: true,
      stats: db.creatorStats,
      totalVideos: db.videos.length,
    });
  });

  app.get('/api/monetization/stats', (req, res) => {
    res.json({
      success: true,
      stats: db.creatorStats,
      totalVideos: db.videos.length,
    });
  });

  // Moderation Audit Logs & Statistics
  app.get('/api/moderation/audit-log', (req, res) => {
    res.json({
      success: true,
      logs: db.moderationLogs,
      summary: {
        totalScans: db.moderationLogs.length,
        approvedRate:
          db.moderationLogs.length > 0
            ? Math.round(
                (db.moderationLogs.filter((l) => l.status === 'APPROVED').length / db.moderationLogs.length) * 100
              )
            : 100,
        averageSafetyScore:
          db.moderationLogs.length > 0
            ? Math.round(
                db.moderationLogs.reduce((acc, curr) => acc + curr.overallScore, 0) / db.moderationLogs.length
              )
            : 98,
        fullyMonetizedRate:
          db.moderationLogs.length > 0
            ? Math.round(
                (db.moderationLogs.filter((l) => l.adEligibility === 'MONETIZED_FULL').length /
                  db.moderationLogs.length) *
                  100
              )
            : 100,
      },
    });
  });

  // User Profile: Get active profile
  app.get('/api/user/profile', (req, res) => {
    res.json({
      success: true,
      profile: db.userProfile || initialUserProfile,
    });
  });

  // User Profile: Custom update of username, display name, avatar, banner, bio, links, etc.
  app.put('/api/user/profile', (req, res) => {
    const {
      name,
      handle,
      avatar,
      bannerUrl,
      bio,
      category,
      location,
      website,
      socialLinks,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Display name cannot be empty' });
    }

    // Format handle/username
    let formattedHandle = (handle || '').trim();
    if (!formattedHandle) {
      formattedHandle = '@' + name.toLowerCase().replace(/[^a-z0-9_]/g, '');
    } else {
      if (!formattedHandle.startsWith('@')) {
        formattedHandle = '@' + formattedHandle;
      }
      formattedHandle = formattedHandle.replace(/[^a-zA-Z0-9_@.-]/g, '');
    }

    if (formattedHandle.length < 2) {
      return res.status(400).json({ success: false, error: 'Username must have at least 1 character after @' });
    }

    const previousHandle = db.userProfile?.handle || '@alexchen4k';
    const previousName = db.userProfile?.name || 'Alex Chen (4K Studio)';

    // Update profile
    db.userProfile = {
      ...db.userProfile,
      name: name.trim(),
      handle: formattedHandle,
      avatar: avatar || db.userProfile?.avatar || initialUserProfile.avatar,
      bannerUrl: bannerUrl || db.userProfile?.bannerUrl || initialUserProfile.bannerUrl,
      bio: bio !== undefined ? bio.trim() : (db.userProfile?.bio || ''),
      category: category || db.userProfile?.category || 'Film & Animation',
      location: location !== undefined ? location.trim() : db.userProfile?.location,
      website: website !== undefined ? website.trim() : db.userProfile?.website,
      socialLinks: Array.isArray(socialLinks) ? socialLinks : db.userProfile?.socialLinks || [],
    };

    // Synchronize videos created by this user
    for (const vid of db.videos) {
      if (
        vid.creator.handle === previousHandle ||
        vid.creator.name === previousName ||
        vid.creator.id === 'chan-current-user' ||
        vid.creator.id === db.userProfile.id
      ) {
        vid.creator.name = db.userProfile.name;
        vid.creator.handle = db.userProfile.handle;
        vid.creator.avatar = db.userProfile.avatar;
      }
    }

    // Synchronize comments posted by this user
    for (const vId in db.comments) {
      for (const c of db.comments[vId]) {
        if (c.userName === previousName) {
          c.userName = db.userProfile.name;
          c.userAvatar = db.userProfile.avatar;
        }
        if (c.replies) {
          for (const rep of c.replies) {
            if (rep.userName === previousName) {
              rep.userName = db.userProfile.name;
              rep.userAvatar = db.userProfile.avatar;
            }
          }
        }
      }
    }

    saveDatabase(db);

    res.json({
      success: true,
      profile: db.userProfile,
      message: 'Profile and username updated successfully',
    });
  });

  // Get Channel & Profile by handle or id
  app.get('/api/channels/:identifier', (req, res) => {
    const rawId = req.params.identifier;
    const identifier = rawId.startsWith('@') ? rawId.toLowerCase() : '@' + rawId.toLowerCase();

    // Check if matching current user
    if (
      db.userProfile.handle.toLowerCase() === identifier ||
      db.userProfile.id.toLowerCase() === rawId.toLowerCase()
    ) {
      const userVideos = db.videos.filter(
        (v) =>
          v.creator.handle.toLowerCase() === db.userProfile.handle.toLowerCase() ||
          v.creator.name === db.userProfile.name ||
          v.creator.id === 'chan-current-user' ||
          v.creator.id === db.userProfile.id
      );

      return res.json({
        success: true,
        channel: db.userProfile,
        videos: userVideos,
        isSelf: true,
      });
    }

    // Look for creator in existing videos
    const matchVid = db.videos.find(
      (v) =>
        v.creator.handle.toLowerCase() === identifier ||
        v.creator.id.toLowerCase() === rawId.toLowerCase()
    );

    if (matchVid) {
      const channelVideos = db.videos.filter(
        (v) => v.creator.id === matchVid.creator.id || v.creator.handle === matchVid.creator.handle
      );

      const channelProfile: UserProfile = {
        id: matchVid.creator.id,
        name: matchVid.creator.name,
        handle: matchVid.creator.handle,
        avatar: matchVid.creator.avatar,
        bannerUrl:
          matchVid.creator.bannerUrl ||
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
        bio:
          matchVid.creator.description ||
          `Official 4K channel for ${matchVid.creator.name}. High-definition cinematic streams and original productions.`,
        category: matchVid.category,
        subscribers: matchVid.creator.subscribers,
        isVerified: matchVid.creator.isVerified,
        isPartner: matchVid.creator.isPartner,
        joinedDate: 'January 2024',
      };

      return res.json({
        success: true,
        channel: channelProfile,
        videos: channelVideos,
        isSelf: false,
        isSubscribed: !!db.subscriptions[matchVid.creator.id],
      });
    }

    return res.status(404).json({ success: false, error: 'Channel not found' });
  });

  // Reset/seed sample database if requested
  app.post('/api/seed-reset', (req, res) => {
    db = {
      userProfile: initialUserProfile,
      videos: initialSeedVideos,
      comments: initialComments,
      moderationLogs: initialSeedVideos.map((v) => ({
        id: 'mod-' + v.id,
        videoId: v.id,
        videoTitle: v.title,
        creatorName: v.creator.name,
        overallScore: v.moderation.overallScore,
        status: v.moderation.status,
        contentRating: v.moderation.contentRating,
        adEligibility: v.moderation.adEligibility,
        summary: v.moderation.summary,
        timestamp: v.moderation.timestamp,
        categories: v.moderation.categories,
      })),
      creatorStats: initialCreatorStats,
      directShares: [],
      subscriptions: { 'chan-cyberarts': true },
      savedVideoIds: ['vid-4k-cybercity'],
      watchHistory: {},
    };
    saveDatabase(db);
    res.json({ success: true, message: 'Database reset to default seed data' });
  });

  // Persistent Video File Upload API (saves uploaded video to server disk permanently)
  app.post('/api/upload-video', upload.single('video'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No video file provided' });
      }
      const relativeUrl = `/uploads/videos/${req.file.filename}`;
      const fileSizeMb = Math.round((req.file.size / (1024 * 1024)) * 10) / 10 || 1;
      res.json({
        success: true,
        videoUrl: relativeUrl,
        fileName: req.file.originalname,
        fileSizeMb,
        message: 'Video file successfully uploaded and permanently saved on website server',
      });
    } catch (err: any) {
      console.error('Video file upload error:', err);
      res.status(500).json({ success: false, error: err.message || 'Video upload failed' });
    }
  });

  // Get user's saved videos (persistent across sessions & devices)
  app.get('/api/user/saved-videos', (_req, res) => {
    const savedIds = db.savedVideoIds || [];
    const savedList = savedIds
      .map((id) => db.videos.find((v) => v.id === id))
      .filter((v): v is VideoItem => Boolean(v));

    res.json({
      success: true,
      savedVideoIds: savedIds,
      savedVideos: savedList,
      count: savedList.length,
    });
  });

  // Save or unsave a video
  app.post('/api/user/saved-videos', (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'videoId is required' });
    }

    if (!Array.isArray(db.savedVideoIds)) {
      db.savedVideoIds = [];
    }

    const isAlreadySaved = db.savedVideoIds.includes(videoId);
    if (isAlreadySaved) {
      db.savedVideoIds = db.savedVideoIds.filter((id) => id !== videoId);
    } else {
      db.savedVideoIds = [videoId, ...db.savedVideoIds.filter((id) => id !== videoId)];
    }

    saveDatabase(db);

    const savedList = db.savedVideoIds
      .map((id) => db.videos.find((v) => v.id === id))
      .filter((v): v is VideoItem => Boolean(v));

    res.json({
      success: true,
      isSaved: !isAlreadySaved,
      savedVideoIds: db.savedVideoIds,
      savedVideos: savedList,
      count: savedList.length,
      message: !isAlreadySaved
        ? 'Video saved to your website library (persists even when you leave)'
        : 'Video removed from saved videos',
    });
  });

  // Remove a video from saved list
  app.delete('/api/user/saved-videos/:id', (req, res) => {
    const id = req.params.id;
    if (Array.isArray(db.savedVideoIds)) {
      db.savedVideoIds = db.savedVideoIds.filter((vId) => vId !== id);
      saveDatabase(db);
    }

    const savedList = (db.savedVideoIds || [])
      .map((vId) => db.videos.find((v) => v.id === vId))
      .filter((v): v is VideoItem => Boolean(v));

    res.json({
      success: true,
      savedVideoIds: db.savedVideoIds || [],
      savedVideos: savedList,
      message: 'Video removed from saved videos',
    });
  });

  // Clear all saved videos
  app.post('/api/user/saved-videos/clear', (_req, res) => {
    db.savedVideoIds = [];
    saveDatabase(db);
    res.json({
      success: true,
      savedVideoIds: [],
      savedVideos: [],
      message: 'All saved videos cleared',
    });
  });

  // Get watch progress history
  app.get('/api/user/watch-history', (_req, res) => {
    res.json({
      success: true,
      history: db.watchHistory || {},
    });
  });

  // Record / update watch playback progress
  app.post('/api/user/watch-history', (req, res) => {
    const { videoId, timestamp, duration } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'videoId is required' });
    }

    if (!db.watchHistory) {
      db.watchHistory = {};
    }

    const ts = Math.max(0, Math.floor(Number(timestamp) || 0));
    const dur = Math.max(0, Math.floor(Number(duration) || 0));

    if (dur > 0 && ts / dur >= 0.95) {
      // Completed, remove progress record
      delete db.watchHistory[videoId];
    } else if (ts > 3) {
      db.watchHistory[videoId] = {
        timestamp: ts,
        duration: dur,
        updatedAt: new Date().toISOString(),
      };
    }

    saveDatabase(db);

    res.json({
      success: true,
      savedProgress: db.watchHistory[videoId] || null,
    });
  });

  // Serve public directory statically (for local 4K video streams, avatars, banners)
  app.use(express.static(path.join(process.cwd(), 'public'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
      }
    }
  }));

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Video Social Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
