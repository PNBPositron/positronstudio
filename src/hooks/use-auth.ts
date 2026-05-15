import { useEffect } from "react";
import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthStore = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  set: (u: User | null, s: Session | null) => void;
  setLoading: (l: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  set: (user, session) => set({ user, session, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

let initialized = false;

export function useAuthInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().set(session?.user ?? null, session);
    });

    supabase.auth.getSession().then(({ data }) => {
      useAuthStore.getState().set(data.session?.user ?? null, data.session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);
}

export function useAuth() {
  return useAuthStore();
}

export async function signOut() {
  await supabase.auth.signOut();
}
