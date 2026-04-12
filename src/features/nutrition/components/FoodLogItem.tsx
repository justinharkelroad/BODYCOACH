'use client';

import { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import type { FoodLog } from '../types/nutrition.types';
import { FoodLogFeedback } from '@/features/checkin';

interface FoodLogItemProps {
  log: FoodLog;
  onEdit?: (log: FoodLog) => void;
  onDelete?: (logId: string) => void;
  onUpdateServings?: (logId: string, servings: number) => void;
}

export function FoodLogItem({ log, onEdit, onDelete, onUpdateServings }: FoodLogItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const food = log.food;
  const time = new Date(log.logged_at).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(log.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleServingAdjust = (delta: number) => {
    if (!onUpdateServings) return;
    const newServings = Math.max(0.25, log.servings + delta);
    onUpdateServings(log.id, newServings);
  };

  return (
    <div
      className={`bg-[var(--theme-surface)] rounded-[16px] border border-[rgba(184,169,232,0.1)] overflow-hidden transition-all shadow-sm ${
        log.is_planned ? 'border-dashed opacity-75' : ''
      }`}
    >
      {/* Main row - tap to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        {/* Time */}
        <span className="text-xs text-[var(--neutral-gray)] w-14 flex-shrink-0">
          {time}
        </span>

        {/* Food info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[var(--neutral-dark)] truncate">
            {food?.name || 'Unknown Food'}
          </div>
          {food?.brand && (
            <div className="text-xs text-[var(--neutral-gray)] truncate">
              {food.brand}
            </div>
          )}
          <div className="text-xs text-[var(--neutral-gray)]">
            {log.servings !== 1 && `${log.servings}× `}
            {food?.serving_size}{food?.serving_unit}
          </div>
        </div>

        {/* Calories */}
        <div className="text-right flex-shrink-0">
          <div className="font-semibold text-orange-500">
            {Math.round(log.calories_logged || 0)}
          </div>
          <div className="text-xs text-[var(--neutral-gray)]">cal</div>
        </div>

        {/* Expand indicator */}
        <div className="text-[var(--neutral-gray)]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-[rgba(184,169,232,0.1)]">
          {/* Macros row */}
          <div className="flex gap-4 py-2 text-sm">
            <div className="flex-1 text-center">
              <div className="font-medium text-red-500">
                {Math.round(log.protein_logged || 0)}g
              </div>
              <div className="text-xs text-[var(--neutral-gray)]">Protein</div>
            </div>
            <div className="flex-1 text-center">
              <div className="font-medium text-blue-500">
                {Math.round(log.carbs_logged || 0)}g
              </div>
              <div className="text-xs text-[var(--neutral-gray)]">Carbs</div>
            </div>
            <div className="flex-1 text-center">
              <div className="font-medium text-yellow-500">
                {Math.round(log.fat_logged || 0)}g
              </div>
              <div className="text-xs text-[var(--neutral-gray)]">Fat</div>
            </div>
          </div>

          {/* Serving adjuster */}
          {onUpdateServings && (
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleServingAdjust(-0.25);
                }}
                className="w-10 h-10 rounded-full bg-[var(--neutral-gray-light)] flex items-center justify-center text-lg font-bold text-[var(--neutral-dark)] active:bg-[rgba(184,169,232,0.2)]"
              >
                −
              </button>
              <span className="text-lg font-medium w-16 text-center text-[var(--neutral-dark)]">
                {log.servings}×
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleServingAdjust(0.25);
                }}
                className="w-10 h-10 rounded-full bg-[var(--neutral-gray-light)] flex items-center justify-center text-lg font-bold text-[var(--neutral-dark)] active:bg-[rgba(184,169,232,0.2)]"
              >
                +
              </button>
            </div>
          )}

          {/* Notes */}
          {log.notes && (
            <div className="text-sm text-[var(--neutral-gray)] py-2 italic">
              {log.notes}
            </div>
          )}

          {/* Feedback (thumbs up/down) */}
          <FoodLogFeedback
            foodLogId={log.id}
            initialFeltGood={log.felt_good}
            initialNotes={log.notes}
            className="py-2 border-t border-[rgba(184,169,232,0.1)]"
          />

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(log);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-[var(--neutral-dark)] bg-[var(--neutral-gray-light)] rounded-lg"
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-[var(--accent-coral)] bg-red-50 rounded-lg disabled:opacity-50"
              >
                <Trash2 size={14} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FoodLogListProps {
  logs: FoodLog[];
  onEdit?: (log: FoodLog) => void;
  onDelete?: (logId: string) => void;
  onUpdateServings?: (logId: string, servings: number) => void;
  emptyMessage?: string;
}

export function FoodLogList({
  logs,
  onEdit,
  onDelete,
  onUpdateServings,
  emptyMessage = "No foods logged yet"
}: FoodLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--neutral-gray)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map(log => (
        <FoodLogItem
          key={log.id}
          log={log}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateServings={onUpdateServings}
        />
      ))}
    </div>
  );
}
