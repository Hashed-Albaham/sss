import Link from 'next/link';
import { BotIcon } from 'lucide-react'; // Using BotIcon as a generic agent/app icon

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <BotIcon className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">وكيل بلس</span>
        </Link>
        {/* Placeholder for future actions like theme toggle or user menu */}
        {/* <nav className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </nav> */}
      </div>
    </header>
  );
}
