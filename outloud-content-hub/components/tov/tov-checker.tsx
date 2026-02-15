'use client';

import { useState } from 'react';
import { useTov } from '@/hooks/use-tov';
import { checkTov, TovCheckResult } from '@/lib/tov-checker';

export function TovChecker() {
  const { blockedPhrases: tovBlockedPhrases } = useTov();
  const [account, setAccount] = useState<'Outloud' | 'Ondrej'>('Outloud');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<TovCheckResult | null>(null);

  const handleCheck = () => {
    const checkResult = checkTov(content, account, tovBlockedPhrases);
    setResult(checkResult);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const severityIcons: Record<string, string> = {
    error: '\u26D4',
    warning: '\u26A0\uFE0F',
    info: '\u2139\uFE0F',
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
        Tone of Voice Checker
      </h3>
      <p className="text-[12px] text-[var(--text-muted)] mb-4">
        Test your copy against Outloud&apos;s voice guidelines.
      </p>

      {/* Account toggle */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setAccount('Outloud')}
          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors border ${
            account === 'Outloud'
              ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
              : 'border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
          style={account === 'Outloud' ? { backgroundColor: 'rgba(232, 90, 44, 0.1)' } : undefined}
          type="button"
        >
          Outloud (Studio Voice)
        </button>
        <button
          onClick={() => setAccount('Ondrej')}
          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors border ${
            account === 'Ondrej'
              ? 'border-[#8B5CF6] text-[#8B5CF6]'
              : 'border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
          style={account === 'Ondrej' ? { backgroundColor: 'rgba(139, 92, 246, 0.1)' } : undefined}
          type="button"
        >
          Ondrej (Founder Voice)
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste or type your content here..."
        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg p-4 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none focus:border-[var(--border-hover)] transition-colors resize-none min-h-[120px]"
      />

      {/* Check button */}
      <button
        onClick={handleCheck}
        disabled={!content.trim()}
        className="mt-3 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-gradient-end)] rounded-lg px-5 py-2.5 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        type="button"
      >
        Check Tone of Voice
      </button>

      {/* Results */}
      {result && (
        <div className="mt-5 bg-[var(--bg-tertiary)] rounded-lg p-4">
          {/* Score */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[14px] font-semibold text-[var(--text-primary)]">
              Score: {result.score}% Match
            </span>
          </div>

          {/* Score bar */}
          <div className="h-2 bg-[var(--border-default)] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${result.score}%`,
                backgroundColor: getScoreColor(result.score),
              }}
            />
          </div>

          {/* Issues */}
          {result.issues.length > 0 ? (
            <div>
              <span className="text-[12px] text-[var(--text-muted)] mb-2 block">
                Issues found:
              </span>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[12px]"
                  >
                    <span>{severityIcons[issue.severity]}</span>
                    <div>
                      <span className="text-[var(--text-primary)] font-medium">
                        &ldquo;{issue.phrase}&rdquo;
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {' '}&rarr; {issue.suggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-[var(--success)]">
              No issues found. Your content matches the Outloud voice.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
