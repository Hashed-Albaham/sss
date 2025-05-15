import type { Metadata } from 'next';
import { Cairo } from 'next/font/google'; // Changed from Noto_Sans
import './globals.css';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const cairo = Cairo({ // Changed from notoSans (Noto_Sans)
  variable: '--font-cairo', // Changed CSS variable name
  subsets: ['latin', 'arabic'], // Cairo supports Latin and Arabic
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
    <html lang="ar" dir="rtl">
      <body className={cn(cairo.variable, "antialiased font-sans flex flex-col min-h-screen")}>
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
