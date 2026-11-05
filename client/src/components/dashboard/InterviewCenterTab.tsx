import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, BrainCircuit, CheckCircle2, Mic, MicOff, RotateCcw, Sparkles, Volume2, VolumeX, Gamepad2 } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { AIInterviewGameTab } from './AIInterviewGameTab';

interface InterviewCenterTabProps { user: User; }
type InterviewMode = 'technical' | 'hr' | 'project';
type SessionStep = 'setup' | 'question' | 'followup' | 'results';
interface InterviewQuestion {
  id: string;
  mode: InterviewMode;
  role: string;
  topic: string;
  question: string;
  idealAnswer: string;
  followUpPrompt?: string;
  suggestedPoints: string[];
  source?: 'local-practice' | 'gemini' | 'openai';
}
interface Evaluation {
  score: number;
  confidenceScore: number;
  breakdown: { technical: number; communication: number; architecture: number };
  strengths: string[];
  improvements: string[];
  feedback: string;
  followUpQuestion?: string;
}

const INTERVIEW_OPTIONS = [
  { value: 'Python Developer', label: 'Python' },
  { value: 'Java Developer', label: 'Java' },
  { value: 'Frontend Developer', label: 'Frontend' },
  { value: 'Backend Developer', label: 'Backend' },
  { value: 'Full Stack Developer', label: 'Full Stack' },
  { value: 'Data Structures and Algorithms', label: 'DSA' },
  { value: 'HR and Behavioural Interview', label: 'HR' },
  { value: 'Project Discussion', label: 'My Project' },
];

