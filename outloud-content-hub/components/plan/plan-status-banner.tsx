'use client';

import { useState, useRef, useEffect } from 'react';
import { useContentPlan } from '@/hooks/use-content-plan';
import { Copy, Archive, FileDown } from 'lucide-react';
import { InlineEdit } from './inline-edit';
import { PlanStatus } from '@/types';

const STATUS_OPTIONS: { value: PlanStatus; label: string; color: string }[] = [
  { value: 'active', label: 'ACTIVE', color: '#22C55E' },
  { value: 'draft', label: 'DRAFT', color: '#9A9A9A' },
  { value: 'archived', label: 'ARCHIVED', color: '#6A6A6A' },
];

export function PlanStatusBanner() {
  const { contentPlan, updateContentPlan } = useContentPlan();
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const now = new Date();
  const endDate = new Date(contentPlan.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;
  const isExpiring = daysRemaining >= 0 && daysRemaining <= 14;

  let statusColor = '#22C55E';
  let statusBg = '#22C55E15';
  let statusBorder = '#22C55E30';
  let statusLabel = 'ACTIVE';
  let statusMessage = `${daysRemaining} days remaining`;

  if (contentPlan.status === 'draft') {
    statusColor = '#9A9A9A';
    statusBg = '#9A9A9A15';
    statusBorder = '#9A9A9A30';
    statusLabel = 'DRAFT';
    statusMessage = 'In draft mode. Activate when ready.';
  } else if (contentPlan.status === 'archived') {
    statusColor = '#6A6A6A';
    statusBg = '#6A6A6A15';
    statusBorder = '#6A6A6A30';
    statusLabel = 'ARCHIVED';
    statusMessage = 'This plan is archived.';
  } else if (isExpired) {
    statusColor = '#EF4444';
    statusBg = '#EF444415';
    statusBorder = '#EF444430';
    statusLabel = 'EXPIRED';
    statusMessage = 'Plan has expired. No active content plan.';
  } else if (isExpiring) {
    statusColor = '#FFB800';
    statusBg = '#FFB80015';
    statusBorder = '#FFB80030';
    statusLabel = 'EXPIRING SOON';
    statusMessage = `Expires in ${daysRemaining} days. Time to prepare next quarter.`;
  }

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ backgroundColor: statusBg, border: `1px solid ${statusBorder}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <InlineEdit
              value={contentPlan.name}
              onSave={(name) => updateContentPlan({ name })}
              className="text-[16px] font-semibold text-[var(--text-primary)]"
            />
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
                type="button"
              >
                {statusLabel}
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        updateContentPlan({ status: opt.value });
                        setStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-[var(--bg-secondary)] transition-colors ${
                        contentPlan.status === opt.value ? 'bg-[var(--bg-secondary)]' : ''
                      }`}
                      type="button"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="text-[var(--text-primary)]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
            <input
              type="date"
              value={contentPlan.startDate}
              onChange={(e) => updateContentPlan({ startDate: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] text-[13px] text-[var(--text-secondary)] outline-none [color-scheme:dark] cursor-pointer"
            />
            <span className="text-[var(--text-disabled)]">&rarr;</span>
            <input
              type="date"
              value={contentPlan.endDate}
              onChange={(e) => updateContentPlan({ endDate: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] text-[13px] text-[var(--text-secondary)] outline-none [color-scheme:dark] cursor-pointer"
            />
            <span className="text-[var(--text-disabled)]">&middot;</span>
            <span style={{ color: statusColor }}>{statusMessage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-secondary)] text-[12px] hover:text-[var(--text-primary)] transition-colors">
            <Copy size={12} />
            Duplicate for Q2
          </button>
          <button className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-secondary)] text-[12px] hover:text-[var(--text-primary)] transition-colors">
            <Archive size={12} />
            Archive
          </button>
          <button className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[var(--text-secondary)] text-[12px] hover:text-[var(--text-primary)] transition-colors">
            <FileDown size={12} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
