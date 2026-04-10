"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";

export default function CTAPage() {
  const router = useRouter();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#EEF6F1] to-[#E6F2EC] relative overflow-hidden">

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          viewport={{ once: true }}
          className="
      max-w-4xl mx-auto text-center
      bg-white
      border border-[#E2ECE6]
      rounded-3xl shadow-2xl
      p-10 md:p-14
      relative overflow-hidden
    "
        >
          {/* subtle gradient overlay (no blur) */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,#14532D_1px,transparent_0)]"></div>

          {/* top accent line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-[#14532D] via-[#2FA36B] to-[#14532D]" />

          {/* badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-[#DCFCE7] text-[#166534] text-sm px-4 py-1.5 rounded-full mb-5"
          >
            🚀 Trusted by 1,000+ farmers
          </motion.div>

          {/* heading */}
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl font-bold mb-5 leading-tight text-[#0F2E1C]"
          >
            Ready to Transform{" "}
            <span className="bg-linear-to-r from-[#14532D] to-[#2FA36B] bg-clip-text text-transparent">
              Your Farming?
            </span>
          </motion.h2>

          {/* description */}
          <motion.p
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="text-[#4B6356] max-w-2xl mx-auto mb-10 text-lg"
          >
            Join thousands of farmers using AI to improve crop health, reduce
            risk, and increase yield with smarter, data-driven decisions.
          </motion.p>

          {/* button */}
          <motion.div variants={fadeUp} transition={{ delay: 0.2 }}>
            <Button
              size="lg"
              onClick={() => router.push("/start-prediction")}
              className="
          relative overflow-hidden
          bg-linear-to-r from-[#14532D] to-[#2FA36B]
          text-white font-semibold px-12 py-6 rounded-xl
          shadow-xl text-lg
          hover:-translate-y-1 hover:shadow-2xl transition-all duration-300
        "
            >
              {/* shine */}
              <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition cursor-pointer"></span>
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
