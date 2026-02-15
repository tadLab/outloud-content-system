'use client';

import { useContentPlan } from '@/hooks/use-content-plan';
import { InlineEdit } from './inline-edit';
import { EmojiPicker } from './emoji-picker';
import { EditableList } from './editable-list';
import { Plus, X } from 'lucide-react';

export function OverviewTab() {
  const {
    contentPlan,
    brandVoice,
    addNorthStarGoal,
    updateNorthStarGoal,
    deleteNorthStarGoal,
    addKPI,
    updateKPI,
    deleteKPI,
    updateBrandVoice,
    addBrandVoiceItem,
    updateBrandVoiceItem,
    deleteBrandVoiceItem,
  } = useContentPlan();

  return (
    <div className="space-y-6">
      {/* North Star */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          North Star
        </h3>
        <p className="text-[13px] text-[var(--text-muted)] mb-4">
          What our content must achieve:
        </p>

        {contentPlan.northStar.length === 0 ? (
          <p className="text-[12px] text-[var(--text-disabled)] italic mb-3">
            No goals defined yet. Add your first North Star goal.
          </p>
        ) : (
          <div className="space-y-3">
            {contentPlan.northStar.map((goal) => (
              <div
                key={goal.id}
                className="group relative bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg p-4"
              >
                <button
                  onClick={() => deleteNorthStarGoal(goal.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[#EF4444] transition-all"
                  type="button"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <EmojiPicker
                    value={goal.icon}
                    onChange={(icon) => updateNorthStarGoal(goal.id, { icon })}
                  />
                  <InlineEdit
                    value={goal.title}
                    onSave={(title) => updateNorthStarGoal(goal.id, { title })}
                    className="text-[14px] font-semibold text-[var(--text-primary)]"
                  />
                </div>
                <div className="ml-7">
                  <InlineEdit
                    value={goal.description}
                    onSave={(description) => updateNorthStarGoal(goal.id, { description })}
                    className="text-[13px] text-[var(--text-secondary)]"
                    emptyText="Add description..."
                  />
                </div>
                <div className="ml-7 mt-1">
                  <InlineEdit
                    value={goal.target}
                    onSave={(target) => updateNorthStarGoal(goal.id, { target })}
                    className="text-[12px] text-[var(--text-muted)]"
                    emptyText="Add target..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            addNorthStarGoal({ icon: '🎯', title: 'New Goal', description: '', target: '' })
          }
          className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-[var(--border-default)] rounded-lg px-3 py-3 text-[var(--text-muted)] text-[12px] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          type="button"
        >
          <Plus size={12} />
          Add Goal
        </button>
      </div>

      {/* KPIs */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          KPIs
        </h3>

        <div className="mb-4">
          <p className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Primary (track weekly)
          </p>
          <EditableList
            items={contentPlan.kpis.primary.map((k) => k.label)}
            onAdd={(label) => addKPI('primary', label)}
            onUpdate={(i, label) => updateKPI('primary', i, label)}
            onDelete={(i) => deleteKPI('primary', i)}
            bulletIcon="•"
            bulletColor="var(--accent-color)"
            addLabel="Add primary KPI"
            emptyMessage="No primary KPIs yet."
          />
        </div>

        <div>
          <p className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Secondary (don&apos;t obsess)
          </p>
          <EditableList
            items={contentPlan.kpis.secondary.map((k) => k.label)}
            onAdd={(label) => addKPI('secondary', label)}
            onUpdate={(i, label) => updateKPI('secondary', i, label)}
            onDelete={(i) => deleteKPI('secondary', i)}
            bulletIcon="•"
            bulletColor="var(--text-disabled)"
            addLabel="Add secondary KPI"
            emptyMessage="No secondary KPIs yet."
            itemClassName="text-[13px] text-[var(--text-secondary)]"
          />
        </div>
      </div>

      {/* Brand Voice Reminder */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Brand Voice Reminder
        </h3>

        <div className="mb-1">
          <InlineEdit
            value={brandVoice.tagline}
            onSave={(tagline) => updateBrandVoice({ tagline })}
            className="text-[14px] font-medium text-[var(--text-primary)]"
          />
        </div>

        <div className="flex items-center gap-0 text-[13px] mb-4">
          <span className="text-[var(--text-muted)] mr-1.5">3 Words:</span>
          {brandVoice.threeWords.map((word, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && (
                <span className="text-[var(--accent-color)] mx-1">/</span>
              )}
              <InlineEdit
                value={word}
                onSave={(val) => {
                  const newWords = [...brandVoice.threeWords];
                  newWords[i] = val;
                  updateBrandVoice({ threeWords: newWords });
                }}
                className="text-[13px] text-[var(--accent-color)]"
              />
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <EditableList
              items={brandVoice.dos}
              onAdd={(item) => addBrandVoiceItem('dos', item)}
              onUpdate={(i, item) => updateBrandVoiceItem('dos', i, item)}
              onDelete={(i) => deleteBrandVoiceItem('dos', i)}
              bulletIcon="✓"
              bulletColor="#22C55E"
              addLabel="Add do"
              emptyMessage="No do's yet."
            />
          </div>
          <div>
            <EditableList
              items={brandVoice.donts}
              onAdd={(item) => addBrandVoiceItem('donts', item)}
              onUpdate={(i, item) => updateBrandVoiceItem('donts', i, item)}
              onDelete={(i) => deleteBrandVoiceItem('donts', i)}
              bulletIcon="✗"
              bulletColor="#EF4444"
              addLabel="Add don't"
              emptyMessage="No don'ts yet."
              itemClassName="text-[13px] text-[var(--text-secondary)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
