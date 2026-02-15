'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useContentPlan } from '@/hooks/use-content-plan';
import { InlineEdit } from './inline-edit';
import { EditableList } from './editable-list';
import { ACCOUNTS } from '@/lib/constants';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export function WeeklyTab() {
  const {
    weeklySlots,
    contentPlan,
    addWeeklySlot,
    updateWeeklySlot,
    deleteWeeklySlot,
  } = useContentPlan();

  const [openDayDropdown, setOpenDayDropdown] = useState<string | null>(null);
  const [openAccountDropdown, setOpenAccountDropdown] = useState<string | null>(
    null
  );

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-[var(--text-secondary)]">
        Repeatable structure for every week
      </p>

      {weeklySlots.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-[var(--text-disabled)] italic mb-4">
            No weekly slots defined. Add your first slot to build your weekly
            template.
          </p>
          <button
            onClick={() =>
              addWeeklySlot({
                planId: contentPlan.id,
                dayOfWeek: 'Monday',
                slotName: 'New Slot',
                account: 'Outloud',
                goal: '',
                formats: [],
                pillar: '',
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-lg hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors"
            type="button"
          >
            <Plus size={14} />
            Add Weekly Slot
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {weeklySlots.map((slot) => (
            <div
              key={slot.id}
              className="group relative bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5"
            >
              {/* Delete button — hover reveal */}
              <button
                onClick={() => deleteWeeklySlot(slot.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[#EF4444] transition-all"
                type="button"
              >
                <X size={14} />
              </button>

              {/* Header: day badge + slot name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {/* Day of week dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDayDropdown(
                            openDayDropdown === slot.id ? null : slot.id
                          )
                        }
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase tracking-wider hover:bg-[var(--border-default)] transition-colors cursor-pointer"
                        type="button"
                      >
                        {slot.dayOfWeek}
                      </button>
                      {openDayDropdown === slot.id && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-lg py-1 min-w-[120px]">
                          {WEEKDAYS.map((day) => (
                            <button
                              key={day}
                              onClick={() => {
                                updateWeeklySlot(slot.id, { dayOfWeek: day });
                                setOpenDayDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--border-default)] transition-colors ${
                                slot.dayOfWeek === day
                                  ? 'text-[var(--text-primary)]'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                              type="button"
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Slot name */}
                    <InlineEdit
                      value={slot.slotName}
                      onSave={(slotName) =>
                        updateWeeklySlot(slot.id, { slotName })
                      }
                      className="text-[14px] font-semibold text-[var(--text-primary)]"
                      emptyText="Untitled Slot"
                    />
                  </div>

                  {/* Account dropdown */}
                  <div className="relative inline-block">
                    <button
                      onClick={() =>
                        setOpenAccountDropdown(
                          openAccountDropdown === slot.id ? null : slot.id
                        )
                      }
                      className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                      type="button"
                    >
                      Account:{' '}
                      <span className="text-[var(--text-secondary)]">
                        {slot.account}
                      </span>
                    </button>
                    {openAccountDropdown === slot.id && (
                      <div className="absolute top-full left-0 mt-1 z-20 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-lg py-1 min-w-[120px]">
                        {ACCOUNTS.map((account) => (
                          <button
                            key={account}
                            onClick={() => {
                              updateWeeklySlot(slot.id, { account });
                              setOpenAccountDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--border-default)] transition-colors ${
                              slot.account === account
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)]'
                            }`}
                            type="button"
                          >
                            {account}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Goal / Formats / Pillar grid */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    Goal
                  </span>
                  <div className="mt-1">
                    <InlineEdit
                      value={slot.goal}
                      onSave={(goal) => updateWeeklySlot(slot.id, { goal })}
                      className="text-[12px] text-[var(--text-secondary)]"
                      emptyText="Set goal"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    Formats
                  </span>
                  <div className="mt-1">
                    <EditableList
                      items={slot.formats}
                      onAdd={(format) =>
                        updateWeeklySlot(slot.id, {
                          formats: [...slot.formats, format],
                        })
                      }
                      onUpdate={(index, format) =>
                        updateWeeklySlot(slot.id, {
                          formats: slot.formats.map((f, i) =>
                            i === index ? format : f
                          ),
                        })
                      }
                      onDelete={(index) =>
                        updateWeeklySlot(slot.id, {
                          formats: slot.formats.filter((_, i) => i !== index),
                        })
                      }
                      addLabel="Add format"
                      emptyMessage="No formats"
                      itemClassName="text-[11px] text-[var(--text-secondary)]"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    Pillar
                  </span>
                  <div className="mt-1">
                    <InlineEdit
                      value={slot.pillar}
                      onSave={(pillar) =>
                        updateWeeklySlot(slot.id, { pillar })
                      }
                      className="text-[12px] text-[var(--text-secondary)]"
                      emptyText="Set pillar"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Examples */}
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                  CTA Examples
                </span>
                <div className="mt-1.5">
                  <EditableList
                    items={slot.ctaExamples || []}
                    onAdd={(cta) =>
                      updateWeeklySlot(slot.id, {
                        ctaExamples: [...(slot.ctaExamples || []), cta],
                      })
                    }
                    onUpdate={(index, cta) =>
                      updateWeeklySlot(slot.id, {
                        ctaExamples: (slot.ctaExamples || []).map((c, i) =>
                          i === index ? cta : c
                        ),
                      })
                    }
                    onDelete={(index) =>
                      updateWeeklySlot(slot.id, {
                        ctaExamples: (slot.ctaExamples || []).filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    bulletIcon={'\u2192'}
                    addLabel="Add CTA example"
                    emptyMessage="No CTA examples yet"
                    itemClassName="text-[11px] text-[var(--text-secondary)] italic"
                  />
                </div>
              </div>

              {/* Topics */}
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                  Topics
                </span>
                <div className="mt-1.5">
                  <EditableList
                    items={slot.topics || []}
                    onAdd={(topic) =>
                      updateWeeklySlot(slot.id, {
                        topics: [...(slot.topics || []), topic],
                      })
                    }
                    onUpdate={(index, topic) =>
                      updateWeeklySlot(slot.id, {
                        topics: (slot.topics || []).map((t, i) =>
                          i === index ? topic : t
                        ),
                      })
                    }
                    onDelete={(index) =>
                      updateWeeklySlot(slot.id, {
                        topics: (slot.topics || []).filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    bulletIcon="#"
                    addLabel="Add topic"
                    emptyMessage="No topics yet"
                    itemClassName="text-[11px] text-[var(--text-secondary)]"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add slot button */}
          <button
            onClick={() =>
              addWeeklySlot({
                planId: contentPlan.id,
                dayOfWeek: 'Monday',
                slotName: 'New Slot',
                account: 'Outloud',
                goal: '',
                formats: [],
                pillar: '',
              })
            }
            className="w-full flex items-center justify-center gap-2 py-4 text-[13px] text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors"
            type="button"
          >
            <Plus size={14} />
            Add Weekly Slot
          </button>
        </div>
      )}
    </div>
  );
}
