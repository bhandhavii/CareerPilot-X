import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Target,
  Clock,
  Sparkles,
  Building,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface ProfileSettingsTabProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aiden',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nala',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Orion',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberPilot',
];

const AVAILABLE_SKILLS = [
  'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Redis', 'WebSockets',
  'GraphQL', 'Tailwind CSS', 'Git', 'Data Structures & Algorithms',
];

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  user,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || AVATAR_PRESETS[0]);
  const [track, setTrack] = useState<'frontend' | 'backend' | 'fullstack'>(user.track);
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel || 'beginner');
  const [dailyStudyHours, setDailyStudyHours] = useState(user.dailyStudyHours || 2);
  const [careerGoal, setCareerGoal] = useState(user.careerGoal || 'Full-Stack Developer');
  const [dreamCompany, setDreamCompany] = useState(user.dreamCompany || '');
  const [skills, setSkills] = useState<string[]>(user.currentSkills || []);
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(user.codechefReminderEnabled));
  const [reminderTime, setReminderTime] = useState(user.codechefReminderTime || '18:00');
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderStatus, setReminderStatus] = useState('');
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  useEffect(() => {
    api.getReminderPreference().then((settings) => {
      setReminderEnabled(settings.enabled);
      setReminderTime(settings.time || '18:00');
      setSmtpConfigured(settings.smtpConfigured);
    }).catch(() => setReminderStatus('Could not load reminder settings.'));
  }, []);

  const saveReminder = async (enabled = reminderEnabled, time = reminderTime) => {
    setReminderSaving(true);
    setReminderStatus('');
    try {
      const saved = await api.saveReminderPreference(enabled, time);
      setReminderEnabled(saved.enabled);
      setReminderTime(saved.time);
      setSmtpConfigured(saved.smtpConfigured);
      setReminderStatus(saved.enabled
        ? saved.smtpConfigured
          ? `Wednesday reminder enabled for ${saved.email} at ${saved.time} IST.`
          : 'Preference saved. Add SMTP settings in server/.env to send the email reminder.'
        : 'Wednesday reminder disabled.');
      cyberAudio.playSuccess();
    } catch (error: any) {
      setReminderStatus(error.message || 'Could not save reminder settings.');
    } finally {
      setReminderSaving(false);
    }
  };

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const toggleSkill = (sk: string) => {
    cyberAudio.playClick();
    setSkills((prev) => (prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk]));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updated = await api.updateProfile({
        name,
        avatarUrl,
        track,
        experienceLevel,
        dailyStudyHours,
        careerGoal,
        dreamCompany,
        currentSkills: skills,
      });
      cyberAudio.playSuccess();
      onUserUpdated(updated);
      setMessage({ text: 'Profile preferences and avatar successfully saved to database.' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Could not update profile.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters long.', isError: true });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordMsg({ text: res.message || 'Password successfully changed!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      cyberAudio.playSuccess();
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to update password.', isError: true });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#B7FF32]" /> Account Preferences & Security
        </div>
        <h1 className="text-3xl md:text-4xl font-serif-title text-white">
          Profile & Settings<span className="text-[#B7FF32]">.</span>
        </h1>
        <p className="text-sm text-[#A8B0BC] mt-1.5 leading-relaxed">
          Manage your career target, avatar, track alignment, study commitments, and credentials.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          message.isError
            ? 'bg-rose-950/40 border-rose-500 text-rose-200'
            : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
        }`}>
          {message.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <section className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">CodeChef Starters Reminder</h3>
            <p className="mt-1 text-xs text-[#8D9AAF]">Get a reminder every Wednesday at your selected time. Time zone: India (IST).</p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#C5CDDA]">
            <input
              type="checkbox"
              checked={reminderEnabled}
              disabled={reminderSaving}
              onChange={(event) => {
                const enabled = event.target.checked;
                setReminderEnabled(enabled);
                void saveReminder(enabled, reminderTime);
              }}
              className="h-4 w-4 accent-[#245BFF]"
            />
            {reminderEnabled ? 'Enabled' : 'Disabled'}
          </label>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC]">Reminder time</span>
            <input
              type="time"
              value={reminderTime}
              disabled={reminderSaving}
              onChange={(event) => setReminderTime(event.target.value)}
              className="rounded-xl border border-[#273244] bg-[#080B10] px-4 py-2.5 text-sm text-white outline-none focus:border-[#245BFF]"
            />
          </label>
          <button
            type="button"
            disabled={reminderSaving}
            onClick={() => void saveReminder(reminderEnabled, reminderTime)}
            className="rounded-xl border border-[#245BFF]/40 bg-[#245BFF]/15 px-4 py-2.5 text-xs font-semibold text-[#AFC1FF] hover:bg-[#245BFF]/25 disabled:opacity-50"
          >
            {reminderSaving ? 'Saving…' : 'Save Reminder'}
          </button>
          <span className="text-[11px] text-[#71819A]">Sent to: {user.email}</span>
        </div>
        {!smtpConfigured && reminderEnabled && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
            Your reminder preference is saved, but email delivery is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM to server/.env. This is only for reminders; signup and login do not need SMTP.
          </p>
        )}
        {reminderStatus && <p className="text-xs text-[#8DA7FF]">{reminderStatus}</p>}
      </section>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-8 space-y-6">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 pb-2 border-b border-[#273244]">
          <UserIcon size={16} className="text-[#245BFF]" /> Personal & Career Details
        </h3>

        {/* Avatar Selection */}
        <div>
          <span className="text-xs text-[#A8B0BC] font-medium block mb-3 flex items-center gap-1.5">
            <Camera size={14} /> Profile Picture / Avatar
          </span>
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-2xl border-2 border-[#245BFF] bg-[#0c121d] p-1 object-cover shadow-lg"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-xl border p-1 transition overflow-hidden bg-[#0c121d] ${
                      avatarUrl === preset
                        ? 'border-[#245BFF] ring-2 ring-[#245BFF]/40'
                        : 'border-[#273244] hover:border-[#536078]'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste custom image/avatar URL"
                className="w-full px-3 py-1.5 rounded-lg bg-[#080B10] border border-[#273244] text-[11px] text-[#A8B0BC] outline-none focus:border-[#245BFF]"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {/* Full Name */}
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC] font-medium flex items-center gap-1.5">
              <UserIcon size={14} /> Full Name
            </span>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            />
          </label>

          {/* Email (Readonly) */}
          <label className="block space-y-2">
            <span className="text-xs text-[#727E8F] font-medium flex items-center gap-1.5">
              <Mail size={14} /> Email Address (Account Identifier)
            </span>
            <input
              disabled
              type="email"
              value={user.email}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10]/50 border border-[#1D2533] text-xs text-[#727E8F] cursor-not-allowed outline-none font-mono"
            />
          </label>

          {/* Target Track */}
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC] font-medium flex items-center gap-1.5">
              <Target size={14} /> Selected Career Track
            </span>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as 'frontend' | 'backend' | 'fullstack')}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            >
              <option value="frontend">Frontend Engineering</option>
              <option value="backend">Backend Architecture</option>
              <option value="fullstack">Full-Stack Development</option>
            </select>
          </label>

          {/* Experience Level */}
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC] font-medium">Experience Level</span>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            >
              <option value="beginner">Beginner (Building Foundations)</option>
              <option value="intermediate">Intermediate (Building Full Apps)</option>
              <option value="advanced">Advanced (Enterprise / Staff Level)</option>
            </select>
          </label>

          {/* Daily Study Commitment */}
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC] font-medium flex items-center gap-1.5">
              <Clock size={14} /> Daily Study Commitment
            </span>
            <select
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            >
              <option value={1}>1 hour per day</option>
              <option value={2}>2 hours per day</option>
              <option value={3}>3 hours per day</option>
              <option value={4}>4+ hours per day (Intensive Sprint)</option>
            </select>
          </label>

          {/* Dream Company */}
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC] font-medium flex items-center gap-1.5">
              <Building size={14} /> Target Dream Company
            </span>
            <input
              type="text"
              value={dreamCompany}
              onChange={(e) => setDreamCompany(e.target.value)}
              placeholder="e.g. Google, Stripe, Microsoft"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            />
          </label>
        </div>

        {/* Skills Tag Cloud */}
        <div className="space-y-3 pt-2">
          <div className="text-xs text-[#A8B0BC] font-medium">
            Verified Competencies & Known Tech
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((sk) => {
              const has = skills.includes(sk);
              return (
                <button
                  type="button"
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
                    has
                      ? 'bg-[#245BFF]/25 border border-[#245BFF] text-white shadow-glow-blue'
                      : 'bg-[#080B10] border border-[#273244] text-[#727E8F] hover:border-[#536078]'
                  }`}
                >
                  {has && <Check size={12} className="text-[#B7FF32]" />}
                  <span>{sk}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Profile */}
        <div className="pt-4 border-t border-[#273244] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="cyber-button-primary px-7 py-3 rounded-xl text-xs font-bold text-white shadow-glow-blue flex items-center gap-2 disabled:opacity-40"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* CHANGE PASSWORD SECTION */}
      <form onSubmit={handlePasswordChange} className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#273244]">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <KeyRound size={16} className="text-[#245BFF]" /> Security & Password Management
          </h3>
          <span className="text-[11px] text-[#727E8F]">Requires current password verification</span>
        </div>

        {passwordMsg && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            passwordMsg.isError
              ? 'bg-rose-950/40 border-rose-500 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
          }`}>
            {passwordMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC]">Current Password</span>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC]">New Password</span>
            <input
              required
              minLength={8}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 chars"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs text-[#A8B0BC]">Confirm New Password</span>
            <input
              required
              minLength={8}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#151E2B] border border-[#273244] text-[#A8B0BC] hover:text-white hover:border-[#245BFF] transition flex items-center gap-2 disabled:opacity-40"
          >
            <KeyRound size={14} />
            <span>{passwordLoading ? 'Updating Password…' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
