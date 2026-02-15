'use client';

import { useState } from 'react';
import { useContentPlan } from '@/hooks/use-content-plan';
import { InlineEdit } from './inline-edit';
import { EditableList } from './editable-list';
import { Plus, X, GripVertical } from 'lucide-react';
import { DEFAULT_THEME_COLORS } from '@/lib/constants';

export function PillarsTab() {
  const {
    pillars,
    contentPlan,
    addPillar,
    updatePillar,
    deletePillar,
    reorderPillars,
  } = useContentPlan();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [colorPickerOpenId, setColorPickerOpenId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const items = [...pillars];
    const fromIndex = items.findIndex((p) => p.id === draggedId);
    const toIndex = items.findIndex((p) => p.id === targetId);
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    reorderPillars(items);
  };

  const handleDragEnd = () => setDraggedId(null);

  const getPillarProgress = (pillarId: string) => {
    // Progress tracking without mock PILLAR_THEME_MAP
    // Will show 0 progress until pillar-to-post relationships are established in the DB
    const pillar = pillars.find((p) => p.id === pillarId);
    const target = pillar?.targetPerMonth || 4;
    const done = 0;
    const percentage = Math.min(100, Math.round((done / target) * 100));
    return { target, done, percentage };
  };

  if (pillars.length === 0) {
    return (
      <div>
        <p className="text-[13px] text-[var(--text-muted)] mb-4">
          These stay constant. Each month we rotate the case/theme within pillars.
        </p>
        <p className="text-[13px] text-[var(--text-disabled)] italic mb-4">
          No content pillars defined. Add your first pillar to structure your content strategy.
        </p>
        <button
          onClick={() =>
            addPillar({
              planId: contentPlan.id,
              name: 'New Pillar',
              description: '',
              formats: [],
              frequency: '',
              goal: '',
              color: DEFAULT_THEME_COLORS[0],
              targetPerMonth: 4,
            })
          }
          className="w-full flex items-center justify-center gap-1.5 border border-dashed border-[var(--border-default)] rounded-lg px-3 py-3 text-[var(--text-muted)] text-[12px] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          type="button"
        >
          <Plus size={12} />
          Add Pillar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[var(--text-muted)]">
          These stay constant. Each month we rotate the case/theme within pillars.
        </p>
      </div>

      <div className="space-y-3">
        {pillars.map((pillar, index) => {
          const progress = getPillarProgress(pillar.id);
          return (
            <div
              key={pillar.id}
              draggable
              onDragStart={() => handleDragStart(pillar.id)}
              onDragOver={(e) => handleDragOver(e, pillar.id)}
              onDragEnd={handleDragEnd}
              className={`group relative bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-5 ${
                draggedId === pillar.id ? 'opacity-50' : ''
              }`}
            >
              {/* Delete button */}
              <button
                onClick={() => deletePillar(pillar.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[var(--text-disabled)] hover:text-[#EF4444] transition-all"
                type="button"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3 mb-3">
                {/* Drag handle */}
                <GripVertical
                  size={14}
                  className="mt-1 text-[var(--text-disabled)] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)] text-[15px] font-semibold">
                      {index + 1}.
                    </span>
                    <InlineEdit
                      value={pillar.name}
                      onSave={(name) => updatePillar(pillar.id, { name })}
                      className="text-[15px] font-semibold text-[var(--text-primary)]"
                    />
                  </div>

                  {/* Color dot with picker */}
                  <div className="relative inline-block mt-1.5 mb-2">
                    <button
                      onClick={() =>
                        setColorPickerOpenId(
                          colorPickerOpenId === pillar.id ? null : pillar.id
                        )
                      }
                      className="w-12 h-1.5 rounded-full cursor-pointer hover:scale-x-110 transition-transform"
                      style={{ backgroundColor: pillar.color }}
                      type="button"
                    />
                    {colorPickerOpenId === pillar.id && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-xl p-2 flex gap-1.5">
                        {DEFAULT_THEME_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              updatePillar(pillar.id, { color });
                              setColorPickerOpenId(null);
                            }}
                            className={`w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform ${
                              pillar.color === color
                                ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-tertiary)] ring-[var(--text-primary)]'
                                : ''
                            }`}
                            style={{ backgroundColor: color }}
                            type="button"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <InlineEdit
                    value={pillar.description}
                    onSave={(description) => updatePillar(pillar.id, { description })}
                    className="text-[13px] text-[var(--text-secondary)]"
                    emptyText="Add description..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-[12px] mb-3 ml-[26px]">
                <div>
                  <span className="text-[var(--text-muted)]">Formats: </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Frequency: </span>
                  <InlineEdit
                    value={pillar.frequency}
                    onSave={(frequency) => updatePillar(pillar.id, { frequency })}
                    className="text-[12px] text-[var(--text-secondary)]"
                    emptyText="Set frequency..."
                  />
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Goal: </span>
                  <InlineEdit
                    value={pillar.goal}
                    onSave={(goal) => updatePillar(pillar.id, { goal })}
                    className="text-[12px] text-[var(--text-secondary)]"
                    emptyText="Set goal..."
                  />
                </div>
              </div>

              {/* Formats as editable list */}
              <div className="ml-[26px] mb-3">
                <EditableList
                  items={pillar.formats}
                  onAdd={(f) => updatePillar(pillar.id, { formats: [...pillar.formats, f] })}
                  onUpdate={(i, f) => {
                    const newFormats = [...pillar.formats];
                    newFormats[i] = f;
                    updatePillar(pillar.id, { formats: newFormats });
                  }}
                  onDelete={(i) =>
                    updatePillar(pillar.id, {
                      formats: pillar.formats.filter((_, idx) => idx !== i),
                    })
                  }
                  bulletIcon="→"
                  addLabel="Add format"
                />
              </div>

              {/* Target per month */}
              <div className="ml-[26px] mb-3 text-[12px]">
                <span className="text-[var(--text-muted)]">Target: </span>
                <InlineEdit
                  value={String(pillar.targetPerMonth)}
                  onSave={(val) => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      updatePillar(pillar.id, { targetPerMonth: parsed });
                    }
                  }}
                  className="text-[12px] text-[var(--text-secondary)]"
                />
                <span className="text-[var(--text-muted)]">/month</span>
              </div>

              {/* Progress bar */}
              <div className="ml-[26px] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    Progress This Month
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {progress.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress.percentage}%`,
                        backgroundColor: pillar.color,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] min-w-[80px] text-right">
                    Target: {progress.target} · Done: {progress.done}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Pillar button */}
      <button
        onClick={() =>
          addPillar({
            planId: contentPlan.id,
            name: 'New Pillar',
            description: '',
            formats: [],
            frequency: '',
            goal: '',
            color: DEFAULT_THEME_COLORS[pillars.length % DEFAULT_THEME_COLORS.length],
            targetPerMonth: 4,
          })
        }
        className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-[var(--border-default)] rounded-lg px-3 py-3 text-[var(--text-muted)] text-[12px] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
        type="button"
      >
        <Plus size={12} />
        Add Pillar
      </button>
    </div>
  );
}
