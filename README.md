# Milich Project Manager

وب‌اپ مدیریت پروژه‌ها و کارهای Milich.

## امکانات
- Next.js + React
- رابط RTL فارسی
- پروژه‌ها و Taskها با افزودن، ویرایش و حذف
- نسخه موبایل Responsive
- PWA و Add to Home Screen
- GitHub Pages deployment
- آماده اتصال به Supabase برای دیتابیس و Login

## پروژه‌های اولیه
1. الیت هوم
2. ادیامور
3. پلاتو برگر
4. استارویچ
5. عباس زاده
6. NexMad
7. سایت نظری
8. سایت الیت
9. سایت امینکو
10. اپ الیت

Taskهای اولیه عمداً خالی هستند.

## اجرای محلی
```bash
npm install
npm run dev
```

اگر متغیرهای Supabase تنظیم نشده باشند، اپ به‌صورت خودکار از LocalStorage استفاده می‌کند.

## GitHub Pages
Workflow داخل `.github/workflows/pages.yml` پروژه را به‌صورت Static Export می‌سازد و روی GitHub Pages منتشر می‌کند.

آدرس مورد انتظار:
`https://nexmad.github.io/milich-project-manager/`

## Supabase
فایل `supabase/schema.sql` شامل Schema و RLS امن برای اتصال دیتابیس است.
