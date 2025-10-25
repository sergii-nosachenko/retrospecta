import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      if (data.user) {
        // Create user in our database if they don't exist
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id: data.user.id },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                id: data.user.id,
                email: data.user.email!,
                name:
                  data.user.user_metadata.name ||
                  data.user.user_metadata.full_name,
                avatarUrl: data.user.user_metadata.avatar_url,
              },
            });
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue even if user creation fails - they're authenticated
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/decisions`);
}
