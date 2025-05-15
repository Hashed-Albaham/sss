import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google'; // Changed from GeistSans
import './globals.css';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const notoSans = Noto_Sans({ // Changed from geistSans and GeistSans
  variable: '--font-noto-sans', // Changed CSS variable name
  subsets: ['latin', 'arabic'], // Ensure Arabic subset is included
  display: 'swap', // Added for better font loading behavior
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
    <html lang="ar" dir="rtl">
      <body className={cn(notoSans.variable, "antialiased font-sans flex flex-col min-h-screen")}>
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
