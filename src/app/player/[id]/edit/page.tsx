import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getDemoPlayer } from "@/services/player-service";
import { EditSurveyView } from "./EditSurveyView";

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const player = await getDemoPlayer(id);
    return {
        title: player ? `Edit ${player.name}'s Survey | CoachingCompass` : 'Edit Survey | CoachingCompass',
    };
}

export default async function EditSurveyPage({ params }: PageProps) {
    const { id } = await params;
    const seedPlayer = await getDemoPlayer(id);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-4">
                        <Button variant="outline" asChild>
                            <Link href={`/player/${id}`}>
                                <ChevronLeft />
                                Back to Profile
                            </Link>
                        </Button>
                    </div>
                    <EditSurveyView id={id} seedPlayer={seedPlayer} />
                </div>
            </main>
        </div>
    );
}
