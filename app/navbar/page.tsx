"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Sprout,
  Leaf,
  X,
  Menu,
  AlertTriangle,
  LogIn,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const mobileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1], // ✅ TS-safe easing
      when: "beforeChildren" as const, // ✅ literal type
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const mobileItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  /* ---------------- AUTH STATE ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- NAV ITEMS ---------------- */
  const navItems = [
    { id: "home", label: "Home", icon: Sprout, href: "/" },
    {
      id: "problem",
      label: "Report Problem",
      icon: AlertTriangle,
      href: "/currentproblem",
    },
    {
      id: "crophealth",
      label: "Crop Health",
      icon: Leaf,
      href: "/crophealth",
    },
  ];

  /* ---------------- ACTIVE SECTION ---------------- */
  const activeSection =
    pathname === "/profile"
      ? "profile"
      : navItems.find(
          (item) =>
            pathname === item.href || pathname.startsWith(item.href + "/")
        )?.id;

  /* ---------------- COMMON BUTTON STYLE ---------------- */
  const navBtnBase =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer";

  const navBtnInactive = "text-[#1f643c] hover:text-black hover:bg-black/5";

  const navBtnActive = "bg-[#195733] text-white shadow-md";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/10 px-6 md:px-10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-[#195733] to-emerald-700 flex items-center justify-center shadow-lg">
                <Sprout className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            </div>

            <div className="hidden sm:block">
              <h1 className="font-display text-lg md:text-xl font-bold text-black">
                Krishi<span className="text-[#195733]">AI</span>
              </h1>
              <p className="text-[10px] md:text-xs text-[#195733] -mt-0.5">
                Smart Farming Solutions
              </p>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  navBtnBase,
                  activeSection === item.id ? navBtnActive : navBtnInactive
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}

            {/* LOGIN / PROFILE */}
            {!user ? (
              <button
                onClick={() => router.push("/auth/login")}
                className={cn(
                  navBtnBase,
                  activeSection === "login" ? navBtnActive : navBtnInactive
                )}
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            ) : (
              <button
                onClick={() => router.push("/profile")}
                className={cn(
                  navBtnBase,
                  activeSection === "profile" ? navBtnActive : navBtnInactive
                )}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-black/5  cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden py-4 border-t border-black/10 overflow-hidden"
            >
              <nav className="flex flex-col gap-2">
                {/* NAV ITEMS */}
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    variants={mobileItemVariants}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      activeSection === item.id
                        ? "bg-[#195733] text-white"
                        : "text-[#1f643c] hover:bg-black/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </motion.button>
                ))}

                {/* DIVIDER */}
                <div className="my-2 h-px bg-black/10" />

                {/* LOGIN / PROFILE */}
                {!user ? (
                  <motion.button
                    variants={mobileItemVariants}
                    onClick={() => {
                      router.push("/auth/login");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#1f643c] hover:bg-black/5"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </motion.button>
                ) : (
                  <motion.button
                    variants={mobileItemVariants}
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                      activeSection === "profile"
                        ? "bg-[#195733] text-white"
                        : "text-[#1f643c] hover:bg-black/5"
                    )}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </motion.button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
