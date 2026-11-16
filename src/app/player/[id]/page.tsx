import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { getDemoPlayer } from '@/services/player-service';
import { PlayerProfileView } from './PlayerProfileView';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const player = await getDemoPlayer(id);
  return {
    title: player ? `${player.name} | CoachingCompass` : 'Player Profile | CoachingCompass',
  };
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const seedPlayer = await getDemoPlayer(id);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <PlayerProfileView id={id} seedPlayer={seedPlayer} />
      </main>
    </div>
  );
}
