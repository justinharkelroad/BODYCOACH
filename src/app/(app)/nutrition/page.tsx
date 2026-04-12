import { NutritionDashboard } from '@/features/nutrition';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nutrition | Standard Nutrition',
  description: 'Track your daily nutrition and macros',
};

export default function NutritionPage() {
  return <NutritionDashboard />;
}
