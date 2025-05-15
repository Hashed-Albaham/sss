'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, MessageSquare, GitCompareArrows, Share2, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/agents', label: 'إدارة الوكلاء', icon: Users },
  { href: '/chat', label: 'محادثة تفاعلية', icon: MessageSquare },
  { href: '/dialogue', label: 'حوار آلي', icon: Settings }, // Using Settings as placeholder, could be two message icons
  { href: '/compare', label: 'مقارنة الاستجابات', icon: GitCompareArrows },
  { href: '/pipelines', label: 'خطوط أنابيب الوكلاء', icon: Share2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-s bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start gap-3 text-base",
                pathname === item.href 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/70">© {new Date().getFullYear()} وكيل بلس</p>
      </div>
    </aside>
  );
}
