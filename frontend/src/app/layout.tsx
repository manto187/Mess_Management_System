import type { Metadata } from 'next';
import { Inter, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/store/auth.context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const urdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  variable: '--font-urdu',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'میس مینجمنٹ سسٹم',
  description: 'Mess Management System — ممبران، کھانا، اخراجات اور ادائیگیاں',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" dir="rtl">
      <body className={`${inter.variable} ${urdu.variable} font-urdu antialiased bg-slate-50`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
