import { Header } from "@/components/Header";
import { SurveyForm } from "./SurveyForm";

export const metadata = {
    title: 'Player Survey | CoachingCompass',
};

export default function SurveyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-headline font-bold text-primary">New Player Survey</h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            Welcome! Please fill out the form below to help us understand how to best coach you.
                        </p>
                    </div>
                    <SurveyForm />
                </div>
            </main>
        </div>
    );
}
