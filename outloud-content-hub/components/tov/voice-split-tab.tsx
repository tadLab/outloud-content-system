'use client';

import { useTov } from '@/hooks/use-tov';
import { InlineEdit } from '@/components/plan/inline-edit';
import { EditableList } from '@/components/plan/editable-list';
import { ACCOUNT_IMAGES } from '@/lib/constants';

export function VoiceSplitTab() {
  const { voiceSplit, voiceComparison, updateVoiceSplit, updateVoiceComparison } = useTov();

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-[var(--text-secondary)]">
        Different accounts have different voices within the same brand.
      </p>

      {/* Voice cards */}
      <div className="grid grid-cols-2 gap-6">
        {voiceSplit.map((voice) => (
          <div
            key={voice.account}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              {ACCOUNT_IMAGES[voice.account] && (
                <img
                  src={ACCOUNT_IMAGES[voice.account]}
                  alt={voice.account}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <h4 className="text-[14px] font-semibold text-[var(--text-primary)]">
                  {voice.account}
                </h4>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[var(--text-muted)]">Voice:</span>
                  <span style={{ color: 'var(--accent-color)' }}>
                    <InlineEdit
                      value={voice.voiceName}
                      onSave={(v) => updateVoiceSplit(voice.account, { voiceName: v })}
                      className="text-[11px] font-medium"
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                Characteristics
              </span>
              <div className="mt-1">
                <EditableList
                  items={voice.characteristics}
                  onAdd={(item) =>
                    updateVoiceSplit(voice.account, {
                      characteristics: [...voice.characteristics, item],
                    })
                  }
                  onUpdate={(i, item) =>
                    updateVoiceSplit(voice.account, {
                      characteristics: voice.characteristics.map((c, idx) =>
                        idx === i ? item : c
                      ),
                    })
                  }
                  onDelete={(i) =>
                    updateVoiceSplit(voice.account, {
                      characteristics: voice.characteristics.filter((_, idx) => idx !== i),
                    })
                  }
                  bulletIcon="•"
                  addLabel="Add characteristic"
                  emptyMessage="No characteristics"
                  itemClassName="text-[12px] text-[var(--text-secondary)]"
                />
              </div>
            </div>

            <div className="mb-3">
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                Example
              </span>
              <div className="mt-1 bg-[var(--bg-tertiary)] rounded-lg p-3">
                <InlineEdit
                  value={voice.example}
                  onSave={(v) => updateVoiceSplit(voice.account, { example: v })}
                  className="text-[12px] text-[var(--text-primary)] italic"
                />
              </div>
            </div>

            {voice.topics && voice.topics.length > 0 && (
              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                  Topics
                </span>
                <div className="mt-1">
                  <EditableList
                    items={voice.topics}
                    onAdd={(item) =>
                      updateVoiceSplit(voice.account, {
                        topics: [...(voice.topics || []), item],
                      })
                    }
                    onUpdate={(i, item) =>
                      updateVoiceSplit(voice.account, {
                        topics: (voice.topics || []).map((t, idx) =>
                          idx === i ? item : t
                        ),
                      })
                    }
                    onDelete={(i) =>
                      updateVoiceSplit(voice.account, {
                        topics: (voice.topics || []).filter((_, idx) => idx !== i),
                      })
                    }
                    bulletIcon="•"
                    addLabel="Add topic"
                    emptyMessage="No topics"
                    itemClassName="text-[12px] text-[var(--text-secondary)]"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Comparison */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
          Quick Comparison
        </h3>

        <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[var(--bg-tertiary)]">
                <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-32">
                  Aspect
                </th>
                <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                  Outloud
                </th>
                <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                  Ondrej
                </th>
              </tr>
            </thead>
            <tbody>
              {voiceComparison.map((row, index) => (
                <tr key={index} className="border-t border-[var(--border-subtle)]">
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] font-medium">
                    <InlineEdit
                      value={row.aspect}
                      onSave={(v) => updateVoiceComparison(index, { aspect: v })}
                      className="text-[12px] text-[var(--text-secondary)] font-medium"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <InlineEdit
                      value={row.outloud}
                      onSave={(v) => updateVoiceComparison(index, { outloud: v })}
                      className="text-[12px] text-[var(--text-primary)]"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <InlineEdit
                      value={row.ondrej}
                      onSave={(v) => updateVoiceComparison(index, { ondrej: v })}
                      className="text-[12px] text-[var(--text-primary)]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
