import { Header } from "@/components/Header";
import { AddPlayerClient } from "./AddPlayerClient";

export const metadata = {
  title: 'Add New Player | CoachingCompass',
};

export default function AddPlayerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <AddPlayerClient />
      </main>
    </div>
  );
}
