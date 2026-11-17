import { Platform } from 'react-native';

import { mapLinkError } from '@/lib/authErrors';
import { supabase } from '@/lib/supabase';

export const AUTH_CALLBACK_PATH = 'auth/callback';

/**
 * Handles the link from the confirmation e-mail.
 * - Native: reads the tokens from the deep link and starts the session.
 * - Web: the Supabase client already reads the tokens from the URL; we only surface errors.
 */
export async function handleAuthUrl(url: string): Promise<{ handled: boolean; error?: string }> {
  if (!url || !url.includes(AUTH_CALLBACK_PATH)) return { handled: false };

  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  const params = new URLSearchParams(`${query}&${hash}`);

  const errorCode = params.get('error_code') ?? params.get('error');
  const errorDescription = params.get('error_description');
  if (errorCode || errorDescription) {
    return { handled: true, error: mapLinkError(errorCode, errorDescription) };
  }

  if (Platform.OS === 'web') return { handled: true };

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const code = params.get('code');

  try {
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return { handled: true, error: mapLinkError(null, error.message) };
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { handled: true, error: mapLinkError(null, error.message) };
    }
  } catch {
    return { handled: true, error: mapLinkError(null, null) };
  }
  return { handled: true };
}
