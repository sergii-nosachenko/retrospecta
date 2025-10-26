import { NextResponse } from 'next/server';

import { ROUTES } from '@/constants/routes';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Supabase auth error:', error);
        return NextResponse.redirect(
          `${origin}${ROUTES.LOGIN}?error=auth_failed`
        );
      }

      if (data.user) {
        // Create or update user in our database
        try {
          await prisma.user.upsert({
            where: { id: data.user.id },
            create: {
              id: data.user.id,
              email: data.user.email!,
              name:
                (data.user.user_metadata.name as string | undefined) ??
                (data.user.user_metadata.full_name as string | undefined),
              avatarUrl: data.user.user_metadata.avatar_url as
                | string
                | undefined,
            },
            update: {
              name:
                (data.user.user_metadata.name as string | undefined) ??
                (data.user.user_metadata.full_name as string | undefined),
              avatarUrl: data.user.user_metadata.avatar_url as
                | string
                | undefined,
            },
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue even if user creation fails - they're authenticated
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        `${origin}${ROUTES.LOGIN}?error=callback_failed`
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${ROUTES.DECISIONS}`);
}
