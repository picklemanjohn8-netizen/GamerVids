import React, { useState } from 'react';
import {
  Video,
  Search,
  Upload,
  Sparkles,
  Flame,
  DollarSign,
  ShieldCheck,
  Film,
  Menu,
  X,
  User,
  Tv,
  CheckCircle2,
  Edit3,
  AtSign,
  SlidersHorizontal,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'shorts' | 'studio' | 'moderation' | 'profile';
  onViewChange: (view: 'home' | 'shorts' | 'studio' | 'moderation' | 'profile') => void;
  onOpenUpload: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  currentUser: {
    name: string;
    handle: string;
    avatar: string;
  };
  onSwitchUser: (user: { name: string; handle: string; avatar: string }) => void;
  onOpenEditProfile: () => void;
}

const SAMPLE_USERS = [
  {
    name: 'Alex Chen (4K Studio)',
    handle: '@alexchen4k',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Marcus Vance (Creator)',
    handle: '@marcusvance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Elena Rostova (Indie Dir)',
    handle: '@elenarostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenUpload,
  searchQuery,
  onSearchChange,
  currentUser,
  onSwitchUser,
  onOpenEditProfile,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform duration-200">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-['Outfit',sans-serif] font-bold text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                  Stream4K
                </span>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-500/30">
                  4K UHD
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">Social Video & Creator Hub</span>
            </div>
          </button>
        </div>

        {/* Center Search Input */}
        <div className="flex-1 max-w-xl mx-2 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search 4K videos, shorts, creators, or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-full py-2 pl-11 pr-10 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/70 p-1 rounded-xl border border-neutral-800/60">
          <button
            onClick={() => onViewChange('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'home'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-red-400" />
            Videos & 4K
          </button>
          <button
            onClick={() => onViewChange('shorts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'shorts'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Shorts
          </button>
          <button
            onClick={() => onViewChange('studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'studio'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Monetization
          </button>
          <button
            onClick={() => onViewChange('profile')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'profile'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <User className="w-3.5 h-3.5 text-rose-400" />
            Profile & Channel
          </button>
          <button
            onClick={() => onViewChange('moderation')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'moderation'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            AI Moderation
          </button>
        </nav>

        {/* Right Actions: Upload Button & Profile Menu */}
        <div className="flex items-center gap-2.5">
          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-red-900/20 hover:shadow-red-900/40 transition-all cursor-pointer transform active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload 4K Video</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* User Account Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-900 border border-neutral-800/80 transition-colors cursor-pointer"
              title="User profile menu & customizer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-red-500/40"
              />
              <div className="text-left hidden md:block max-w-[110px] truncate">
                <div className="text-xs font-medium text-neutral-200 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-neutral-400 font-mono truncate">{currentUser.handle}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active user header card */}
                <div className="px-3 py-2.5 border-b border-neutral-800/80 bg-neutral-950/60 rounded-xl mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/50"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-red-400 font-mono font-semibold truncate">
                        {currentUser.handle}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Custom Handle Active</span>
                    </span>
                    <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 font-mono">
                      4K Creator
                    </span>
                  </div>
                </div>

                {/* Primary Profile Actions */}
                <div className="space-y-1 py-1 border-b border-neutral-800/80">
                  <button
                    onClick={() => {
                      onViewChange('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-rose-400" />
                    <span>View Channel & Profile Page</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenEditProfile();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-white bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 transition-colors cursor-pointer text-red-200"
                  >
                    <Edit3 className="w-4 h-4 text-red-400" />
                    <span>Customize Profile & Username</span>
                  </button>

                  <button
                    onClick={() => {
                      onViewChange('studio');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Creator Monetization Studio</span>
                  </button>
                </div>

                {/* Switch Profiles */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 px-3 py-1">
                    Preset Switcher
                  </div>
                  {SAMPLE_USERS.map((user) => (
                    <button
                      key={user.handle}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        currentUser.handle === user.handle
                          ? 'bg-neutral-800 text-white font-medium'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                      }`}
                    >
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                      <div className="truncate flex-1">
                        <span className="truncate block">{user.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono block">{user.handle}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {showMobileNav && (
        <div className="lg:hidden mt-3 pt-3 border-t border-neutral-800/80 space-y-2">
          <div className="px-2 pb-2">
            <input
              type="text"
              placeholder="Search 4K videos, shorts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onViewChange('home');
                setShowMobileNav(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                currentView === 'home' ? 'bg-neutral-800 text-white' : 'text-neutral-400 bg-neutral-900'
              }`}
            >
              <Film className="w-4 h-4 text-red-400" />
              Videos & 4K
            </button>
            <button
              onClick={() => {
                onViewChange('shorts');
                setShowMobileNav(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                currentView === 'shorts' ? 'bg-neutral-800 text-white' : 'text-neutral-400 bg-neutral-900'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Shorts
            </button>
            <button
              onClick={() => {
                onViewChange('profile');
                setShowMobileNav(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                currentView === 'profile' ? 'bg-neutral-800 text-white' : 'text-neutral-400 bg-neutral-900'
              }`}
            >
              <User className="w-4 h-4 text-rose-400" />
              Profile
            </button>
            <button
              onClick={() => {
                onOpenEditProfile();
                setShowMobileNav(false);
              }}
              className="p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-red-300 bg-red-950/40 border border-red-800/40"
            >
              <Edit3 className="w-4 h-4 text-red-400" />
              Edit Profile
            </button>
            <button
              onClick={() => {
                onViewChange('studio');
                setShowMobileNav(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                currentView === 'studio' ? 'bg-neutral-800 text-white' : 'text-neutral-400 bg-neutral-900'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Monetization
            </button>
            <button
              onClick={() => {
                onViewChange('moderation');
                setShowMobileNav(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                currentView === 'moderation' ? 'bg-neutral-800 text-white' : 'text-neutral-400 bg-neutral-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              AI Moderation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
