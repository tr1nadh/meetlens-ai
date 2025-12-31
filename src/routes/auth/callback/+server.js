

import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/upload';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      throw redirect(303, next);
    }
  }

  // Return the user to an error page if it fails
  throw redirect(303, '/auth/auth-code-error');
};