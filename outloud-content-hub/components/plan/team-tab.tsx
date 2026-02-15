'use client';

import { useState } from 'react';
import { useContentPlan } from '@/hooks/use-content-plan';
import { useUserContext } from '@/providers/user-provider';
import { InlineEdit } from './inline-edit';
import { EditableList } from './editable-list';
import { UserAvatar } from '@/components/posts/user-avatar';
import { UserId } from '@/types';
import { Plus, X } from 'lucide-react';

const ALL_USER_IDS: UserId[] = ['tade', 'martin', 'ondrej'];

export function TeamTab() {
  const {
    teamResponsibilities,
    workflow,
    addTeamResponsibility,
    updateTeamResponsibility,
    deleteTeamResponsibility,
    addWorkflowStep,
    updateWorkflowStep,
    deleteWorkflowStep,
  } = useContentPlan();

  const { getUserByKey } = useUserContext();

  const [whoDropdownStep, setWhoDropdownStep] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Team Responsibilities */}
      {teamResponsibilities.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-8 text-center">
          <p className="text-[13px] text-[var(--text-disabled)] italic">
            No team responsibilities configured yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {teamResponsibilities.map((member) => {
            const user = getUserByKey(member.userId);
            return (
              <div
                key={member.userId}
                className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar userId={member.userId} size={24} />
                  <h4 className="text-[14px] font-semibold text-[var(--text-primary)]">
                    {user?.name}
                  </h4>
                </div>

                <EditableList
                  items={member.responsibilities}
                  onAdd={(r) => addTeamResponsibility(member.userId, r)}
                  onUpdate={(i, r) => updateTeamResponsibility(member.userId, i, r)}
                  onDelete={(i) => deleteTeamResponsibility(member.userId, i)}
                  bulletIcon="•"
                  bulletColor={user?.color}
                  addLabel="Add responsibility"
                  emptyMessage="No responsibilities assigned."
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Workflow */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">
          Weekly Workflow
        </h3>

        {workflow.length === 0 ? (
          <p className="text-[12px] text-[var(--text-disabled)] italic mb-4">
            No workflow steps defined yet. Add your first one below.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[var(--bg-tertiary)]">
                  <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-32">
                    Who
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-20">
                    Day
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]">
                    Task
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px] w-20">
                    Time
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {workflow.map((step) => {
                  const user = getUserByKey(step.who);
                  return (
                    <tr
                      key={step.step}
                      className="group border-t border-[var(--border-subtle)]"
                    >
                      <td className="px-4 py-3 text-[var(--text-muted)]">{step.step}</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            type="button"
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              setWhoDropdownStep(whoDropdownStep === step.step ? null : step.step)
                            }
                          >
                            <UserAvatar userId={step.who} size={20} />
                            <span className="text-[var(--text-primary)]">{user?.name}</span>
                          </button>

                          {whoDropdownStep === step.step && (
                            <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-xl py-1 w-36">
                              {ALL_USER_IDS.map((uid) => {
                                const u = getUserByKey(uid);
                                return (
                                  <button
                                    key={uid}
                                    type="button"
                                    className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 hover:bg-[var(--bg-secondary)] transition-colors ${
                                      uid === step.who
                                        ? 'text-[var(--text-primary)] font-medium'
                                        : 'text-[var(--text-secondary)]'
                                    }`}
                                    onClick={() => {
                                      updateWorkflowStep(step.step, { who: uid });
                                      setWhoDropdownStep(null);
                                    }}
                                  >
                                    <UserAvatar userId={uid} size={16} />
                                    {u?.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <InlineEdit
                          value={step.day}
                          onSave={(v) => updateWorkflowStep(step.step, { day: v })}
                          className="text-[12px] text-[var(--text-secondary)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InlineEdit
                          value={step.task}
                          onSave={(v) => updateWorkflowStep(step.step, { task: v })}
                          className="text-[12px] text-[var(--text-primary)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InlineEdit
                          value={step.time}
                          onSave={(v) => updateWorkflowStep(step.step, { time: v })}
                          className="text-[12px] text-[var(--text-muted)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => deleteWorkflowStep(step.step)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[var(--error)] transition-all"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            addWorkflowStep({ who: 'tade', day: '', task: 'New task', time: '' })
          }
          className="w-full flex items-center justify-center gap-2 mt-4 border border-dashed border-[var(--border-default)] rounded-lg py-3 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
        >
          <Plus size={12} />
          Add Step
        </button>
      </div>
    </div>
  );
}
