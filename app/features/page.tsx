"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";

/* ================= Animations ================= */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const softFloat: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/* ================= Component ================= */

export default function Features() {
  const benefits = [
    "Increase crop yield by up to 30%",
    "Reduce resource wastage",
    "Early problem detection",
    "Data-driven farming decisions",
    "Personalized recommendations",
    "Track progress over time",
  ];

  return (
    <>
      {/* ================= WHY KRISHIAI ================= */}
      <section className="py-24 bg-linear-to-b from-[#E9F4EE] via-[#F8F8F2] to-white">
        <div className="container mx-auto px-15">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            {/* LEFT CONTENT */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl md:text-4xl font-bold mb-6"
              >
                Why Farmers Choose KrishiAI
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground mb-10 max-w-xl"
              >
                KrishiAI combines satellite intelligence, weather insights, and
                AI models to help farmers make smarter decisions with confidence.
              </motion.p>

              <motion.div
                variants={stagger}
                className="grid sm:grid-cols-2 gap-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#2FA36B]" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT VISUAL CARD */}
            <motion.div
              variants={softFloat}
              animate="animate"
              className="relative"
            >
              {/* Soft glow */}
              <div
                className="
                  absolute inset-0
                  bg-linear-to-br from-[#2FA36B]/25 to-[#F4C430]/20
                  rounded-3xl blur-3xl opacity-40
                "
              />

              <Card className="relative bg-white/85 backdrop-blur-xl border border-[#E6EFEA] shadow-xl rounded-3xl">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#195733] p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sample Predicted Yield
                      </p>
                      <p className="text-2xl font-bold">4,250 kg/ha</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E6EFEA] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "92%" }}
                        transition={{ duration: 1.2 }}
                        className="h-full rounded-full bg-linear-to-r from-[#195733] to-[#2FA36B]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E6EFEA]">
                    <p className="text-sm font-medium mb-2">
                      AI Recommendation
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Increase nitrogen application by 15% during flowering
                      stage to maximize yield.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >
            Ready to Transform Your Farming?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Join thousands of farmers who are already using AI to improve crop
            health, reduce risk, and increase yield.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              className="
                bg-linear-to-r from-[#195733] to-[#2FA36B]
                text-white font-semibold px-12 py-7 rounded-xl
                hover:opacity-90 hover:-translate-y-1 transition
                shadow-lg text-lg cursor-pointer
              "
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
