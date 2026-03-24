"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // User profile for auto-fill
  userProfile: UserProfile | null;
  refreshProfile: () => Promise<void>;
}

interface UserProfile {
  skin_type_self: string;
  t_zone_oiliness: string;
  pore_size: string;
  acne_level: string;
  sensitivity: string;
  hydration: string;
  gender: string;
  age: string;
  climate: string;
  is_traveling: boolean;
  travel_climate: string;
  goal: string;
  skin_history: string;
}

const defaultProfile: UserProfile = {
  skin_type_self: "",
  t_zone_oiliness: "",
  pore_size: "",
  acne_level: "",
  sensitivity: "",
  hydration: "",
  gender: "",
  age: "",
  climate: "",
  is_traveling: false,
  travel_climate: "",
  goal: "",
  skin_history: "",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  userProfile: null,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        console.error("Failed to fetch user profile:", error);
        return;
      }
      
      if (data) {
        setUserProfile({
          skin_type_self: data.skin_type_self || "",
          t_zone_oiliness: data.t_zone_oiliness || "",
          pore_size: data.pore_size || "",
          acne_level: data.acne_level || "",
          sensitivity: data.sensitivity || "",
          hydration: data.hydration || "",
          gender: data.gender || "",
          age: data.age || "",
          climate: data.climate || "",
          is_traveling: data.is_traveling || false,
          travel_climate: data.travel_climate || "",
          goal: data.goal || "",
          skin_history: data.skin_history || "",
        });
      } else {
        setUserProfile(defaultProfile);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUserProfile(defaultProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/analyzer`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, userProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
