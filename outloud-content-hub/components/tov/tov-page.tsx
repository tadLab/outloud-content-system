'use client';

import { useAppStore } from '@/stores/app-store';
import { useContentPlan } from '@/hooks/use-content-plan';
import { TovTab } from '@/types';
import { GuidelinesTab } from './guidelines-tab';
import { DosDontsTab } from './dos-donts-tab';
import { ExamplesTab } from './examples-tab';
import { VoiceSplitTab } from './voice-split-tab';
import { TovChecker } from './tov-checker';
import { InlineEdit } from '@/components/plan/inline-edit';

const TOV_TABS: { id: TovTab; label: string }[] = [
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'dos-donts', label: "Do's & Don'ts" },
  { id: 'examples', label: 'Examples' },
  { id: 'voice-split', label: 'Voice Split' },
];

export function TovPage() {
  const tovTab = useAppStore((s) => s.tovTab);
  const setTovTab = useAppStore((s) => s.setTovTab);
  const { brandVoice, updateBrandVoice } = useContentPlan();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page title */}
      <h1 className="text-[24px] font-semibold text-[var(--text-primary)] mb-6">
        Tone of Voice
      </h1>

      {/* Quick Reference Banner */}
      <div
        className="rounded-xl p-5 mb-6 border"
        style={{
          backgroundColor: 'var(--accent-color)10',
          borderColor: 'var(--accent-color)30',
        }}
      >
        <div className="text-center">
          <div className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">
            <InlineEdit
              value={brandVoice.tagline}
              onSave={(v) => updateBrandVoice({ tagline: v })}
              className="text-[16px] font-semibold text-[var(--text-primary)]"
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-[13px]">
            <span className="text-[var(--text-muted)]">Three words:</span>
            {brandVoice.threeWords.map((word, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-[var(--text-disabled)]">/</span>}
                <span style={{ color: 'var(--accent-color)' }}>
                  <InlineEdit
                    value={word}
                    onSave={(v) => {
                      const updated = [...brandVoice.threeWords];
                      updated[i] = v;
                      updateBrandVoice({ threeWords: updated });
                    }}
                    className="text-[13px] font-medium"
                  />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-default)]">
        {TOV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTovTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-[13px] font-medium rounded-md transition-all ${
              tovTab === tab.id
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mb-8">
        {tovTab === 'guidelines' && <GuidelinesTab />}
        {tovTab === 'dos-donts' && <DosDontsTab />}
        {tovTab === 'examples' && <ExamplesTab />}
        {tovTab === 'voice-split' && <VoiceSplitTab />}
      </div>

      {/* ToV Checker (always visible) */}
      <TovChecker />
    </div>
  );
}
