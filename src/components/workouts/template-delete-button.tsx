'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  templateId: string;
  templateName: string;
}

export function TemplateDeleteButton({ templateId, templateName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete the "${templateName}" template?`)) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId);
    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setIsDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      isLoading={isDeleting}
      aria-label="Delete template"
    >
      <Trash2 className="h-4 w-4 text-[var(--theme-error)]" />
    </Button>
  );
}
