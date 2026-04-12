'use client';

/**
 * Static Nutrition Section (Original implementation)
 * Fallback when adaptive targets feature flag is disabled
 */

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Settings, MessageCircle } from 'lucide-react';

export interface StaticNutritionSectionProps {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
  goalText: string;
  goalColor: string;
}

export function StaticNutritionSection({
  consumed,
  targets,
  goalText,
  goalColor,
}: StaticNutritionSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-[var(--theme-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Daily Nutrition</h2>
        </div>
        <Link href="/settings" className="text-sm text-[var(--theme-primary)] hover:underline flex items-center gap-1">
          <Settings className="h-3.5 w-3.5" />
          Adjust
        </Link>
      </div>

      {/* Nutrition Target Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Calories - Main */}
        <Link href="/nutrition" className="col-span-2 lg:col-span-1">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-[var(--theme-primary)] bg-[var(--theme-gradient-card)]">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-[var(--theme-primary-dark)]">
                  {Math.round(consumed.calories)} <span className="text-lg font-normal text-[var(--theme-text-secondary)]">/ {targets.calories || '—'}</span>
                </p>
                <p className="text-sm text-[var(--theme-text-secondary)] mt-1">calories</p>
                <div className="w-full bg-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((consumed.calories / (targets.calories || 1)) * 100, 100)}%`,
                      background: 'var(--theme-gradient-progress)'
                    }}
                  />
                </div>
                <p className={`text-xs font-medium mt-2 ${goalColor}`}>{goalText}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Protein */}
        <Link href="/nutrition">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--theme-secondary)]">
                  {Math.round(consumed.protein)}g <span className="text-sm font-normal text-[var(--theme-text-secondary)]">/ {targets.protein || '—'}g</span>
                </p>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Protein</p>
                <div className="w-full bg-[color-mix(in_srgb,var(--theme-secondary)_20%,transparent)] rounded-full h-1.5 mt-2">
                  <div
                    className="bg-[var(--theme-secondary)] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((consumed.protein / (targets.protein || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Carbs */}
        <Link href="/nutrition">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--theme-accent)]">
                  {Math.round(consumed.carbs)}g <span className="text-sm font-normal text-[var(--theme-text-secondary)]">/ {targets.carbs || '—'}g</span>
                </p>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Carbs</p>
                <div className="w-full bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] rounded-full h-1.5 mt-2">
                  <div
                    className="bg-[var(--theme-accent)] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((consumed.carbs / (targets.carbs || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Fat */}
        <Link href="/nutrition">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--theme-error)]">
                  {Math.round(consumed.fat)}g <span className="text-sm font-normal text-[var(--theme-text-secondary)]">/ {targets.fat || '—'}g</span>
                </p>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Fat</p>
                <div className="w-full bg-[color-mix(in_srgb,var(--theme-error)_20%,transparent)] rounded-full h-1.5 mt-2">
                  <div
                    className="bg-[var(--theme-error)] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((consumed.fat / (targets.fat || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick nutrition actions */}
      <div className="flex gap-2 mt-3">
        <Link href="/coach/nutrition" className="flex-1">
          <Button variant="secondary" className="w-full text-sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Nutrition Coach
          </Button>
        </Link>
      </div>
    </section>
  );
}
