
import Link from 'next/link';
import { BotIcon } from 'lucide-react'; 
import { ThemeToggleButton } from './theme-toggle-button';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <BotIcon className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">وكيل بلس</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggleButton />
          {/* Placeholder for future actions like user menu */}
        </div>
      </div>
    </header>
  );
}
