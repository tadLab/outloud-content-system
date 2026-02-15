'use client';

import { useTov } from '@/hooks/use-tov';
import { InlineEdit } from '@/components/plan/inline-edit';
import { Plus, X } from 'lucide-react';

export function ExamplesTab() {
  const { examples, addExample, updateExample, deleteExample } = useTov();

  const goodExamples = examples.filter((e) => e.type === 'good');
  const badToGoodExamples = examples.filter((e) => e.type === 'bad_to_good');
  const hookExamples = examples.filter((e) => e.type === 'hook');

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-[var(--text-secondary)]">
        Real examples from our best-performing posts.
      </p>

      {/* Good Examples */}
      {goodExamples.map((example) => (
        <div
          key={example.id}
          className="group bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5 relative"
        >
          <button
            onClick={() => deleteExample(example.id)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
            type="button"
          >
            <X size={14} />
          </button>

          <h4 className="text-[12px] font-semibold text-[var(--success)] uppercase tracking-wider mb-3 flex items-center gap-1">
            <span>&#10003;</span> Good Example
          </h4>

          {example.title && (
            <InlineEdit
              value={example.title}
              onSave={(v) => updateExample(example.id, { title: v })}
              className="text-[13px] font-semibold text-[var(--text-primary)] mb-2"
            />
          )}

          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mb-3">
            <InlineEdit
              value={example.afterText}
              onSave={(v) => updateExample(example.id, { afterText: v })}
              className="text-[12px] text-[var(--text-primary)] whitespace-pre-line"
            />
          </div>

          {example.explanation && (
            <div className="border-t border-[var(--border-subtle)] pt-3">
              <InlineEdit
                value={example.explanation}
                onSave={(v) => updateExample(example.id, { explanation: v })}
                className="text-[11px] text-[var(--text-muted)]"
              />
            </div>
          )}
        </div>
      ))}

      {/* Bad to Good Transformations */}
      {badToGoodExamples.map((example) => (
        <div
          key={example.id}
          className="group bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5 relative"
        >
          <button
            onClick={() => deleteExample(example.id)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
            type="button"
          >
            <X size={14} />
          </button>

          <h4 className="text-[12px] font-semibold text-[var(--warning)] uppercase tracking-wider mb-3">
            Bad &rarr; Good Transformation
          </h4>

          {example.title && (
            <InlineEdit
              value={example.title}
              onSave={(v) => updateExample(example.id, { title: v })}
              className="text-[13px] font-semibold text-[var(--text-primary)] mb-2"
            />
          )}

          {/* Before */}
          <div className="mb-3">
            <span className="text-[11px] text-[var(--error)] font-medium">&#10007; Before:</span>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mt-1 border-l-2 border-[var(--error)]">
              <InlineEdit
                value={example.beforeText || ''}
                onSave={(v) => updateExample(example.id, { beforeText: v })}
                className="text-[12px] text-[var(--text-muted)] italic"
              />
            </div>
          </div>

          {/* After */}
          <div className="mb-3">
            <span className="text-[11px] text-[var(--success)] font-medium">&#10003; After:</span>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mt-1 border-l-2 border-[var(--success)]">
              <InlineEdit
                value={example.afterText}
                onSave={(v) => updateExample(example.id, { afterText: v })}
                className="text-[12px] text-[var(--text-primary)]"
              />
            </div>
          </div>

          {example.explanation && (
            <div className="border-t border-[var(--border-subtle)] pt-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium block mb-1">What changed:</span>
              <InlineEdit
                value={example.explanation}
                onSave={(v) => updateExample(example.id, { explanation: v })}
                className="text-[11px] text-[var(--text-muted)]"
              />
            </div>
          )}
        </div>
      ))}

      {/* Hook Examples */}
      {hookExamples.map((example) => (
        <div
          key={example.id}
          className="group bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5 relative"
        >
          <button
            onClick={() => deleteExample(example.id)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
            type="button"
          >
            <X size={14} />
          </button>

          <h4 className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--accent-color)' }}>
            Hook Examples
          </h4>

          {example.title && (
            <InlineEdit
              value={example.title}
              onSave={(v) => updateExample(example.id, { title: v })}
              className="text-[13px] font-semibold text-[var(--text-primary)] mb-2"
            />
          )}

          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mb-3">
            <InlineEdit
              value={example.afterText}
              onSave={(v) => updateExample(example.id, { afterText: v })}
              className="text-[12px] text-[var(--text-primary)] whitespace-pre-line"
            />
          </div>

          {example.explanation && (
            <div className="border-t border-[var(--border-subtle)] pt-3">
              <InlineEdit
                value={example.explanation}
                onSave={(v) => updateExample(example.id, { explanation: v })}
                className="text-[11px] text-[var(--text-muted)]"
              />
            </div>
          )}
        </div>
      ))}

      {/* Add Example */}
      <button
        onClick={() =>
          addExample({
            type: 'good',
            title: 'New Example',
            afterText: 'Write your example content here...',
            explanation: 'Why this works...',
            tags: [],
            sortOrder: examples.length + 1,
          })
        }
        className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--border-default)] rounded-xl py-4 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
        type="button"
      >
        <Plus size={14} />
        Add Example
      </button>
    </div>
  );
}
