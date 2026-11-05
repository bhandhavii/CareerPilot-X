import React from 'react';
import { Volume2, VolumeX, Sparkles, User as UserIcon, LogOut, Compass, ArrowRight } from 'lucide-react';
import { User } from '../../types';
import { cyberAudio } from '../../utils/audio';

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenDashboard: () => void;
  onOpenAICoach: () => void;
  isDashboardOpen: boolean;
  onToggleDashboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenDashboard,
  onOpenAICoach,
  isDashboardOpen,
  onToggleDashboard,
  isMuted,
  onToggleMute,
  isReducedMotion,
  onToggleReducedMotion,
  onNavigateSection,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all bg-[#030712]/75 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* LOGO & BRAND */}
        <div
          onClick={() => {
            cyberAudio.playClick();
            if (isDashboardOpen) onToggleDashboard();
            if (onNavigateSection) onNavigateSection('hero');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-blue-500 to-lime-500 p-[1.5px] shadow-glow-blue transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">
              CareerPilot <span className="text-blue-400 font-serif-title italic">X</span>
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        {!isDashboardOpen && (
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-300">
            <button
              onClick={() => onNavigateSection && onNavigateSection('hero')}
              className="hover:text-blue-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigateSection && onNavigateSection('universe')}
              className="hover:text-blue-400 transition-colors"
            >
              Universe
            </button>
            <button
              onClick={() => onNavigateSection && onNavigateSection('interview-preview')}
              className="hover:text-blue-400 transition-colors"
            >
              Interviewer
            </button>
            <button
              onClick={() => onNavigateSection && onNavigateSection('roadmap')}
              className="hover:text-blue-400 transition-colors"
            >
              Roadmap
            </button>
            <button
              onClick={() => onNavigateSection && onNavigateSection('resume-preview')}
              className="hover:text-blue-400 transition-colors"
            >
              Resume AI
            </button>
            <button
              onClick={() => onNavigateSection && onNavigateSection('missions-preview')}
              className="hover:text-blue-400 transition-colors"
            >
              Daily Missions
            </button>
            <button
              onClick={() => {
                cyberAudio.playSuccess();
                onOpenAICoach();
              }}
              className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>AI Assistant</span>
            </button>
          </nav>
        )}

        {/* RIGHT ACTIONS & CONTROLS */}
        <div className="flex items-center gap-3">
          {/* Audio Synthesizer SFX Toggle */}
          <button
            onClick={() => {
              cyberAudio.playClick();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all text-xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={() => {
              cyberAudio.playClick();
              onToggleReducedMotion();
            }}
            title="Toggle 3D Camera Motion"
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all ${
              isReducedMotion
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            3D: {isReducedMotion ? 'Fixed' : 'Smooth'}
          </button>

          {/* AUTHENTICATION STATE */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onOpenDashboard();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs font-bold shadow-glow-blue"
              >
                <UserIcon className="w-3.5 h-3.5 text-lime-300" />
                <span>Dashboard</span>
                <span className="px-1.5 py-0.5 bg-blue-950/80 rounded text-[10px] font-mono text-blue-200">
                  {user.readinessScore == null ? '0 XP' : `${user.readinessScore}% Ready`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </button>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onLogout();
                }}
                title="Log Out"
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onOpenAuth('login');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                Login
              </button>
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onOpenAuth('register');
                }}
                className="cyber-button-primary px-4 py-2 rounded-xl text-xs font-bold text-white shadow-glow-blue flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