export const InterviewCenterTab: React.FC<InterviewCenterTabProps> = ({ user }) => {
  const [modeTab, setModeTab] = useState<'practice' | 'arena'>('practice');
  const [selectedType, setSelectedType] = useState('Python Developer');
  const [step, setStep] = useState<SessionStep>('setup');
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [firstEvaluation, setFirstEvaluation] = useState<Evaluation | null>(null);
  const [finalEvaluation, setFinalEvaluation] = useState<Evaluation | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<any>(null);
  const answerTargetRef = useRef<'main' | 'followup'>('main');

  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results || []).map((result: any) => result[0]?.transcript || '').join(' ').trim();
      if (!transcript) return;
      if (answerTargetRef.current === 'followup') setFollowUpAnswer((previous) => `${previous}${previous ? ' ' : ''}${transcript}`);
      else setAnswer((previous) => `${previous}${previous ? ' ' : ''}${transcript}`);
    };
    recognition.onerror = (event: any) => {
      setRecording(false);
      setVoiceError(event?.error === 'not-allowed' ? 'Please allow microphone access in your browser.' : 'Voice input stopped. You can type your answer instead.');
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch { /* already stopped */ } };
  }, []);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = (text: string) => {
    if (!voiceMode || !('speechSynthesis' in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceAnswer = (target: 'main' | 'followup') => {
    setVoiceError('');
    if (!recognitionRef.current) {
      setVoiceError('Voice input is not supported in this browser. Please use Chrome or type your answer.');
      return;
    }
    try {
      answerTargetRef.current = target;
      recognitionRef.current.start();
      setRecording(true);
    } catch {
      setVoiceError('Microphone is already active. Stop it before recording again.');
    }
  };

  const stopVoiceAnswer = () => {
    try { recognitionRef.current?.stop(); } catch { /* no active recording */ }
    setRecording(false);
  };

  const startInterview = async () => {
    setLoadingQuestion(true); setError(''); setFinalEvaluation(null); setFirstEvaluation(null); setAnswer(''); setFollowUpAnswer(''); setFollowUpQuestion(''); setShowSampleAnswer(false); stopSpeaking();
    const mode: InterviewMode = selectedType.startsWith('HR') ? 'hr' : selectedType === 'Project Discussion' ? 'project' : 'technical';
    try {
      const generated = await api.generateInterviewQuestion(mode, selectedType, user.experienceLevel || 'beginner');
      setQuestion(generated as InterviewQuestion);
      setStep('question');
      speak(generated.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the interview. Please try again.');
    } finally { setLoadingQuestion(false); }
  };

  const completeInterview = (primary: Evaluation, followup?: Evaluation) => {
    const avg = (a: number, b?: number) => Math.round(b === undefined ? a : (a + b) / 2);
    const combined: Evaluation = {
      score: avg(primary.score, followup?.score),
      confidenceScore: avg(primary.confidenceScore, followup?.confidenceScore),
      breakdown: {
        technical: avg(primary.breakdown.technical, followup?.breakdown.technical),
        communication: avg(primary.breakdown.communication, followup?.breakdown.communication),
        architecture: avg(primary.breakdown.architecture, followup?.breakdown.architecture),
      },
      strengths: [...primary.strengths, ...(followup?.strengths || [])].slice(0, 6),
      improvements: [...primary.improvements, ...(followup?.improvements || [])].slice(0, 6),
      feedback: [primary.feedback, followup?.feedback].filter(Boolean).join('\n\nFollow-up feedback: '),
    };
    setFinalEvaluation(combined);
    setStep('results');
    speak(`Your interview score is ${combined.score} out of 100. ${combined.feedback}`);
  };

  const submitMainAnswer = async () => {
    if (!question || !answer.trim()) return;
    stopVoiceAnswer(); stopSpeaking(); setEvaluating(true); setError('');
    try {
      const result = await api.evaluateInterviewAnswer(question, answer.trim()) as Evaluation;
      setFirstEvaluation(result);
      const relevantFollowUp = (result.followUpQuestion || '').trim();
      if (relevantFollowUp) {
        setFollowUpQuestion(relevantFollowUp);
        setStep('followup');
        speak(relevantFollowUp);
      } else {
        completeInterview(result);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Your answer could not be evaluated.'); }
    finally { setEvaluating(false); }
  };

  const submitFollowUp = async () => {
    if (!question || !firstEvaluation || !followUpQuestion || !followUpAnswer.trim()) return;
    stopVoiceAnswer(); stopSpeaking(); setEvaluating(true); setError('');
    try {
      const result = await api.evaluateInterviewAnswer({ ...question, question: followUpQuestion }, followUpAnswer.trim()) as Evaluation;
      completeInterview(firstEvaluation, result);
    } catch (err) { setError(err instanceof Error ? err.message : 'Your follow-up answer could not be evaluated.'); }
    finally { setEvaluating(false); }
  };

  const resetSession = () => {
    stopVoiceAnswer(); stopSpeaking(); setStep('setup'); setQuestion(null); setAnswer(''); setFollowUpAnswer(''); setFollowUpQuestion(''); setFirstEvaluation(null); setFinalEvaluation(null); setError(''); setVoiceError(''); setShowSampleAnswer(false);
  };

  const VoiceButton = ({ target }: { target: 'main' | 'followup' }) => (
    <button type="button" onClick={() => recording ? stopVoiceAnswer() : startVoiceAnswer(target)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${recording && answerTargetRef.current === target ? 'border-rose-500/50 bg-rose-500/10 text-rose-200' : 'border-[#273244] bg-[#0B1422] text-[#A8B0BC] hover:text-white'}`}>
      {recording && answerTargetRef.current === target ? <MicOff size={15} /> : <Mic size={15} />}{recording && answerTargetRef.current === target ? 'Stop recording' : 'Answer with voice'}
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fadeIn">
      <div className="border-b border-[#273244] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA7FF]">
              <BrainCircuit size={15} /> Interview Center
            </div>
            <h1 className="mt-2 text-3xl font-bold text-white">Interactive Technical & Behavioral Interviews</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A8B0BC]">
              Choose 1-on-1 voice & text rehearsal with dynamic AI follow-ups, or jump into the rapid-fire live interview game arena.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080B10] border border-[#273244] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setModeTab('practice')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                modeTab === 'practice'
                  ? 'bg-[#245BFF] text-white shadow-md'
                  : 'text-[#A8B0BC] hover:text-white'
              }`}
            >
              <BrainCircuit size={14} />
              <span>1-on-1 Practice</span>
            </button>
            <button
              type="button"
              onClick={() => setModeTab('arena')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                modeTab === 'arena'
                  ? 'bg-[#245BFF] text-white shadow-md'
                  : 'text-[#A8B0BC] hover:text-white'
              }`}
            >
              <Gamepad2 size={14} />
              <span>Interview Game Arena</span>
            </button>
          </div>
        </div>
      </div>

      {modeTab === 'arena' ? (
        <AIInterviewGameTab />
      ) : (
        <>
          {step === 'setup' && (
        <section className="rounded-2xl border border-[#273244] bg-[#101722] p-5 md:p-7">
          <h2 className="text-lg font-bold text-white">What interview do you want to practise?</h2>
          <p className="mt-1 text-xs text-[#71819A]">Choose one area to start your session.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{INTERVIEW_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setSelectedType(option.value)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${selectedType === option.value ? 'border-[#245BFF] bg-[#245BFF]/15 text-white' : 'border-[#273244] bg-[#0B1422] text-[#A8B0BC] hover:border-[#536078] hover:text-white'}`}>{option.label}</button>)}</div>
          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-[#273244] bg-[#0B1422] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-white">Voice conversation</p><p className="mt-1 text-xs leading-5 text-[#71819A]">When enabled, you can speak your answer and the AI will read its next question aloud. Browser microphone and speech support are required.</p></div><button type="button" onClick={() => { setVoiceMode((value) => !value); setVoiceError(''); }} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${voiceMode ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-[#273244] bg-[#101722] text-[#A8B0BC]'}`}>{voiceMode ? <Volume2 size={15} /> : <VolumeX size={15} />}{voiceMode ? 'Voice enabled' : 'Text only'}</button></div>
          <button type="button" onClick={() => void startInterview()} disabled={loadingQuestion} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#245BFF] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50">{loadingQuestion ? 'Preparing your question...' : 'Start interview'} <ArrowRight size={16} /></button>
        </section>
      )}

      {(step === 'question' || step === 'followup') && question && (
        <section className="space-y-5 rounded-2xl border border-[#273244] bg-[#101722] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-widest text-[#8DA7FF]">{selectedType} interview</span><h2 className="mt-1 text-xl font-bold text-white">{step === 'question' ? 'Question 1' : 'Follow-up question'}</h2></div><div className="flex items-center gap-2"><button type="button" onClick={() => speak(step === 'question' ? question.question : followUpQuestion)} title="Read question aloud" className="rounded-lg border border-[#273244] p-2 text-[#A8B0BC] hover:text-white"><Volume2 size={16} /></button><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${voiceMode ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-700/40 text-slate-300'}`}>{voiceMode ? 'Voice mode' : 'Text mode'}</span></div></div>
          <div className="rounded-xl border border-blue-500/20 bg-[#0B1422] p-5"><p className="text-xs font-semibold text-blue-300">{step === 'question' ? question.topic : 'Based on your previous answer'}</p><p className="mt-3 text-base leading-7 text-white">{step === 'question' ? question.question : followUpQuestion}</p></div>
          <div><label className="mb-2 block text-xs font-semibold text-[#A8B0BC]" htmlFor="interview-answer">Your answer</label><textarea id="interview-answer" rows={6} value={step === 'question' ? answer : followUpAnswer} onChange={(e) => step === 'question' ? setAnswer(e.target.value) : setFollowUpAnswer(e.target.value)} placeholder="Explain your answer clearly. You can include your approach and an example..." className="w-full rounded-xl border border-[#273244] bg-[#080B10] p-4 text-sm leading-6 text-white outline-none placeholder:text-[#66758A] focus:border-[#245BFF]" /></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><VoiceButton target={step === 'question' ? 'main' : 'followup'} /><button type="button" onClick={() => step === 'question' ? void submitMainAnswer() : void submitFollowUp()} disabled={evaluating || !(step === 'question' ? answer.trim() : followUpAnswer.trim())} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#245BFF] px-5 py-3 text-xs font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">{evaluating ? 'Reviewing your answer...' : step === 'question' ? 'Submit answer' : 'Submit follow-up'} <ArrowRight size={15} /></button></div>
          {recording && <p className="text-xs text-rose-300">Listening... speak clearly, then select Stop recording.</p>}
          {voiceError && <p className="text-xs text-amber-300">{voiceError}</p>}
          {error && <div role="alert" className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error}</div>}
          <button type="button" onClick={resetSession} className="text-xs text-[#71819A] hover:text-white">Cancel interview</button>
        </section>
      )}

      {step === 'results' && question && finalEvaluation && (
        <section className="space-y-5 rounded-2xl border border-[#273244] bg-[#101722] p-5 md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Interview complete</span><h2 className="mt-1 text-2xl font-bold text-white">Your interview results</h2><p className="mt-1 text-xs text-[#71819A]">{selectedType} · {question.topic}</p></div><div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10"><span className="text-3xl font-bold text-emerald-200">{finalEvaluation.score}</span><span className="text-[10px] text-emerald-300">out of 100</span></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: 'Technical', value: finalEvaluation.breakdown.technical }, { label: 'Communication', value: finalEvaluation.breakdown.communication }, { label: 'Problem solving', value: finalEvaluation.breakdown.architecture }, { label: 'Confidence signals', value: finalEvaluation.confidenceScore }].map((item) => <div key={item.label} className="rounded-xl border border-[#273244] bg-[#0B1422] p-3"><p className="text-[11px] text-[#71819A]">{item.label}</p><p className="mt-1 text-xl font-bold text-white">{item.value}%</p></div>)}</div>
          <div className="rounded-xl border border-[#273244] bg-[#0B1422] p-4"><h3 className="text-sm font-bold text-white">AI feedback on your answer</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#C5CDDA]">{finalEvaluation.feedback}</p></div>
          <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"><h3 className="text-sm font-bold text-emerald-200">What you did well</h3><ul className="mt-3 space-y-2">{finalEvaluation.strengths.map((item, index) => <li key={index} className="flex gap-2 text-xs leading-5 text-[#C5CDDA]"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul></div><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"><h3 className="text-sm font-bold text-amber-200">What to improve next</h3><ul className="mt-3 space-y-2">{finalEvaluation.improvements.map((item, index) => <li key={index} className="flex gap-2 text-xs leading-5 text-[#C5CDDA]"><ArrowRight size={14} className="mt-0.5 shrink-0 text-amber-300" />{item}</li>)}</ul></div></div>
          <div className="rounded-xl border border-[#273244] bg-[#0B1422] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-white">Example of a stronger answer</h3><button type="button" onClick={() => setShowSampleAnswer((value) => !value)} className="text-xs font-semibold text-[#8DA7FF]">{showSampleAnswer ? 'Hide' : 'Show example'}</button></div>{showSampleAnswer && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#C5CDDA]">{question.idealAnswer}</p>}<p className="mt-2 text-[11px] text-[#71819A]">Use this as a learning example. Keep your own answer truthful to your experience.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={resetSession} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#245BFF] px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"><RotateCcw size={15} /> Start another interview</button><button type="button" onClick={() => { setStep('setup'); setFinalEvaluation(null); }} className="rounded-xl border border-[#273244] px-5 py-3 text-sm font-semibold text-[#A8B0BC] hover:text-white">Change interview type</button></div>
        </section>
      )}
      </>
      )}
      <p className="text-center text-[11px] leading-5 text-[#71819A]">AI feedback is a practice aid. Scores are estimates based on the answer provided, not a hiring decision. Voice features depend on browser support and microphone permission.</p>
    </div>
  );
};
