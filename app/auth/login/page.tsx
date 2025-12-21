"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { Sprout } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------- REDIRECT LOGIC -------------------- */
  const redirectAfterLogin = async (userId: string) => {
    const { data: farmProfile } = await supabase
      .from("farm_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!farmProfile) {
      router.push("/farm-setup");
    } else {
      router.push("/crop-health");
    }
  };

  /* -------------------- EMAIL LOGIN -------------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      await redirectAfterLogin(data.user.id);
    }
  };

  /* -------------------- GOOGLE LOGIN -------------------- */
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-linear-to-br from-[#195733] to-emerald-700 flex items-center justify-center shadow-glow">
            <Sprout className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">KrishiAI</CardTitle>
        <CardDescription>Please sign in to continue</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#17694B] text-white hover:bg-[#17694B]/90 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>

          <div className="flex items-center my-4">
            <div className="grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">or</span>
            <div className="grow border-t border-gray-300" />
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-100 cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <Image
              src="/assets/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            Continue with Google
          </Button>
        </form>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="underline">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
