'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * Server action to authenticate a user with email and password
 *
 * Validates credentials using Supabase Auth and redirects to decisions page on success.
 * Revalidates the layout cache and handles authentication errors.
 *
 * @param formData - Form data containing email and password fields
 * @returns Error object if authentication fails, otherwise redirects
 *
 * @example
 * ```tsx
 * <form action={login}>
 *   <input name="email" type="email" required />
 *   <input name="password" type="password" required />
 *   <button type="submit">Login</button>
 * </form>
 * ```
 */
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

/**
 * Server action to register a new user account
 *
 * Creates a new user account in Supabase Auth and application database.
 * Sends email confirmation if required, otherwise logs user in immediately.
 * Handles user data creation/update using upsert pattern.
 *
 * @param formData - Form data containing email, password, and name fields
 * @returns Error object if registration fails, otherwise redirects
 *
 * @example
 * ```tsx
 * <form action={signup}>
 *   <input name="name" type="text" required />
 *   <input name="email" type="email" required />
 *   <input name="password" type="password" required />
 *   <button type="submit">Sign Up</button>
 * </form>
 * ```
 */
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

  if (!authData.session) {
    revalidatePath('/', 'layout');
    redirect(ROUTES.CONFIRM_EMAIL);
  }

  revalidatePath('/', 'layout');
  redirect(ROUTES.DECISIONS);
}

/**
 * Server action to sign out the current user
 *
 * Clears the authentication session and redirects to login page.
 * Revalidates the layout cache to clear any user-specific data.
 *
 * @example
 * ```tsx
 * <button onClick={() => signOut()}>Sign Out</button>
 * ```
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(ROUTES.LOGIN);
}

/**
 * Server action to initiate Google OAuth authentication
 *
 * Redirects user to Google OAuth consent screen.
 * After authorization, Google redirects back to the auth callback route.
 *
 * @returns Error object if OAuth initiation fails, otherwise redirects
 *
 * @example
 * ```tsx
 * <button onClick={() => signInWithGoogle()}>
 *   Sign in with Google
 * </button>
 * ```
 */
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

/**
 * Server action to get the currently authenticated user
 *
 * Fetches user data from both Supabase Auth and application database.
 * Combines data from both sources with database taking priority.
 * Returns null if user is not authenticated.
 *
 * @returns User object with id, email, name, and avatarUrl, or null if not authenticated
 *
 * @example
 * ```tsx
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log(`Welcome ${user.name}!`);
 * }
 * ```
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

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
