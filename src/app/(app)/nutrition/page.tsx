import { NutritionDashboard } from '@/features/nutrition';
import { isNewUI } from '@/lib/feature-flags';
import { PageHeader } from '@/components/v2';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nutrition | Standard Nutrition',
  description: 'Track your daily nutrition and macros',
};

export default function NutritionPage() {
  if (isNewUI()) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Nutrition"
          subtitle="Track your daily food intake and macros"
        />
        <div className="rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
          <NutritionDashboard />
        </div>
      </div>
    );
  }
  return <NutritionDashboard />;
}
