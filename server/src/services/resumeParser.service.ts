import { inflateSync, inflateRawSync } from 'node:zlib';

export interface ResumeAnalysisResult {
  score: number;
  wordCount: number;
  detectedSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  xyzBulletSuggestions: string[];
  sectionAudit: {
    contactInfo: boolean;
    summary: boolean;
    experience: boolean;
    skills: boolean;
    projects: boolean;
    education: boolean;
  };
  roleMatchPercentage: number;
  summary: string;
}

export class ResumeParserService {
  private roleKeywords: Record<string, string[]> = {
    frontend: [
      'react', 'typescript', 'javascript', 'html5', 'css3', 'tailwind', 'next.js',
      'redux', 'zustand', 'webpack', 'vite', 'responsive design', 'rest api',
      'performance optimization', 'testing', 'jest', 'cypress', 'web accessibility', 'a11y'
    ],
    backend: [
      'node.js', 'express', 'typescript', 'rest api', 'graphql', 'mongodb', 'postgresql',
      'mysql', 'redis', 'docker', 'microservices', 'jwt', 'oauth', 'caching',
      'system design', 'aws', 'kubernetes', 'ci/cd', 'event-driven'
    ],
    fullstack: [
      'react', 'node.js', 'typescript', 'javascript', 'express', 'mongodb', 'postgresql',
      'rest api', 'docker', 'ci/cd', 'git', 'state management', 'tailwindcss',
      'authentication', 'unit testing', 'cloud deployment', 'system architecture'
    ],
    java: [
      'java', 'spring boot', 'spring security', 'hibernate', 'jpa', 'microservices',
      'maven', 'gradle', 'junit', 'rest api', 'multithreading', 'concurrency',
      'jvm', 'postgresql', 'kafka', 'docker', 'design patterns'
    ],
    python: [
      'python', 'fastapi', 'django', 'flask', 'pandas', 'numpy', 'sqlalchemy',
      'asyncio', 'rest api', 'pytest', 'celery', 'docker', 'git', 'postgresql',
      'data structures', 'algorithms'
    ],
  };

  private decodePdfLiteral(value: string): string {
    return value
      .replace(/\\([nrtbf()\\])/g, (_match, char: string) => {
        const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
        return map[char] ?? char;
      })
      .replace(/\\([0-7]{1,3})/g, (_match, octal: string) => String.fromCharCode(parseInt(octal, 8)));
  }

  private extractPdfText(buffer: Buffer): string {
    const raw = buffer.toString('latin1');
    const streams: string[] = [];
    const streamPattern = /<<(.*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;
    while ((match = streamPattern.exec(raw)) !== null) {
      const dictionary = match[1] || '';
      const streamBytes = Buffer.from(match[2] || '', 'latin1');
      try {
        if (/\/FlateDecode/.test(dictionary)) {
          try {
            streams.push(inflateSync(streamBytes).toString('latin1'));
          } catch {
            streams.push(inflateRawSync(streamBytes).toString('latin1'));
          }
        } else {
          streams.push(streamBytes.toString('latin1'));
        }
      } catch {
        // Ignore unsupported or damaged streams; continue with other text streams.
      }
    }

    const decoded: string[] = [];
    const content = streams.join('\n');
    const literalPattern = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
    while ((match = literalPattern.exec(content)) !== null) {
      const text = this.decodePdfLiteral(match[1] || '');
      if (text.trim()) decoded.push(text);
    }

    const arrayPattern = /\[([\s\S]*?)\]\s*TJ/g;
    while ((match = arrayPattern.exec(content)) !== null) {
      const pieces = match[1].match(/\(((?:\\.|[^\\)])*)\)/g) || [];
      const text = pieces.map((piece) => this.decodePdfLiteral(piece.slice(1, -1))).join('');
      if (text.trim()) decoded.push(text);
    }

    const hexPattern = /<([0-9A-Fa-f]{4,})>\s*Tj/g;
    while ((match = hexPattern.exec(content)) !== null) {
      const hex = (match[1] || '').replace(/\s/g, '');
      try {
        const bytes = Buffer.from(hex, 'hex');
        let text = bytes.toString('latin1');
        if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
          const units: number[] = [];
          for (let i = 2; i + 1 < bytes.length; i += 2) units.push(bytes.readUInt16BE(i));
          text = String.fromCharCode(...units);
        }
        if (text.trim()) decoded.push(text);
      } catch {}
    }

