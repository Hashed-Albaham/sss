import type { Metadata } from 'next';
import { GeistSans } from 'next/font/google'; // GeistSans already imported as geistSans
import './globals.css';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const geistSans = GeistSans({
  variable: '--font-geist-sans',
  subsets: ['latin', 'arabic'], // Ensure Arabic subset is included
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
      <body className={cn(geistSans.variable, "antialiased font-sans flex flex-col min-h-screen")}>
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
