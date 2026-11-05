import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Zap,
  FileText,
  Target,
  BriefcaseBusiness,
  BookOpen,
  User as UserIcon,
  Settings,
  Menu,
  X,
  Trophy,
  Flame,
  LogOut,
  Compass,
  Sparkles,
  Binary,
  Bell,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Bot,
} from 'lucide-react';
import { User, LearningProgress, DailyMission, RoadmapMilestone, ProjectItem } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

// 10 Primary Core Modules of the AI Career Operating System
import { OverviewTab } from './OverviewTab';
import { MyLearningView } from './MyLearningView';
import { DSArenaTab } from './DSArenaTab';
import { DailyMissionsTab } from './DailyMissionsTab';
import { InterviewCenterTab } from './InterviewCenterTab';
import { AICoachTab } from './AICoachTab';
import { ResumeIntelligenceTab } from './ResumeIntelligenceTab';
import { ProjectMentorTab } from './ProjectMentorTab';
import { PlacementReadinessTab } from './PlacementReadinessTab';
import { ProgressAchievementsTab } from './ProgressAchievementsTab';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import { RoadmapTab } from './RoadmapTab';
import { DailyMockTestTab } from './DailyMockTestTab';
import { AICoachDrawer } from '../common/AICoachDrawer';

interface DashboardViewProps {
  user: User;
  onClose: () => void;
  initialTab?: DashboardTab;
  onOpenAssessment?: () => void;
  onOpenCodingArena?: () => void;
  onOpenInterview?: () => void;
  onOpenResume?: () => void;
  onOpenAICoach?: () => void;
}

