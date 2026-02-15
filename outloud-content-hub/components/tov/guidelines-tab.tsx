'use client';

import { useTov } from '@/hooks/use-tov';
import { InlineEdit } from '@/components/plan/inline-edit';
import { Plus, X } from 'lucide-react';

export function GuidelinesTab() {
  const {
    guidelines,
    writingStyle,
    addGuideline,
    updateGuideline,
    deleteGuideline,
    updateWritingStyleRule,
  } = useTov();

  return (
    <div className="space-y-6">
      {/* Core Principles */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
          Core Principles
        </h3>

        {guidelines.length === 0 ? (
          <p className="text-[12px] text-[var(--text-disabled)] italic mb-4">
            No guidelines defined yet.
          </p>
        ) : (
          <div className="space-y-4">
            {guidelines.map((guideline, index) => (
              <div
                key={guideline.id}
                className="group flex gap-3"
              >
                <span
                  className="text-[14px] font-bold mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[12px]"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <InlineEdit
                    value={guideline.title}
                    onSave={(v) => updateGuideline(guideline.id, { title: v })}
                    className="text-[13px] font-semibold text-[var(--text-primary)]"
                  />
                  <div className="mt-2">
                    <InlineEdit
                      value={guideline.content}
                      onSave={(v) => updateGuideline(guideline.id, { content: v })}
                      className="text-[12px] text-[var(--text-secondary)]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => deleteGuideline(guideline.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all mt-1"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            addGuideline({
              title: 'New Principle',
              content: 'Describe this principle...',
              sortOrder: guidelines.length + 1,
            })
          }
          className="w-full flex items-center justify-center gap-2 mt-4 border border-dashed border-[var(--border-default)] rounded-lg py-3 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          type="button"
        >
          <Plus size={12} />
          Add Principle
        </button>
      </div>

      {/* Writing Style */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
          Writing Style
        </h3>

        <div className="space-y-4">
          {writingStyle.map((rule) => (
            <div key={rule.id}>
              <InlineEdit
                value={rule.title}
                onSave={(v) => updateWritingStyleRule(rule.id, { title: v })}
                className="text-[13px] font-semibold text-[var(--text-primary)]"
              />
              <div className="mt-1 border-b border-[var(--border-subtle)] mb-2" />
              <InlineEdit
                value={rule.content}
                onSave={(v) => updateWritingStyleRule(rule.id, { content: v })}
                className="text-[12px] text-[var(--text-secondary)]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
