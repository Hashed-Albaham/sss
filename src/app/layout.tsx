
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google'; // Changed from Noto_Sans
import './globals.css';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/common/theme-provider';

const cairo = Cairo({ 
  variable: '--font-cairo', 
  subsets: ['latin', 'arabic'], 
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'وكيل بلس | Agent Plus',
  description: 'إدارة وتفاعل متقدم مع الوكلاء الأذكياء',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn(cairo.variable, "antialiased font-sans flex flex-col min-h-screen")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <AppHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
