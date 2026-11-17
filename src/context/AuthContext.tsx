import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { handleAuthUrl } from '@/lib/authLink';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  username: string;
  xp: number;
  stars: number;
  level: number;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  linkError: string | null;
  clearLinkError: () => void;
  refreshProfile: () => Promise<void>;
  addXp: (amount: number) => Promise<Profile | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const clearLinkError = useCallback(() => setLinkError(null), []);

  // Confirmation e-mail link: starts the session automatically (no credentials needed).
  useEffect(() => {
    let active = true;
    const run = async (url: string | null) => {
      if (!url) return;
      const result = await handleAuthUrl(url);
      if (active && result.error) setLinkError(result.error);
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') run(window.location.href);
      return () => {
        active = false;
      };
    }

    Linking.getInitialURL().then(run);
    const sub = Linking.addEventListener('url', (e) => run(e.url));
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, xp, stars, level')
      .eq('id', userId)
      .maybeSingle();
    if (!error) setProfile(data as Profile | null);
    setProfileLoading(false);
  }, [userId]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const addXp = useCallback(async (amount: number) => {
    const { data, error } = await supabase.rpc('add_xp', { amount });
    if (error) throw error;
    const next = (data as Profile | null) ?? null;
    if (next) setProfile(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      linkError,
      clearLinkError,
      refreshProfile,
      addXp,
    }),
    [session, user, profile, loading, profileLoading, linkError, clearLinkError, refreshProfile, addXp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
