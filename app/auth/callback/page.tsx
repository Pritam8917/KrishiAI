"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      const { data: farm } = await supabase
        .from("farm_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!farm) {
        router.push("/components/farm-setup");
      } else {
        router.push("/components/home");
      }
    };

    handleRedirect();
  }, [router]);

  return <p className="p-6">Signing you in...</p>;
}
