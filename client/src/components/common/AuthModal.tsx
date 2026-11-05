import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccess('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must contain at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match.');
        return;
      }
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const signedInUser = mode === 'login'
        ? await api.login(normalizedEmail, password)
        : await api.register(name.trim(), normalizedEmail, password, confirmPassword);

      cyberAudio.playSuccess();
      setSuccess(mode === 'register' ? 'Account created successfully. Welcome to CareerPilot X!' : 'Signed in successfully.');
      onSuccess(signedInUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020611]/85 backdrop-blur-md p-4">
      <button aria-label="Close sign in dialog" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#273244] bg-[#080F1C] shadow-[0_30px_100px_rgba(0,0,0,.6)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-20 rounded-xl border border-[#273244] bg-[#101A2A] p-2 text-[#A8B0BC] transition hover:text-white"
        >
          <X size={17} />
        </button>

        <div className="grid md:grid-cols-[.9fr_1.1fr]">
          <div className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#10234B] via-[#0B1730] to-[#080F1C] p-9 md:flex">
            <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="mb-12 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-400/15 text-blue-200">
                  <Sparkles size={19} />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">CareerPilot <span className="text-blue-300">X</span></span>
              </div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200">
                <CheckCircle2 size={13} /> Your placement journey
              </div>
              <h2 className="max-w-sm text-4xl font-bold leading-[1.12] tracking-tight text-white">
                Build skills.<br />Practice daily.<br /><span className="text-blue-300">Get placement ready.</span>
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
                One space for learning, DSA, projects, resume improvement and interview preparation.
              </p>
            </div>
            <div className="relative grid grid-cols-3 gap-2">
              {[
                ['01', 'Learn'],
                ['02', 'Practice'],
                ['03', 'Prepare'],
              ].map(([number, label]) => (
                <div key={number} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="font-mono text-[10px] text-blue-300">{number}</div>
                  <div className="mt-1 text-xs font-semibold text-white">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 pt-16 sm:p-9 sm:pt-16">
            <div className="mb-7">
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-300">Welcome to CareerPilot X</div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-[#8D9AAF]">
                {mode === 'login' ? 'Continue your placement preparation journey.' : 'Start building your placement-ready profile.'}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl border border-[#273244] bg-[#0B1422] p-1">
              <button type="button" onClick={() => switchMode('login')} className={`rounded-lg py-2.5 text-xs font-semibold transition ${mode === 'login' ? 'bg-[#245BFF] text-white shadow-lg' : 'text-[#8D9AAF] hover:text-white'}`}>
                Sign In
              </button>
              <button type="button" onClick={() => switchMode('register')} className={`rounded-lg py-2.5 text-xs font-semibold transition ${mode === 'register' ? 'bg-[#245BFF] text-white shadow-lg' : 'text-[#8D9AAF] hover:text-white'}`}>
                Create Account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <label className="block space-y-2">
                  <span className="text-xs font-medium text-[#C5CDDA]">Full Name</span>
                  <span className="relative block">
                    <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7F98]" />
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required placeholder="Enter your full name" className="w-full rounded-xl border border-[#273244] bg-[#0B1422] py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#65738A] focus:border-blue-500" />
                  </span>
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-xs font-medium text-[#C5CDDA]">Email Address</span>
                <span className="relative block">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7F98]" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="you@example.com" className="w-full rounded-xl border border-[#273244] bg-[#0B1422] py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#65738A] focus:border-blue-500" />
                </span>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium text-[#C5CDDA]">Password</span>
                <span className="relative block">
                  <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7F98]" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : undefined} placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} className="w-full rounded-xl border border-[#273244] bg-[#0B1422] py-3.5 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-[#65738A] focus:border-blue-500" />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71819A] hover:text-white">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>

              {mode === 'register' && (
                <label className="block space-y-2">
                  <span className="text-xs font-medium text-[#C5CDDA]">Confirm Password</span>
                  <span className="relative block">
                    <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7F98]" />
                    <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required placeholder="Re-enter your password" className="w-full rounded-xl border border-[#273244] bg-[#0B1422] py-3.5 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-[#65738A] focus:border-blue-500" />
                    <button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71819A] hover:text-white">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>
              )}

              {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs leading-5 text-rose-300">{error}</div>}
              {success && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">{success}</div>}

              <button type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#245BFF] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(36,91,255,.25)] transition hover:bg-[#3769ff] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-5 text-[#66758D]">
              {mode === 'register' ? 'Your password is securely hashed before it is stored.' : 'Your account session is protected with JWT authentication.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
