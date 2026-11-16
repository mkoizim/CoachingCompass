import Link from 'next/link';
import type { Player } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/player/${player.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <Avatar className="h-16 w-16 border-2 border-transparent group-hover:border-accent transition-colors">
            {player.avatarUrl ? (
              <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="headshot" />
            ) : null}
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <CardTitle className="font-headline text-xl truncate">{player.name}</CardTitle>
            <p className="text-muted-foreground">{player.position}</p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
