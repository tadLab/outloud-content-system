import { TovBlockedPhrase } from '@/types';

export interface TovCheckIssue {
  phrase: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TovCheckResult {
  score: number;
  issues: TovCheckIssue[];
}

export function checkTov(
  content: string,
  account: string,
  blockedPhrases: TovBlockedPhrase[]
): TovCheckResult {
  if (!content.trim()) {
    return { score: 100, issues: [] };
  }

  const issues: TovCheckIssue[] = [];
  const lowerContent = content.toLowerCase();
  let score = 100;

  // Check blocked phrases
  for (const bp of blockedPhrases) {
    if (!bp.appliesTo.includes(account.toLowerCase())) continue;
    if (lowerContent.includes(bp.phrase.toLowerCase())) {
      issues.push({
        phrase: bp.phrase,
        suggestion: bp.suggestion,
        severity: bp.severity,
      });
      switch (bp.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 8;
          break;
        case 'info':
          score -= 3;
          break;
      }
    }
  }

  // Bonus heuristics
  // Multiple consecutive emojis (detect surrogate pairs used by emojis)
  const emojiRegex = /(?:[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]){2,}/g;
  if (emojiRegex.test(content)) {
    issues.push({
      phrase: 'Multiple consecutive emojis',
      suggestion: 'Use one emoji or none. Let words do the work.',
      severity: 'warning',
    });
    score -= 8;
  }

  // Excessive exclamation marks
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount >= 3) {
    issues.push({
      phrase: `${exclamationCount} exclamation marks`,
      suggestion: 'Reduce exclamation marks. Calm confidence doesn\'t need them.',
      severity: 'warning',
    });
    score -= 5;
  }

  // Very long sentences (over 40 words)
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const longSentences = sentences.filter((s) => s.trim().split(/\s+/).length > 40);
  if (longSentences.length > 0) {
    issues.push({
      phrase: `${longSentences.length} long sentence(s)`,
      suggestion: 'Break long sentences into shorter, punchier ones.',
      severity: 'info',
    });
    score -= 3;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
  };
}
