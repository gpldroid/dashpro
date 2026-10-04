"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

export const OWNER_USER_ID = "889f479f-766b-4bbf-b3be-043366800306";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const callbackUrl = () =>
  `${window.location.origin}/dashpro/auth/callback?next=/dashpro/dashboard`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const user = session?.user ?? null;

  useEffect(() => {
    let active = true;
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (nextSession?.user && nextSession.user.id !== OWNER_USER_ID) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        void Promise.resolve().then(() => supabase.auth.signOut());
        return;
      }
      setSession(nextSession);
      setProfile((current) =>
        nextSession?.user?.id === current?.id ? current : null
      );
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      const nextSession = error ? null : data.session;
      if (nextSession?.user && nextSession.user.id !== OWNER_USER_ID) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        void supabase.auth.signOut();
        return;
      }
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (active) setProfile(error ? null : data);
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [supabase, user]);

  const signInWithGithub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: callbackUrl(),
        scopes: "repo read:user user:email"
      }
    });
    if (error) throw error;
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }, [supabase]);

  const value = useMemo(
    () => ({ user, session, profile, loading, signInWithGithub, signOut }),
    [user, session, profile, loading, signInWithGithub, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider.");
  return context;
}