export type DashboardTab =
  | 'overview'
  | 'learning'
  | 'dsa'
  | 'missions'
  | 'interview'
  | 'assistant'
  | 'mock_test'
  | 'coach'
  | 'resume'
  | 'project_mentor'
  | 'readiness'
  | 'achievements'
  | 'roadmap'
  | 'profile'
  | 'settings';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'mission' | 'streak' | 'interview' | 'dsa';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user: initialUser,
  onClose,
  initialTab = 'overview',
}) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [isFloatingCoachOpen, setIsFloatingCoachOpen] = useState(false);

  // Notifications Dropdown State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Real data state
  const [progress, setProgress] = useState<LearningProgress>({
    completedLessons: [],
    quizScores: {},
    totalStudyMinutes: 0,
  });
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>([]);

  useEffect(() => {
    const loadDashboardState = async () => {
      try {
        const [userProgress, dailyMissions, userRoadmap] = await Promise.all([
          api.getLearningProgress(),
          api.getDailyMissions(),
          api.getRoadmap(),
        ]);
        setProgress(userProgress);
        setMissions(dailyMissions);
        setRoadmap(userRoadmap);
      } catch (err) {
        console.error('Failed to load dashboard state:', err);
      }
    };
    loadDashboardState();
  }, [currentUser]);

  const changeTab = (next: DashboardTab, lessonId?: string) => {
    cyberAudio.playClick();
    setTab(next);
    setSelectedLessonId(lessonId);
    setMobileNav(false);
    setShowNotifications(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const markAllNotificationsRead = () => {
    cyberAudio.playClick();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // The exact 11 primary modules from the CareerPilot X specification.
  const NAVIGATION_ITEMS: { id: DashboardTab; label: string; icon: React.ReactNode; isFlagship?: boolean }[] = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { id: 'learning', label: 'My Learning', icon: <BookOpen size={17} /> },
    { id: 'missions', label: 'Daily Missions', icon: <Zap size={17} /> },
    { id: 'dsa', label: 'DSA Arena', icon: <Binary size={17} /> },
    { id: 'resume', label: 'Resume Analyzer', icon: <FileText size={17} /> },
    { id: 'interview', label: 'Interview Center', icon: <BrainCircuit size={17} />, isFlagship: true },
    { id: 'mock_test', label: 'Daily Mock Test', icon: <ClipboardCheck size={17} /> },
    { id: 'project_mentor', label: 'Project Mentor', icon: <BriefcaseBusiness size={17} /> },
    { id: 'readiness', label: 'Placement Readiness', icon: <Target size={17} /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Bot size={17} /> },
    { id: 'profile', label: 'Profile & Settings', icon: <UserIcon size={17} /> },
  ];

  return (
    <div className="dashboard-font-consistent fixed inset-0 z-40 bg-[#080B10] text-[#F5F7FA] flex overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileNav && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:relative z-50 md:z-auto inset-y-0 left-0 w-[270px] bg-[#0B111A] border-r border-[#273244] flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-[74px] px-6 flex items-center gap-3 border-b border-[#273244]">
          <div className="w-9 h-9 rounded-xl bg-[#245BFF] flex items-center justify-center shadow-glow-blue">
            <Compass size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-white">
              CareerPilot <i className="font-serif-title text-[#B7FF32]">X</i>
            </div>
            <div className="text-[10px] text-[#727E8F] tracking-[.14em] uppercase font-mono">
              AI Career Operating System
            </div>
          </div>
          <button
            className="ml-auto md:hidden text-[#A8B0BC] hover:text-white"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* 10 Primary Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 pt-2 pb-1.5 text-[10px] uppercase tracking-[.18em] text-[#727E8F] font-mono">
            Core Modules (11)
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition relative ${
                  isActive
                    ? 'bg-[#245BFF]/15 text-white border border-[#245BFF]/40 shadow-glow-blue'
                    : item.isFlagship
                    ? 'text-white bg-[#0e1625] border border-[#245BFF]/30 hover:border-[#245BFF]'
                    : 'text-[#A8B0BC] hover:text-white hover:bg-[#151E2B]'
                }`}
              >
                <span className={isActive || item.isFlagship ? 'text-[#8DA7FF]' : 'text-[#727E8F]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>

                {item.isFlagship && !isActive && (
                  <span className="ml-auto text-[9px] font-mono uppercase bg-[#245BFF]/30 text-[#8DA7FF] px-1.5 py-0.2 rounded font-bold">
                    Core
                  </span>
                )}

                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B7FF32]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer User Box */}
        <div className="p-4 border-t border-[#273244] bg-[#080B10]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeTab('profile')}
              title="Open Profile"
              className="w-9 h-9 rounded-xl bg-[#1C2B45] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden border border-[#273244] hover:border-[#245BFF] transition"
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser.name.slice(0, 1).toUpperCase()
              )}
            </button>
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => changeTab('profile')}>
              <div className="text-xs font-semibold text-white truncate hover:text-[#8DA7FF] transition">{currentUser.name}</div>
              <div className="text-[10px] text-[#727E8F] truncate capitalize">{currentUser.careerGoal || `${currentUser.track} Track`}</div>
            </div>
            <button
              title="Return to landing page"
              onClick={onClose}
              className="text-[#727E8F] hover:text-white p-1 rounded-lg transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="min-w-0 flex-1 overflow-y-auto flex flex-col">
        {/* Sleek Top Header */}
        <header className="sticky top-0 z-30 h-[74px] px-5 md:px-9 flex items-center justify-between bg-[#080B10]/90 backdrop-blur-xl border-b border-[#273244] shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#A8B0BC] hover:text-white p-1"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="text-xs text-[#727E8F] font-mono">
                CareerPilot X <span className="mx-1">/</span> {currentUser.careerGoal || currentUser.track.toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-white">
                {NAVIGATION_ITEMS.find((n) => n.id === tab)?.label || (tab === 'roadmap' ? 'Career Roadmap' : tab === 'profile' ? 'Profile' : 'Settings')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  setShowNotifications((v) => !v);
                }}
                title="Notifications"
                className="relative p-2 rounded-xl border border-[#273244] bg-[#101722] text-[#A8B0BC] hover:text-white transition"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#245BFF] text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0E1624] border border-[#273244] shadow-2xl p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#273244]">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell size={14} className="text-[#8DA7FF]" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#245BFF]/30 text-[#8DA7FF] font-mono">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-[#8DA7FF] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#1D2736] max-h-80 overflow-y-auto mt-2">
                    {notifications.length ? notifications.map((n) => (
                      <div key={n.id} className={`py-3 px-1 transition ${n.read ? 'opacity-70' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between text-xs font-semibold text-white"><span>{n.title}</span><span className="text-[10px] text-[#727E8F] font-mono">{n.time}</span></div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#A8B0BC]">{n.message}</p>
                      </div>
                    )) : <p className="py-5 text-center text-xs text-[#71819A]">No notifications yet. Your updates will appear here.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* XP Pill */}
            <div className="flex items-center gap-2 text-xs text-[#A8B0BC] border border-[#273244] bg-[#101722] rounded-full px-3 py-1.5 font-mono">
              <Trophy size={14} className="text-[#B7FF32]" />
              <span>{(currentUser.xp || 0).toLocaleString()} XP</span>
            </div>

            {/* Streak Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#A8B0BC] border border-[#273244] bg-[#101722] rounded-full px-3 py-1.5 font-mono">
              <Flame size={14} className="text-orange-400" />
              <span>{currentUser.streakDays || 0}d Streak</span>
            </div>

            {/* Flagship Interview CTA */}
            <button
              onClick={() => changeTab('interview')}
              className="rounded-full bg-[#245BFF] hover:bg-[#3769ff] px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-2 shadow-glow-blue transition"
            >
              <BrainCircuit size={14} className="text-[#B7FF32]" />
              <span className="hidden sm:inline">Interview Center</span>
              <span className="sm:hidden">Interview</span>
            </button>
          </div>
        </header>

        {/* Tab Content Rendering Container */}
        <div className="max-w-[1300px] w-full mx-auto p-5 md:p-8 flex-1">
          {tab === 'overview' && (
            <OverviewTab
              user={currentUser}
              missions={missions}
              onOpenInterview={() => changeTab('interview')}
              onOpenMissions={() => changeTab('missions')}
              onOpenResume={() => changeTab('resume')}
              onOpenReadiness={() => changeTab('readiness')}
              onOpenProjectMentor={() => changeTab('project_mentor')}
              onOpenLearning={() => changeTab('learning')}
              onOpenAICoach={() => changeTab('assistant')}
              onOpenDSA={() => changeTab('dsa')}
            />
          )}

          {tab === 'learning' && (
            <MyLearningView
              initialTrack={currentUser.track}
              initialLessonId={selectedLessonId}
              onLessonCompleted={async () => {
                const refreshed = await api.getLearningProgress();
                setProgress(refreshed);
                const u = api.getCurrentUser();
                if (u) setCurrentUser(u);
              }}
            />
          )}

          {tab === 'dsa' && (
            <DSArenaTab
              user={currentUser}
              onUserUpdated={handleUserUpdated}
            />
          )}

          {tab === 'missions' && (
            <DailyMissionsTab
              user={currentUser}
              onOpenLearning={(lessonId) => changeTab('learning', lessonId)}
              onOpenCodingArena={() => changeTab('dsa')}
              onOpenInterview={() => changeTab('interview')}
              onOpenProjects={() => changeTab('project_mentor')}
              onUserUpdated={handleUserUpdated}
            />
          )}

          {tab === 'interview' && (
            <InterviewCenterTab user={currentUser} />
          )}

          {tab === 'mock_test' && (
            <DailyMockTestTab />
          )}

          {(tab === 'assistant' || tab === 'coach') && (
            <AICoachTab user={currentUser} />
          )}

          {tab === 'resume' && (
            <ResumeIntelligenceTab user={currentUser} />
          )}

          {tab === 'project_mentor' && (
            <ProjectMentorTab user={currentUser} />
          )}

          {tab === 'readiness' && (
            <PlacementReadinessTab
              user={currentUser}
              onOpenInterview={() => changeTab('interview')}
              onOpenCodingArena={() => changeTab('dsa')}
              onOpenResume={() => changeTab('resume')}
              onOpenProjects={() => changeTab('project_mentor')}
            />
          )}

          {tab === 'achievements' && (
            <ProgressAchievementsTab user={currentUser} />
          )}

          {tab === 'roadmap' && (
            <RoadmapTab
              user={currentUser}
              roadmap={roadmap}
              onOpenLearning={(lessonId) => changeTab('learning', lessonId)}
              onToggleStatus={async () => {
                const refreshed = await api.getRoadmap();
                setRoadmap(refreshed);
              }}
            />
          )}

          {(tab === 'profile' || tab === 'settings') && (
            <ProfileSettingsTab
              user={currentUser}
              onUserUpdated={handleUserUpdated}
            />
          )}
        </div>

        {/* Global Footer */}
        <footer className="h-12 border-t border-[#273244] px-6 md:px-9 flex items-center justify-between text-[11px] text-[#536078] shrink-0 font-mono">
          <span>CareerPilot X · Your placement preparation companion</span>
          <span className="hidden sm:inline">Learn · Practice · Prepare</span>
        </footer>
      </main>

      {/* Floating Ask AI Button - Opens AI Companion Drawer Over Current Page */}
      <button
        type="button"
        onClick={() => {
          cyberAudio.playClick();
          setIsFloatingCoachOpen(true);
        }}
        title="Open Floating AI Career Assistant"
        className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full border border-[#245BFF]/50 bg-[#245BFF] hover:bg-[#386dff] px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-blue-950/80 transition hover:-translate-y-1 active:scale-95"
      >
        <Bot size={17} /> <span>Ask AI</span>
      </button>

      {/* Floating AI Companion Drawer */}
      <AICoachDrawer
        isOpen={isFloatingCoachOpen}
        onClose={() => setIsFloatingCoachOpen(false)}
        user={currentUser}
      />
    </div>
  );
};
