import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (session) {
      router.replace("/");
    } else {
      router.replace("/auth/login");
    }
  }, [session, initialized]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Swift Mapper" }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
    </Stack>
  );
}
