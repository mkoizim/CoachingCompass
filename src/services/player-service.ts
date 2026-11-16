import 'server-only';

import { db } from '@/lib/firebase';
import type { Player } from '@/lib/types';
import { withDefaultStats } from '@/lib/stats';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

/**
 * Read-only access to the shared sample roster.
 *
 * The public demo never writes to Firestore: Security Rules only allow reads on
 * this collection. Anything a visitor adds or edits is stored in their own
 * browser (see src/lib/demo-store.ts).
 */
export const DEMO_COLLECTION = 'demoPlayers';

export async function getDemoPlayers(): Promise<Player[]> {
    try {
        const snapshot = await getDocs(collection(db, DEMO_COLLECTION));
        return snapshot.docs
            .map(d => withDefaultStats({ id: d.id, ...d.data() } as Player))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error('Failed to load demo roster from Firestore:', e);
        return [];
    }
}

export async function getDemoPlayer(id: string): Promise<Player | null> {
    try {
        const snap = await getDoc(doc(db, DEMO_COLLECTION, id));
        return snap.exists() ? withDefaultStats({ id: snap.id, ...snap.data() } as Player) : null;
    } catch (e) {
        console.error(`Failed to load demo player ${id}:`, e);
        return null;
    }
}
