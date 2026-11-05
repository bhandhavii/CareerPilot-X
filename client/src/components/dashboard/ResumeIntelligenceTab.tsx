import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  TrendingUp,
  Building,
  Target,
  ArrowRight,
  History,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import { User, CareerTrack, ResumeAnalysisResult } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface ResumeIntelligenceTabProps {
  user: User;
}

interface ResumeVersion {
  id: string;
  name: string;
  date: string;
  role: string;
  company: string;
  score: number;
  content: string;
}


export const ResumeIntelligenceTab: React.FC<ResumeIntelligenceTabProps> = ({ user }) => {
  const [targetRole, setTargetRole] = useState(user.careerGoal || 'Full Stack Developer');
  const [targetCompany, setTargetCompany] = useState(user.dreamCompany || '');
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // File Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Versions state
  const [savedVersions, setSavedVersions] = useState<ResumeVersion[]>(() => {
    try { return JSON.parse(localStorage.getItem('cpx_resume_versions') || '[]'); } catch { return []; }
  });
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  // Active Analysis State
  const [atsAnalysis, setAtsAnalysis] = useState<{
    overallScore: number;
    roleMatchPercentage: number;
    wordCount: number;
    matchedSkills: string[];
    missingSkills: string[];
    strengths: string[];
    improvements: string[];
    bulletSuggestions: string[];
    sectionAudit: ResumeAnalysisResult['sectionAudit'];
    summary: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadError(null);
    setIsUploading(true);
    cyberAudio.playClick();

    try {
      const targetTrack = targetRole.toLowerCase().includes('java') ? 'java' : targetRole.toLowerCase().includes('python') ? 'python' : targetRole.toLowerCase().includes('frontend') ? 'frontend' : targetRole.toLowerCase().includes('backend') ? 'backend' : 'fullstack';
      const result = await api.uploadResume(file, targetTrack);
      setUploadedFileName(file.name);
      const extractedText = (result as ResumeAnalysisResult & { extractedText?: string }).extractedText;
      if (extractedText) setResumeText(extractedText);
      else if ((result as any).extractedTextSnippet) setResumeText((result as any).extractedTextSnippet);

      setAtsAnalysis({
        overallScore: result.score,
        roleMatchPercentage: result.roleMatchPercentage,
        wordCount: result.wordCount,
        matchedSkills: result.detectedSkills,
        missingSkills: result.missingKeywords,
        strengths: result.strengths,
        improvements: result.improvements,
        bulletSuggestions: result.xyzBulletSuggestions,
        sectionAudit: result.sectionAudit,
        summary: result.summary,
      });
      cyberAudio.playSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      setUploadError('Upload a PDF/DOCX/TXT resume or paste your actual resume text before analysis.');
      return;
    }
    setIsAnalyzing(true);
    setUploadError(null);
    cyberAudio.playClick();
    try {
      const result = await api.analyzeResumeText(resumeText, targetRole.toLowerCase().includes('java') ? 'java' : targetRole.toLowerCase().includes('python') ? 'python' : targetRole.toLowerCase().includes('frontend') ? 'frontend' : targetRole.toLowerCase().includes('backend') ? 'backend' : 'fullstack');
      setAtsAnalysis({
        overallScore: result.score,
        roleMatchPercentage: result.roleMatchPercentage,
        wordCount: result.wordCount,
        matchedSkills: result.detectedSkills,
        missingSkills: result.missingKeywords,
        strengths: result.strengths,
        improvements: result.improvements,
        bulletSuggestions: result.xyzBulletSuggestions,
        sectionAudit: result.sectionAudit,
        summary: result.summary,
      });
      cyberAudio.playSuccess();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Resume analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveVersion = () => {
    const versionNum = savedVersions.length + 1;
    const newVersion: ResumeVersion = {
      id: `ver-${Date.now()}`,
      name: `v1.${versionNum - 1} — ${targetRole} (${targetCompany})`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      role: targetRole,
      company: targetCompany,
      score: atsAnalysis?.overallScore ?? 0,
      content: resumeText,
    };
    const updated = [newVersion, ...savedVersions];
    setSavedVersions(updated);
    setSelectedVersionId(newVersion.id);
    localStorage.setItem('cpx_resume_versions', JSON.stringify(updated));
    cyberAudio.playSuccess();
  };

  const handleLoadVersion = (ver: ResumeVersion) => {
    setSelectedVersionId(ver.id);
    setResumeText(ver.content);
    setTargetRole(ver.role);
    setTargetCompany(ver.company);
    cyberAudio.playClick();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#273244]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF32] animate-pulse" />
            <span className="text-xs uppercase tracking-[.2em] text-[#8DA7FF] font-semibold">
              CAREER INTELLIGENCE MODULE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white mt-1">
            Resume Intelligence & ATS Engine<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-xs md:text-sm text-[#A8B0BC] mt-1">
            Tailor your resume to bypass ATS filters, eliminate missing skills, and format high-impact measurable bullets.
          </p>
        </div>

        {/* ATS Score Display Pill */}
        {atsAnalysis && (
          <div className="p-4 rounded-2xl border border-[#245BFF]/30 bg-[#0c121d] flex items-center gap-4 shrink-0 shadow-lg shadow-[#245BFF]/10">
            <div className="w-12 h-12 rounded-xl bg-[#245BFF]/20 text-[#8DA7FF] flex items-center justify-center font-bold text-xl font-mono">
              {atsAnalysis.overallScore}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>ATS Match Score</span>
                <span className="text-[10px] text-[#B7FF32] font-mono">/100</span>
              </div>
              <div className="text-xs text-[#8d9ab0] mt-0.5">
                Target: {targetCompany} • {targetRole}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Role & Dream Company Calibration Bar */}
      <div className="p-5 rounded-2xl border border-[#273244] bg-[#101722] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B0BC] mb-1.5 flex items-center gap-1.5">
            <Target size={14} className="text-[#245BFF]" /> Target Job Role
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
          >
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>Java Developer</option>
            <option>Data Analyst</option>
            <option>AI Engineer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A8B0BC] mb-1.5 flex items-center gap-1.5">
            <Building size={14} className="text-[#B7FF32]" /> Target Company Benchmark
          </label>
          <select
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
          >
            <option value="">Select company (optional)</option>
            <option>Google</option>
            <option>Amazon</option>
            <option>Microsoft</option>
            <option>TCS</option>
            <option>Infosys</option>
            <option>Stripe</option>
            <option>Uber</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAnalyzeResume}
            disabled={isAnalyzing}
            className="w-full cyber-button-primary rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Scanning ATS Filters…' : 'Scan & Re-Calculate ATS'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio: Left (Editor & Versions) vs Right (ATS Analysis Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resume Text / Markdown Studio (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* File Upload Dropzone */}
          <div className="rounded-2xl border border-dashed border-[#245BFF]/40 bg-[#0E1624] p-4 text-center">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#245BFF]/15 text-[#8DA7FF] flex items-center justify-center shrink-0">
                  <Upload size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {uploadedFileName ? `File: ${uploadedFileName}` : 'Upload Resume File'}
                  </div>
                  <div className="text-[11px] text-[#727E8F]">
                    {isUploading
                      ? 'Extracting text and evaluating ATS filters...'
                      : 'Accepts PDF, DOCX, and TXT (Max 5MB)'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#3769ff] text-white flex items-center gap-1.5 shadow-glow-blue transition disabled:opacity-50 shrink-0"
              >
                <Upload size={13} />
                <span>{isUploading ? 'Parsing...' : 'Upload File'}</span>
              </button>
            </div>

            {uploadError && (
              <div className="mt-2 text-[11px] text-rose-400 font-mono text-left">
                Error: {uploadError}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#273244]">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText size={15} className="text-[#245BFF]" /> Resume Content (Markdown / Text)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-[#A8B0BC] hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-[#B7FF32]" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveVersion}
                  disabled={!atsAnalysis || !resumeText.trim()}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#245BFF]/20 text-[#8DA7FF] hover:bg-[#245BFF] hover:text-white transition flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Save Version</span>
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume markdown or plain text here..."
              className="w-full p-4 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-[#DCE2EE] leading-relaxed font-mono outline-none focus:border-[#245BFF] resize-y"
            />
          </div>

          {/* Saved Resume Versions List */}
          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white pb-2 border-b border-[#273244]">
              <span className="flex items-center gap-1.5">
                <History size={14} className="text-[#8DA7FF]" /> Resume Versions ({savedVersions.length})
              </span>
              <span className="text-[10px] font-mono text-[#727E8F]">Version History</span>
            </div>

            <div className="space-y-2">
              {savedVersions.map((v) => {
                const isSelected = selectedVersionId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleLoadVersion(v)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#245BFF] bg-[#162133]'
                        : 'border-[#273244] bg-[#080B10] hover:border-[#3d4d68]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{v.name}</div>
                      <div className="text-[10px] text-[#727E8F] mt-0.5">{v.date} • {v.company}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#B7FF32]">{v.score}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: analysis derived from the uploaded or pasted resume */}
        <div className="lg:col-span-6 space-y-5">
          {atsAnalysis ? (
            <>
              <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Analysis summary</h3>
                <p className="text-xs leading-6 text-[#A8B0BC]">{atsAnalysis.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#273244] bg-[#080B10] p-3"><div className="text-[10px] text-[#8D9AAF]">Estimated ATS compatibility</div><div className="mt-1 text-2xl font-bold text-white">{atsAnalysis.overallScore}/100</div></div>
                  <div className="rounded-xl border border-[#273244] bg-[#080B10] p-3"><div className="text-[10px] text-[#8D9AAF]">Role keyword match</div><div className="mt-1 text-2xl font-bold text-white">{atsAnalysis.roleMatchPercentage}%</div></div>
                </div>
                <div className="text-[11px] text-[#71819A]">Parsed word count: {atsAnalysis.wordCount}</div>
              </div>

              <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Resume section audit</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(atsAnalysis.sectionAudit).map(([section, present]) => (
                    <div key={section} className="flex items-center gap-2 rounded-lg border border-[#273244] bg-[#080B10] p-2.5 text-xs">
                      {present ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-300" />}
                      <span className="capitalize text-[#C5CDDA]">{section.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="ml-auto text-[10px] text-[#71819A]">{present ? 'Found' : 'Missing'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Detected skills</h3>
                <div className="flex flex-wrap gap-2">
                  {atsAnalysis.matchedSkills.length ? atsAnalysis.matchedSkills.map((skill) => <span key={skill} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">{skill}</span>) : <p className="text-xs text-[#8D9AAF]">No catalog skills were detected in the supplied resume.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/25 bg-[#16120e] p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-200"><AlertCircle size={15} /> Missing role keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {atsAnalysis.missingSkills.length ? atsAnalysis.missingSkills.map((skill) => <span key={skill} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-100">{skill}</span>) : <p className="text-xs text-[#A8B0BC]">No missing keywords from the selected role catalogue.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Strengths and improvements</h3>
                <div><div className="mb-2 text-xs font-semibold text-emerald-300">Strengths found</div>{atsAnalysis.strengths.map((item, index) => <p key={index} className="mb-2 text-xs leading-5 text-[#A8B0BC]">• {item}</p>)}</div>
                <div><div className="mb-2 text-xs font-semibold text-amber-200">Suggestions</div>{atsAnalysis.improvements.map((item, index) => <p key={index} className="mb-2 text-xs leading-5 text-[#A8B0BC]">• {item}</p>)}</div>
              </div>

              <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Example bullet improvements</h3>
                <p className="text-[11px] text-[#71819A]">These are rewrite templates generated from the resume analysis. Verify every metric and claim before using them.</p>
                {atsAnalysis.bulletSuggestions.map((suggestion, index) => (
                  <div key={index} className="rounded-xl border border-[#273244] bg-[#080B10] p-3 text-xs leading-5 text-[#C5CDDA]">{suggestion}</div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#273244] bg-[#101722] p-8 text-center">
              <FileText size={28} className="text-[#8DA7FF]" />
              <h3 className="mt-3 text-sm font-bold text-white">Your resume analysis will appear here</h3>
              <p className="mt-2 max-w-sm text-xs leading-5 text-[#8D9AAF]">Upload your own PDF/DOCX/TXT resume or paste its text. CareerPilot X will analyze the actual content; no sample score is shown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