    return decoded.join(' ').replace(/\s+/g, ' ').trim();
  }

  private extractDocxText(buffer: Buffer): string {
    const signature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
    const eocd = buffer.lastIndexOf(signature);
    if (eocd < 0 || eocd + 22 > buffer.length) return '';

    const entryCount = buffer.readUInt16LE(eocd + 10);
    let cursor = buffer.readUInt32LE(eocd + 16);
    for (let index = 0; index < entryCount && cursor + 46 <= buffer.length; index++) {
      if (buffer.readUInt32LE(cursor) !== 0x02014b50) break;
      const method = buffer.readUInt16LE(cursor + 10);
      const compressedSize = buffer.readUInt32LE(cursor + 20);
      const nameLength = buffer.readUInt16LE(cursor + 28);
      const extraLength = buffer.readUInt16LE(cursor + 30);
      const commentLength = buffer.readUInt16LE(cursor + 32);
      const localOffset = buffer.readUInt32LE(cursor + 42);
      const fileName = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);
      if (fileName === 'word/document.xml') {
        if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== 0x04034b50) return '';
        const localNameLength = buffer.readUInt16LE(localOffset + 26);
        const localExtraLength = buffer.readUInt16LE(localOffset + 28);
        const dataStart = localOffset + 30 + localNameLength + localExtraLength;
        const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
        let xml: string;
        if (method === 8) xml = inflateRawSync(compressed).toString('utf8');
        else if (method === 0) xml = compressed.toString('utf8');
        else return '';
        return xml
          .replace(/<\/w:p>/g, '\n')
          .replace(/<w:tab[^>]*\/>/g, '\t')
          .replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, '$1')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
      }
      cursor += 46 + nameLength + extraLength + commentLength;
    }
    return '';
  }

  /**
   * Extract text from TXT, DOCX and PDF content. DOCX uses its actual document.xml
   * entry; PDFs are read from text-showing operators in decoded content streams.
   */
  public extractText(buffer: Buffer, mimetype: string, originalName: string): string {
    const filename = originalName.toLowerCase();
    if (mimetype.includes('text') || filename.endsWith('.txt') || filename.endsWith('.md')) {
      return buffer.toString('utf-8');
    }
    if (filename.endsWith('.docx') || mimetype.includes('wordprocessingml')) {
      return this.extractDocxText(buffer);
    }
    if (mimetype.includes('pdf') || filename.endsWith('.pdf')) {
      const extracted = this.extractPdfText(buffer);
      if (extracted.length > 30) return extracted;
    }
    return '';
  }

  /**
   * Complete ATS and Rubric analysis
   */
  public analyze(text: string, targetTrack: string = 'fullstack'): ResumeAnalysisResult {
    const normalizedText = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const trackKey = (targetTrack || 'fullstack').toLowerCase();
    const catalog = this.roleKeywords[trackKey] || this.roleKeywords.fullstack;

    // Detect matched keywords
    const detectedSkills: string[] = [];
    const missingKeywords: string[] = [];

    catalog.forEach((skill) => {
      // Word boundary match or substring for compound phrases
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedText) || normalizedText.includes(skill)) {
        detectedSkills.push(skill.toUpperCase());
      } else {
        missingKeywords.push(skill.toUpperCase());
      }
    });

    // Detect Sections
    const sectionAudit = {
      contactInfo: /(@|github\.com|linkedin\.com|phone|\+?\d{10})/i.test(normalizedText),
      summary: /(summary|profile|about me|objective)/i.test(normalizedText),
      experience: /(experience|work history|employment|internship|roles)/i.test(normalizedText),
      skills: /(skills|technologies|proficiencies|tech stack)/i.test(normalizedText),
      projects: /(projects|open source|portfolio|personal projects)/i.test(normalizedText),
      education: /(education|bachelor|degree|university|college|b\.tech|b\.e|master)/i.test(normalizedText),
    };

    // Action Verbs
    const actionVerbs = ['engineered', 'developed', 'architected', 'spearheaded', 'optimized', 'reduced', 'implemented', 'scaled', 'automated', 'delivered'];
    const matchedVerbs = actionVerbs.filter((v) => normalizedText.includes(v));

    // Metric / Quantification indicators
    const hasQuantifiableImpact = /(\d+%\s*(increase|decrease|reduction|improvement)|\b\d+x\b|\b\d+ms\b|\$\d+|\d+\s*users|\d+\s*requests)/i.test(normalizedText);

    // Scoring calculation
    let score = 50; // baseline
    // Skill match contribution (up to 30 points)
    const matchRatio = catalog.length > 0 ? detectedSkills.length / catalog.length : 0.5;
    score += Math.round(matchRatio * 30);

    // Section audit contribution (up to 12 points)
    const passedSections = Object.values(sectionAudit).filter(Boolean).length;
    score += Math.round((passedSections / 6) * 12);

    // Impact & action verbs contribution (up to 8 points)
    if (hasQuantifiableImpact) score += 4;
    if (matchedVerbs.length >= 3) score += 4;

    // Cap between 40 and 96
    score = Math.min(96, Math.max(40, score));

    // Strengths
    const strengths: string[] = [];
    if (detectedSkills.length > 0) {
      strengths.push(`Identified ${detectedSkills.length} critical skills for ${trackKey.toUpperCase()}: ${detectedSkills.slice(0, 4).join(', ')}.`);
    }
    if (matchedVerbs.length > 0) {
      strengths.push(`Strong active technical phrasing detected (${matchedVerbs.slice(0, 3).join(', ')}).`);
    }
    if (hasQuantifiableImpact) {
      strengths.push('Good usage of numerical metrics and performance benchmarks.');
    } else {
      strengths.push('Clean and readable resume structure parsed with high ATS fidelity.');
    }

    // Improvements
    const improvements: string[] = [];
    if (missingKeywords.length > 0) {
      improvements.push(`Incorporate high-priority keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
    }
    if (!hasQuantifiableImpact) {
      improvements.push('Rewrite experience bullets using the Google X-Y-Z formula to demonstrate measurable impact.');
    }
    if (!sectionAudit.projects) {
      improvements.push('Add a dedicated Projects section with GitHub repository links and live URLs.');
    }
    if (wordCount < 200) {
      improvements.push('Resume length is too brief. Target 350-500 words for early career, or 500-750 words for mid-level.');
    }

    // Concrete Google X-Y-Z formula recommendations
    const xyzBulletSuggestions = [
      'Accomplished [specific outcome] as measured by [a metric you can verify], by doing [the technical action you personally completed].',
      'Improved [feature, workflow or system] by [verified percentage or time], through [the implementation steps you actually performed].',
      'Delivered [project capability] for [real users or workload], using [your actual tools and engineering approach].',
    ];

    return {
      score,
      wordCount,
      detectedSkills,
      missingKeywords,
      strengths,
      improvements,
      xyzBulletSuggestions,
      sectionAudit,
      roleMatchPercentage: score,
      summary: `Your resume demonstrates an ATS match index of ${score}% for ${trackKey.toUpperCase()} roles. Adding ${missingKeywords.slice(0, 3).join(', ')} and rewriting bullet points with quantifiable metrics will significantly improve shortlisting rates.`,
    };
  }
}

export const resumeParser = new ResumeParserService();
