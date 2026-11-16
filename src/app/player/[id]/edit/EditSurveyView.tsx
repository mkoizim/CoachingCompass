'use client';

import type { Player } from '@/lib/types';
import { LocalPlayerGate } from '@/components/LocalPlayerGate';
import { SurveyForm } from '@/app/survey/SurveyForm';

export function EditSurveyView({ id, seedPlayer }: { id: string; seedPlayer: Player | null }) {
  return (
    <LocalPlayerGate id={id} seedPlayer={seedPlayer}>
      {(player) => (
        <>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold text-primary">Edit Player Survey</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Update the survey responses for {player.name}.
            </p>
          </div>
          <SurveyForm key={player.id} player={player} />
        </>
      )}
    </LocalPlayerGate>
  );
}
