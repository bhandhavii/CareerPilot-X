import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      id: 'm-1',
      role: 'assistant',
      text: `Greetings! I am your CareerPilot X AI companion. I've calibrated your profile for the ${
        (user?.track || 'fullstack').toUpperCase()
      } track. How can I accelerate your career journey today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    cyberAudio.playClick();
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }));
      const reply = await api.sendCoachMessage(query, historyPayload, user);
      cyberAudio.playSuccess();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    'What should I learn next in my roadmap?',
    'How do I prepare for system design rounds?',
    'How can I improve my resume ATS match?',
    'Explain React Fiber concurrency simply',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md h-full cyber-glass-glow border-l border-blue-500/40 shadow-glow-blue flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-500 p-[1.5px] shadow-glow-blue">
              <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Career Companion</span>
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-blue-400 font-mono">
                ONLINE • {user?.track ? `${user.track.toUpperCase()} ADVISOR` : 'CAREER OS'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-glow-blue'
                    : 'cyber-glass border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{m.text}</p>
                <span className="block text-[9px] text-slate-400 mt-1 text-right font-mono">
                  {m.time}
                </span>
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <UserIcon className="w-4 h-4 text-blue-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <Bot className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Synthesizing career advice...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" /> Suggested Prompts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-blue-300 hover:border-blue-500/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for roadmap, mock interview, or code tips..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-400 transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="cyber-button-primary p-2.5 rounded-xl text-white shadow-glow-blue disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
