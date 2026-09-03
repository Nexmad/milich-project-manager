import type { Metadata } from 'next';
import './globals.css';
import PwaRegister from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'Milich Project Manager',
  description: 'مدیریت پروژه‌ها و کارهای میلیچ'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
