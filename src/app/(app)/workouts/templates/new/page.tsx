import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TemplateForm } from '@/components/workouts/template-form';

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workouts/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--theme-text)]">New Template</h1>
      </div>

      <TemplateForm mode="create" />
    </div>
  );
}
