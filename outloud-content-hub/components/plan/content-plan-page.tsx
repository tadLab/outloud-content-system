'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useContentPlan } from '@/hooks/use-content-plan';
import { PlanStatusBanner } from './plan-status-banner';
import { OverviewTab } from './overview-tab';
import { PillarsTab } from './pillars-tab';
import { CadenceTab } from './cadence-tab';
import { WeeklyTab } from './weekly-tab';
import { MonthlyTab } from './monthly-tab';
import { TeamTab } from './team-tab';
import { PlanTab } from '@/types';
import { Trash2 } from 'lucide-react';

const PLAN_TABS: { id: PlanTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'pillars', label: 'Pillars' },
  { id: 'cadence', label: 'Cadence' },
  { id: 'weekly', label: 'Weekly Template' },
  { id: 'monthly', label: 'Monthly Program' },
  { id: 'team', label: 'Team & Workflow' },
];

export function ContentPlanPage() {
  // UI state from store
  const planTab = useAppStore((s) => s.planTab);
  const setPlanTab = useAppStore((s) => s.setPlanTab);

  // Clear functions from Supabase hook
  const {
    clearOverview,
    clearPillars,
    clearCadence,
    clearWeeklySlots,
    clearMonthly,
    clearTeamWorkflow,
  } = useContentPlan();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearSection = () => {
    switch (planTab) {
      case 'overview':
        clearOverview();
        break;
      case 'pillars':
        clearPillars();
        break;
      case 'cadence':
        clearCadence();
        break;
      case 'weekly':
        clearWeeklySlots();
        break;
      case 'monthly':
        clearMonthly();
        break;
      case 'team':
        clearTeamWorkflow();
        break;
    }
    setShowClearConfirm(false);
  };

  const currentTabLabel = PLAN_TABS.find((t) => t.id === planTab)?.label || '';

  const renderTabContent = () => {
    switch (planTab) {
      case 'overview':
        return <OverviewTab />;
      case 'pillars':
        return <PillarsTab />;
      case 'cadence':
        return <CadenceTab />;
      case 'weekly':
        return <WeeklyTab />;
      case 'monthly':
        return <MonthlyTab />;
      case 'team':
        return <TeamTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PlanStatusBanner />

      {/* Tab navigation */}
      <div className="flex items-center justify-between mb-6 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-1">
          {PLAN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlanTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
                planTab === tab.id
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
              {planTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Clear Section button */}
        <div className="relative">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--error)] rounded-md hover:bg-[var(--bg-tertiary)] transition-colors mb-1"
            type="button"
            title={`Clear ${currentTabLabel}`}
          >
            <Trash2 size={12} />
            Clear Section
          </button>

          {/* Confirmation popover */}
          {showClearConfirm && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowClearConfirm(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl shadow-2xl p-4 w-64">
                <p className="text-[13px] text-[var(--text-primary)] font-medium mb-1">
                  Clear {currentTabLabel}?
                </p>
                <p className="text-[12px] text-[var(--text-muted)] mb-4">
                  This will remove all content from this section so you can start fresh.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-3 py-1.5 text-[12px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearSection}
                    className="flex-1 px-3 py-1.5 text-[12px] text-white bg-[var(--error)] rounded-lg hover:opacity-90 transition-opacity"
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      {renderTabContent()}
    </div>
  );
}
