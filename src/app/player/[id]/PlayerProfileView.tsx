'use client';

import type { Player } from '@/lib/types';
import { LocalPlayerGate } from '@/components/LocalPlayerGate';
import { PlayerProfileClient } from './PlayerProfileClient';

export function PlayerProfileView({ id, seedPlayer }: { id: string; seedPlayer: Player | null }) {
  return (
    <LocalPlayerGate id={id} seedPlayer={seedPlayer}>
      {(player) => <PlayerProfileClient player={player} />}
    </LocalPlayerGate>
  );
}
