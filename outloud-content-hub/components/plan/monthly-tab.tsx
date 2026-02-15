'use client';

import { useState } from 'react';
import { useContentPlan } from '@/hooks/use-content-plan';
import { InlineEdit } from './inline-edit';
import { EmojiPicker } from './emoji-picker';
import { Plus, X } from 'lucide-react';

const STATUS_CONFIG = {
  planned: { dot: 'var(--text-disabled)', label: 'Planned' },
  current: { dot: 'var(--success)', label: 'Current' },
  completed: { dot: 'var(--text-muted)', label: 'Completed' },
} as const;

const STATUS_CYCLE: Array<'planned' | 'current' | 'completed'> = ['planned', 'current', 'completed'];

export function MonthlyTab() {
  const {
    monthlyProgram,
    monthlyThemes,
    updateMonthlyWeek,
    addMonthlyTheme,
    updateMonthlyTheme,
    deleteMonthlyTheme,
  } = useContentPlan();

  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

  const currentTheme = monthlyThemes.find((t) => t.status === 'current');

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-[var(--text-secondary)]">
        4-week rotating dramaturgy. Each week builds on the previous, creating narrative momentum.
      </p>

      {/* Current theme callout */}
      {currentTheme && (
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: 'var(--accent-color)10',
            borderColor: 'var(--accent-color)30',
          }}
        >
          <div className="flex items-center gap-2">
            <EmojiPicker
              value={currentTheme.emoji}
              onChange={(emoji) => updateMonthlyTheme(currentTheme.id, { emoji })}
              size={16}
            />
            <div>
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-color)' }}
              >
                Current Monthly Theme
              </span>
              <div className="flex items-center gap-1 text-[13px] text-[var(--text-primary)] font-medium">
                <InlineEdit
                  value={currentTheme.month}
                  onSave={(v) => updateMonthlyTheme(currentTheme.id, { month: v })}
                  className="text-[13px] text-[var(--text-primary)] font-medium"
                />
                <span className="text-[var(--text-muted)]">:</span>
                <InlineEdit
                  value={currentTheme.themeName}
                  onSave={(v) => updateMonthlyTheme(currentTheme.id, { themeName: v })}
                  className="text-[13px] text-[var(--text-primary)] font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-week program */}
      {monthlyProgram.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-8 text-center">
          <p className="text-[13px] text-[var(--text-disabled)] italic">
            No weekly program configured yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {monthlyProgram.map((week) => (
            <div
              key={week.weekNumber}
              className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[14px] text-white"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  {week.weekNumber}
                </div>
                <h4 className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-1">
                  Week {week.weekNumber}:
                  <InlineEdit
                    value={week.weekName}
                    onSave={(v) => updateMonthlyWeek(week.weekNumber, { weekName: v })}
                    className="text-[14px] font-semibold text-[var(--text-primary)]"
                  />
                </h4>
              </div>

              <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[var(--bg-tertiary)]">
                      <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-32">
                        Slot
                      </th>
                      <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                        Description
                      </th>
                      <th className="text-left px-4 py-2 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-28">
                        Format
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border-subtle)]">
                      <td className="px-4 py-2.5 text-[var(--text-secondary)] font-medium">Post A (Mon)</td>
                      <td className="px-4 py-2.5">
                        <InlineEdit
                          value={week.postA.description}
                          onSave={(v) =>
                            updateMonthlyWeek(week.weekNumber, {
                              postA: { ...week.postA, description: v },
                            })
                          }
                          className="text-[12px] text-[var(--text-primary)]"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <InlineEdit
                          value={week.postA.format}
                          onSave={(v) =>
                            updateMonthlyWeek(week.weekNumber, {
                              postA: { ...week.postA, format: v },
                            })
                          }
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        />
                      </td>
                    </tr>
                    <tr className="border-t border-[var(--border-subtle)]">
                      <td className="px-4 py-2.5 text-[var(--text-secondary)] font-medium">Post B (Wed)</td>
                      <td className="px-4 py-2.5">
                        <InlineEdit
                          value={week.postB.description}
                          onSave={(v) =>
                            updateMonthlyWeek(week.weekNumber, {
                              postB: { ...week.postB, description: v },
                            })
                          }
                          className="text-[12px] text-[var(--text-primary)]"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <InlineEdit
                          value={week.postB.format}
                          onSave={(v) =>
                            updateMonthlyWeek(week.weekNumber, {
                              postB: { ...week.postB, format: v },
                            })
                          }
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        />
                      </td>
                    </tr>
                    <tr className="border-t border-[var(--border-subtle)]">
                      <td className="px-4 py-2.5 text-[var(--role-ondrej)] font-medium">Ondrej (Tue)</td>
                      <td className="px-4 py-2.5" colSpan={2}>
                        <InlineEdit
                          value={week.ondrejTue}
                          onSave={(v) => updateMonthlyWeek(week.weekNumber, { ondrejTue: v })}
                          className="text-[12px] text-[var(--text-primary)]"
                        />
                      </td>
                    </tr>
                    <tr className="border-t border-[var(--border-subtle)]">
                      <td className="px-4 py-2.5 text-[var(--role-ondrej)] font-medium">Ondrej (Thu)</td>
                      <td className="px-4 py-2.5" colSpan={2}>
                        <InlineEdit
                          value={week.ondrejThu}
                          onSave={(v) => updateMonthlyWeek(week.weekNumber, { ondrejThu: v })}
                          className="text-[12px] text-[var(--text-primary)]"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Monthly Themes */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
          Upcoming Monthly Themes
        </h3>

        {monthlyThemes.length === 0 ? (
          <p className="text-[12px] text-[var(--text-disabled)] italic mb-4">
            No monthly themes planned yet. Add your first one below.
          </p>
        ) : (
          <div className="space-y-3">
            {monthlyThemes.map((theme) => {
              const config = STATUS_CONFIG[theme.status];

              return (
                <div
                  key={theme.id}
                  className="group flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                >
                  <div className="flex items-center gap-3">
                    {/* Status dot — click to cycle */}
                    <div className="relative">
                      <button
                        type="button"
                        className="w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform"
                        style={{ backgroundColor: config.dot }}
                        onClick={() =>
                          setStatusDropdownId(statusDropdownId === theme.id ? null : theme.id)
                        }
                      />
                      {statusDropdownId === theme.id && (
                        <div className="absolute top-full left-0 mt-2 z-50 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-xl py-1 w-28">
                          {STATUS_CYCLE.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center gap-2 hover:bg-[var(--bg-secondary)] transition-colors ${
                                s === theme.status
                                  ? 'text-[var(--text-primary)] font-medium'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                              onClick={() => {
                                updateMonthlyTheme(theme.id, { status: s });
                                setStatusDropdownId(null);
                              }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: STATUS_CONFIG[s].dot }}
                              />
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <EmojiPicker
                      value={theme.emoji}
                      onChange={(emoji) => updateMonthlyTheme(theme.id, { emoji })}
                      size={16}
                    />

                    <div className="flex items-center gap-2">
                      <InlineEdit
                        value={theme.themeName}
                        onSave={(v) => updateMonthlyTheme(theme.id, { themeName: v })}
                        className="text-[13px] text-[var(--text-primary)] font-medium"
                      />
                      <InlineEdit
                        value={theme.month}
                        onSave={(v) => updateMonthlyTheme(theme.id, { month: v })}
                        className="text-[12px] text-[var(--text-muted)]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)]">{config.label}</span>
                    <button
                      type="button"
                      onClick={() => deleteMonthlyTheme(theme.id)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            addMonthlyTheme({
              month: 'Next Month',
              themeName: 'New Theme',
              emoji: '\uD83D\uDCCC',
              status: 'planned',
            })
          }
          className="w-full flex items-center justify-center gap-2 mt-4 border border-dashed border-[var(--border-default)] rounded-lg py-3 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
        >
          <Plus size={12} />
          Plan Next Month
        </button>
      </div>
    </div>
  );
}
