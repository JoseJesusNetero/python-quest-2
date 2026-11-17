import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Values come from .env (EXPO_PUBLIC_*). Replace the fallbacks if you use another project.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR-ANON-KEY';

// During web server-side rendering there is no window, so AsyncStorage can't be used.
const isServer = Platform.OS === 'web' && typeof window === 'undefined';
const serverStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: isServer ? serverStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web the confirmation link returns to the app with the tokens in the URL.
    detectSessionInUrl: Platform.OS === 'web' && !isServer,
  },
});
