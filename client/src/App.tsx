import { useState, useEffect } from 'react';
import { Scene3D } from './components/3d/Scene3D';
import { Navbar } from './components/common/Navbar';
import { StageOverlays } from './components/landing/StageOverlays';
import { LandingSections } from './components/landing/LandingSections';
import { AICoachDrawer } from './components/common/AICoachDrawer';
import { AuthModal } from './components/common/AuthModal';
import { DashboardView, DashboardTab } from './components/dashboard/DashboardView';
import { OnboardingModal } from './components/common/OnboardingModal';
import { CareerTrack, User } from './types';
import { api } from './services/api';
import { cyberAudio } from './utils/audio';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>('fullstack');

  // Modals & Drawers state
  const [dashboardInitialTab, setDashboardInitialTab] = useState<DashboardTab>('overview');
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Audio and 3D Settings
  const [isMuted, setIsMuted] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Permanent Dark Theme Engine for CareerPilot X
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    try {
      localStorage.removeItem('cpx_theme');
    } catch {}
  }, []);

  // Load user from storage and sync application routes
  useEffect(() => {
    // A browser refresh should return to the public 3D landing page, even if
    // the previous signed-in session left #dashboard in the address bar.
    if (window.location.hash.toLowerCase() === '#dashboard') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const syncRouteFromHash = () => {
      const hash = window.location.hash.toLowerCase();
      const existing = api.getCurrentUser();

      if (existing) {
        setUser(existing);
        setSelectedTrack(existing.track);
      }

      if (hash === '#login') {
        setAuthModalMode('login');
      } else if (hash === '#register') {
        setAuthModalMode('register');
      } else if (hash === '#onboarding') {
        if (existing) {
          setIsOnboardingOpen(true);
          setIsDashboardOpen(false);
        } else {
          setAuthModalMode('login');
        }
      } else if (hash === '#dashboard') {
        if (existing) {
          if (!existing.onboardingComplete) {
            setIsOnboardingOpen(true);
            setIsDashboardOpen(false);
          } else {
            setIsDashboardOpen(true);
            setIsOnboardingOpen(false);
          }
        } else {
          // Protected route guard: prompt login
          setAuthModalMode('login');
          setIsDashboardOpen(false);
        }
      } else if (hash === '#landing' || hash === '#home' || hash === '') {
        // Opening the site (including a refresh at the root URL) must show
        // the 3D landing page. A signed-in user can enter the dashboard from
        // the navbar; #dashboard remains the explicit dashboard route.
        setIsDashboardOpen(false);
        setIsOnboardingOpen(false);
        if (hash === '#home') window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    syncRouteFromHash();
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, []);

  useEffect(() => {
    const open = () => {
      window.location.hash = 'onboarding';
      setIsOnboardingOpen(true);
    };
    window.addEventListener('cpx:open-onboarding', open);
    return () => window.removeEventListener('cpx:open-onboarding', open);
  }, []);

  // Coordinated scroll tracking: maps window.scrollY to continuous 3D progress (0.0 to 1.0)
  useEffect(() => {
    const handleScroll = () => {
      // The 3D stage experience occupies roughly the first 7 viewports (7 * window.innerHeight)
      const maxStageScroll = window.innerHeight * 7;
      const currentY = window.scrollY;
      const progress = Math.max(0, Math.min(1, currentY / maxStageScroll));
      setScrollProgress(progress);

      // Determine discrete stage index (0 to 7)
      const stageIdx = Math.min(7, Math.floor(progress * 8));
      setCurrentStage(stageIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigateToStage = (stageIndex: number) => {
    cyberAudio.playClick();
    const targetY = (stageIndex / 7) * (window.innerHeight * 7);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setIsDashboardOpen(false);
    setIsOnboardingOpen(false);
    setDashboardInitialTab('overview');
    window.location.hash = '';
  };

  const openDashboardModule = (tab: DashboardTab) => {
    setDashboardInitialTab(tab);
    if (user) {
      if (user.onboardingComplete) {
        window.location.hash = 'dashboard';
        setIsDashboardOpen(true);
        setIsOnboardingOpen(false);
      } else {
        window.location.hash = 'onboarding';
        setIsOnboardingOpen(true);
        setIsDashboardOpen(false);
      }
    } else {
      window.location.hash = 'login';
      setAuthModalMode('login');
    }
  };

  const STAGE_NAMES = [
    '01 Home',
    '02 AI Assistant',
    '03 My Learning',
    '04 Career Roadmap',
    '05 DSA Arena',
    '06 Project Mentor',
    '07 Interview Center',
    '08 Placement Preparation',
  ];

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* 3D REAL-TIME WEBGL SCENE */}
      <Scene3D
        scrollProgress={scrollProgress}
        currentStage={currentStage}
        onRobotClick={() => setIsAICoachOpen(true)}
        isReducedMotion={isReducedMotion}
      />

      {/* TOP NAVBAR (Only rendered on landing page, never inside dashboard) */}
      {!isDashboardOpen && (
        <Navbar
          user={user}
          onOpenAuth={(mode) => {
            window.location.hash = mode;
            setAuthModalMode(mode);
          }}
          onLogout={handleLogout}
          onOpenDashboard={() => openDashboardModule('overview')}
          onOpenAICoach={() => setIsAICoachOpen(true)}
          isDashboardOpen={isDashboardOpen}
          onToggleDashboard={() => {
            if (user) {
              if (!isDashboardOpen) openDashboardModule('overview');
              else { window.location.hash = 'landing'; setIsDashboardOpen(false); }
            } else { window.location.hash = 'login'; setAuthModalMode('login'); }
          }}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(cyberAudio.toggleMute())}
          isReducedMotion={isReducedMotion}
          onToggleReducedMotion={() => setIsReducedMotion(!isReducedMotion)}
          onNavigateSection={(id) => {
            if (id === 'hero') handleNavigateToStage(0);
            else {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* 3D STAGE WAYPOINT PILLS (Right Side HUD) */}
      {!isDashboardOpen && (
        <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2.5 pointer-events-auto">
          {STAGE_NAMES.map((name, idx) => {
            const isActive = currentStage === idx;
            return (
              <button
                key={idx}
                onClick={() => handleNavigateToStage(idx)}
                className={`group flex items-center justify-end gap-3 text-right transition-all ${
                  isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
              >
                <span
                  className={`text-[10px] font-mono tracking-wider transition-all duration-300 hidden group-hover:inline-block ${
                    isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {name}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-7 bg-gradient-to-r from-cyan-400 to-indigo-400 shadow-glow-cyan'
                      : 'bg-slate-600 group-hover:bg-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </aside>
      )}

      {/* 3D SCROLL-SYNCHRONIZED STAGE OVERLAYS (STAGES 0 TO 7) */}
      <StageOverlays
        currentStage={currentStage}
        scrollProgress={scrollProgress}
        onSelectTrack={setSelectedTrack}
        selectedTrack={selectedTrack}
        onOpenModule={(module) => openDashboardModule(module)}
        onOpenAssessment={() => openDashboardModule('learning')}
        onOpenCodingArena={() => openDashboardModule('dsa')}
        onOpenInterview={() => openDashboardModule('interview')}
        onOpenResume={() => openDashboardModule('resume')}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onNavigateToStage={handleNavigateToStage}
      />

      {/* COMPLETE LANDING PAGE SECTIONS */}
      <LandingSections
        onOpenAssessment={() => openDashboardModule('learning')}
        onOpenCodingArena={() => openDashboardModule('dsa')}
        onOpenInterview={() => openDashboardModule('interview')}
        onOpenResume={() => openDashboardModule('resume')}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onSelectTrack={setSelectedTrack}
        onOpenModule={(module) => openDashboardModule(module)}
      />

      {/* AI assistant drawer and authentication */}
      <AICoachDrawer
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        user={user}
      />

      <AuthModal
        isOpen={authModalMode !== null}
        initialMode={authModalMode || 'login'}
        onClose={() => {
          if (window.location.hash === '#login' || window.location.hash === '#register') {
            window.location.hash = '';
          }
          setAuthModalMode(null);
        }}
        onSuccess={(newUser) => {
          setUser(newUser);
          setSelectedTrack(newUser.track);
          if (newUser.onboardingComplete) {
            window.location.hash = 'dashboard';
            setIsDashboardOpen(true);
            setIsOnboardingOpen(false);
          } else {
            window.location.hash = 'onboarding';
            setIsOnboardingOpen(true);
            setIsDashboardOpen(false);
          }
        }}
      />

      {isOnboardingOpen && user && (
        <OnboardingModal
          user={user}
          onComplete={(updatedUser) => {
            setUser(updatedUser);
            setSelectedTrack(updatedUser.track);
            setIsOnboardingOpen(false);
            window.location.hash = 'dashboard';
            setIsDashboardOpen(true);
          }}
        />
      )}

      {/* AUTHENTICATED APPLICATION DASHBOARD */}
      {isDashboardOpen && user && (
        <DashboardView
          user={user}
          onClose={() => {
            window.location.hash = 'landing';
            setIsDashboardOpen(false);
          }}
          initialTab={dashboardInitialTab}
        />
      )}
    </div>
  );
}
