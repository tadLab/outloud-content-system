'use client';

import { Plus, X } from 'lucide-react';
import { useContentPlan } from '@/hooks/use-content-plan';
import { InlineEdit } from './inline-edit';
import { PlatformBadge } from '@/components/posts/platform-badge';
import { PLATFORM_OPTIONS } from '@/lib/constants';
import { Platform } from '@/types';
import { BestTimesSection } from './best-times-section';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CadenceTab() {
  const {
    cadence,
    combinedGrid,
    contentPlan,
    addCadenceEntry,
    updateCadenceEntry,
    deleteCadenceEntry,
    updateCadenceSummary,
    updateCombinedGridCell,
  } = useContentPlan();

  return (
    <div className="space-y-6">
      {/* Per-account cadence tables */}
      {cadence.map((cadenceItem, accountIndex) => (
        <div
          key={cadenceItem.account}
          className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5"
        >
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
            {cadenceItem.account}{' '}
            {cadenceItem.account === 'Outloud' ? '(Company)' : '(Personal Brand)'}
          </h3>

          {cadenceItem.entries.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[12px] text-[var(--text-disabled)] italic mb-3">
                No cadence entries yet. Define your posting frequency.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[var(--bg-tertiary)]">
                    <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                      Platform
                    </th>
                    <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                      Frequency
                    </th>
                    <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                      Days
                    </th>
                    <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                      Time
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {cadenceItem.entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="group border-t border-[var(--border-subtle)]"
                    >
                      <td className="px-4 py-3">
                        <PlatformSelect
                          value={entry.platform}
                          onChange={(platform) =>
                            updateCadenceEntry(entry.id, { platform })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InlineEdit
                          value={entry.frequency}
                          onSave={(frequency) =>
                            updateCadenceEntry(entry.id, { frequency })
                          }
                          className="text-[12px] text-[var(--text-primary)]"
                          emptyText="Set frequency"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InlineEdit
                          value={entry.days}
                          onSave={(days) =>
                            updateCadenceEntry(entry.id, { days })
                          }
                          className="text-[12px] text-[var(--text-secondary)]"
                          emptyText="Set days"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InlineEdit
                          value={entry.preferredTime}
                          onSave={(preferredTime) =>
                            updateCadenceEntry(entry.id, { preferredTime })
                          }
                          className="text-[12px] text-[var(--text-secondary)]"
                          emptyText="Set time"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => deleteCadenceEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[#EF4444] transition-all"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4 text-[12px] text-[var(--text-muted)]">
              <span>
                Weekly total:{' '}
                <InlineEdit
                  value={String(cadenceItem.weeklyTotal)}
                  onSave={(val) =>
                    updateCadenceSummary(accountIndex, {
                      weeklyTotal: val,
                    })
                  }
                  className="text-[12px] text-[var(--text-primary)] inline"
                  emptyText="0"
                />
              </span>
              <span>
                Monthly total:{' '}
                <InlineEdit
                  value={String(cadenceItem.monthlyTotal)}
                  onSave={(val) =>
                    updateCadenceSummary(accountIndex, {
                      monthlyTotal: val,
                    })
                  }
                  className="text-[12px] text-[var(--text-primary)] inline"
                  emptyText="0"
                />
              </span>
            </div>

            <button
              onClick={() =>
                addCadenceEntry(accountIndex, {
                  planId: contentPlan.id,
                  account: cadenceItem.account,
                  platform: 'linkedin',
                  frequency: '',
                  days: '',
                  preferredTime: '',
                })
              }
              className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              type="button"
            >
              <Plus size={12} />
              Add Entry
            </button>
          </div>
        </div>
      ))}

      {/* Combined Weekly Overview */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
          Combined Weekly Overview
        </h3>

        <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[var(--bg-tertiary)]">
                <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-16">
                  &nbsp;
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="text-center px-3 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {combinedGrid.map((row) => (
                <tr
                  key={row.platform}
                  className="border-t border-[var(--border-subtle)]"
                >
                  <td className="px-4 py-2.5 text-[var(--text-primary)] font-medium">
                    {row.platform}
                  </td>
                  {DAYS.map((day) => {
                    const val = row.days[day] || '-';
                    return (
                      <td key={day} className="text-center px-1 py-1">
                        <GridCell
                          value={val}
                          onSave={(newVal) =>
                            updateCombinedGridCell(row.platform, day, newVal)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mt-3 text-[11px] text-[var(--text-muted)]">
          <span>
            <span style={{ color: 'var(--accent-color)' }}>OL</span> = Outloud
          </span>
          <span>
            <span style={{ color: '#8B5CF6' }}>OK</span> = Ondrej
          </span>
          <span>? = optional</span>
        </div>
      </div>

      {/* Best Times to Post */}
      <BestTimesSection />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Platform select dropdown                                            */
/* ------------------------------------------------------------------ */

function PlatformSelect({
  value,
  onChange,
}: {
  value: Platform;
  onChange: (platform: Platform) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <PlatformBadge platform={value} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Platform)}
        className="bg-transparent text-[11px] text-[var(--text-secondary)] border-none outline-none cursor-pointer appearance-none hover:text-[var(--text-primary)] transition-colors"
      >
        {PLATFORM_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grid cell – inline-editable with color coding                       */
/* ------------------------------------------------------------------ */

function GridCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) {
  return (
    <InlineEdit
      value={value}
      onSave={onSave}
      className="text-[12px] w-10 text-center inline-block"
      inputClassName="w-10 text-center"
      emptyText="-"
    />
  );
}
