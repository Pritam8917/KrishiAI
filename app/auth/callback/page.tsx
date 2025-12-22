"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
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
        router.push("/farm-setup");
      } else {
        router.push("/home");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="relative z-10 flex flex-col items-center gap-4 text-center">
      <div className="h-16 w-16 flex items-center justify-center">
        <Sprout className="w-12 h-12 text-[#195733] animate-pulse" />
      </div>

      <p className="text-md font-medium text-[#195733]">
        Signing you in...
      </p>
    </div>
  );
}
