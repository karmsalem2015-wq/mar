// src/middleware.ts
// Protects /mar-cp/* routes — redirects unauthenticated users to login

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith('/mar-cp')) {
    return NextResponse.next();
  }

  // Allow login page without auth
  if (pathname === '/mar-cp/login') {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseKey &&
    !supabaseKey.includes('anon_key_here');

  if (!isConfigured) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعداد الاتصال بقاعدة البيانات</title>
        <style>
          body {
            background-color: #0E1A2E;
            color: #E8EDF5;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: #132238;
            border-radius: 22px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 10px 10px 22px rgba(4, 8, 16, 0.7), -10px -10px 22px rgba(25, 45, 75, 0.15);
          }
          h1 {
            color: #C9A96E;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 16px;
          }
          p {
            color: #7A8FA8;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          code {
            display: block;
            background: #0A1420;
            padding: 12px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            color: #E8C98A;
            text-align: left;
            direction: ltr;
            margin-bottom: 20px;
            border: 1px solid rgba(201, 169, 110, 0.1);
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚠️ إعداد Supabase مطلوب</h1>
          <p>لتشغيل لوحة التحكم، يرجى وضع رابط مشروعك ومفاتيح الـ API الخاصة بـ Supabase داخل ملف <code>.env.local</code> في جذر المشروع المحلي.</p>
          <code>NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co<br>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</code>
          <p style="font-size: 12px; color: #4A6080; margin-bottom: 0;">بعد حفظ الملف، قم بإعادة تشغيل السيرفر المحلي (npm run dev) لتحديث الإعدادات.</p>
        </div>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if it exists
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no authenticated user, redirect to login
  if (error || !user) {
    const loginUrl = new URL('/mar-cp/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/mar-cp/:path*'],
};
