'use client';

import { useTov } from '@/hooks/use-tov';
import { InlineEdit } from '@/components/plan/inline-edit';
import { Plus, X } from 'lucide-react';

export function DosDontsTab() {
  const {
    dos,
    donts,
    addDo,
    updateDo,
    deleteDo,
    addDont,
    updateDont,
    deleteDont,
  } = useTov();

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Do's */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--success)] mb-4 flex items-center gap-2">
          <span>&#10003;</span> Do&apos;s
        </h3>

        {dos.length === 0 ? (
          <p className="text-[12px] text-[var(--text-disabled)] italic mb-4">
            No do&apos;s defined yet.
          </p>
        ) : (
          <div className="space-y-3">
            {dos.map((doItem, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--success)] text-[12px] mt-0.5">&#10003;</span>
                  <div className="flex-1">
                    <InlineEdit
                      value={doItem.item}
                      onSave={(v) => updateDo(index, { ...doItem, item: v })}
                      className="text-[12px] text-[var(--text-primary)] font-medium"
                    />
                    <InlineEdit
                      value={doItem.example}
                      onSave={(v) => updateDo(index, { ...doItem, example: v })}
                      className="text-[11px] text-[var(--text-muted)] italic mt-0.5"
                    />
                  </div>
                  <button
                    onClick={() => deleteDo(index)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => addDo({ item: 'New do', example: 'Example...' })}
          className="w-full flex items-center justify-center gap-2 mt-4 border border-dashed border-[var(--border-default)] rounded-lg py-2.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          type="button"
        >
          <Plus size={12} />
          Add Do
        </button>
      </div>

      {/* Don'ts */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--error)] mb-4 flex items-center gap-2">
          <span>&#10007;</span> Don&apos;ts
        </h3>

        {donts.length === 0 ? (
          <p className="text-[12px] text-[var(--text-disabled)] italic mb-4">
            No don&apos;ts defined yet.
          </p>
        ) : (
          <div className="space-y-3">
            {donts.map((dont, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--error)] text-[12px] mt-0.5">&#10007;</span>
                  <div className="flex-1">
                    <InlineEdit
                      value={dont.phrase}
                      onSave={(v) => updateDont(index, { ...dont, phrase: v })}
                      className="text-[12px] text-[var(--text-primary)] font-medium"
                    />
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px] text-[var(--text-muted)]">&rarr;</span>
                      <InlineEdit
                        value={dont.fix}
                        onSave={(v) => updateDont(index, { ...dont, fix: v })}
                        className="text-[11px] text-[var(--text-muted)] italic"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDont(index)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => addDont({ phrase: 'New phrase to avoid', fix: 'Better alternative...' })}
          className="w-full flex items-center justify-center gap-2 mt-4 border border-dashed border-[var(--border-default)] rounded-lg py-2.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          type="button"
        >
          <Plus size={12} />
          Add Don&apos;t
        </button>
      </div>
    </div>
  );
}
