'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Player } from '@/lib/types';
import { usePlayer, useHydrated } from '@/lib/demo-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface LocalPlayerGateProps {
  id: string;
  /** The shared sample player from Firestore, if this id is one. */
  seedPlayer: Player | null;
  children: (player: Player) => ReactNode;
}

/**
 * Resolves a player from the shared roster plus this browser's local changes.
 * Players created in the demo exist only in localStorage, so they can't be
 * found until the client has hydrated.
 */
export function LocalPlayerGate({ id, seedPlayer, children }: LocalPlayerGateProps) {
  const hydrated = useHydrated();
  const player = usePlayer(id, seedPlayer);

  if (!player) {
    if (!hydrated) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-headline">Player Not Found</h2>
        <p className="text-muted-foreground mt-2">
          This player may have been deleted, or was created in a different browser.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Roster</Link>
        </Button>
      </div>
    );
  }

  // Remount once after hydration so client state starts from the local version.
  return <div key={hydrated ? 'client' : 'server'}>{children(player)}</div>;
}
