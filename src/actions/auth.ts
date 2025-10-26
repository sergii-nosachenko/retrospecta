'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(ROUTES.DECISIONS);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
      },
    },
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  if (authData.user) {
    // Create or update user in our database
    // Using upsert to handle cases where user signs up multiple times before confirming
    await prisma.user.upsert({
      where: { id: authData.user.id },
      create: {
        id: authData.user.id,
        email: authData.user.email!,
        name: data.options.data.name,
      },
      update: {
        name: data.options.data.name,
      },
    });
  }

  // Check if email confirmation is required
  // If session is null, user needs to confirm their email
  if (!authData.session) {
    revalidatePath('/', 'layout');
    redirect(ROUTES.CONFIRM_EMAIL);
  }

  revalidatePath('/', 'layout');
  redirect(ROUTES.DECISIONS);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(ROUTES.LOGIN);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${ROUTES.AUTH_CALLBACK}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get additional user data from our database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
    },
  });

  return {
    id: user.id,
    email: user.email ?? dbUser?.email ?? '',
    name:
      dbUser?.name ??
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'User',
    avatarUrl:
      dbUser?.avatarUrl ??
      (user.user_metadata?.avatar_url as string | undefined) ??
      null,
  };
}
