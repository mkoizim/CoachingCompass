'use client';

import { useRouter } from 'next/navigation';
import { FlaskConical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetDemo, useHasLocalChanges } from '@/lib/demo-store';
import { useToast } from '@/hooks/use-toast';

export function DemoNotice() {
  const hasChanges = useHasLocalChanges();
  const router = useRouter();
  const { toast } = useToast();

  const handleReset = () => {
    resetDemo();
    toast({ title: 'Demo reset', description: 'The sample roster has been restored.' });
    router.push('/');
  };

  return (
    <div className="bg-accent/15 border-b text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-foreground">
          <FlaskConical className="h-4 w-4 shrink-0 text-primary" />
          <span>
            <strong>Live demo.</strong> Add players, take the survey, and leave notes freely. Your
            changes are saved only in this browser.
          </span>
        </p>
        {hasChanges && (
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw /> Reset demo
          </Button>
        )}
      </div>
    </div>
  );
}
