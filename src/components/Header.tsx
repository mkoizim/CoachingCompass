import Link from 'next/link';
import { Compass } from 'lucide-react';
import { DemoNotice } from '@/components/DemoNotice';

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3 text-primary transition-opacity hover:opacity-80"
          >
            <Compass className="h-8 w-8" />
            <span className="text-2xl font-headline font-bold">
              CoachingCompass
              <sup className="text-xs font-normal tracking-widest ml-1">PROTOTYPE</sup>
            </span>
          </Link>
        </div>
      </div>
      <DemoNotice />
    </header>
  );
}
