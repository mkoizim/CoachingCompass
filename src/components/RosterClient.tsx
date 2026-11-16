'use client';

import { useState, useMemo } from 'react';
import type { Player } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { PlayerCard } from '@/components/PlayerCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { useRoster } from '@/lib/demo-store';

interface RosterClientProps {
  seedPlayers: Player[];
}

export function RosterClient({ seedPlayers }: RosterClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const players = useRoster(seedPlayers);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery) {
      return players;
    }
    return players.filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [players, searchQuery]);

  return (
    <div>
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
      </div>

      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-headline">No Players Found</h2>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? `Your search for "${searchQuery}" did not return any results.`
              : 'Get started by adding a new player.'}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4">
              <Link href="/add-player">
                <PlusCircle />
                Add New Player
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
