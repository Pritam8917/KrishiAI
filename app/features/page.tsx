"use client";
import { Card, CardContent } from "@/app/components/ui/card";
import { TrendingUp, CheckCircle2 } from "lucide-react";
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
  // const router = useRouter();
  return (
    <>
      {/* ================= WHY KRISHIAI ================= */}
      <section className="py-20 md:py-24 bg-linear-to-b from-[#E9F4EE] via-[#F8F8F2] to-white relative overflow-hidden">
        {/* subtle background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)]"></div>

        <div className="container mx-auto px-6 md:px-12 relative">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center"
          >
            {/* LEFT CONTENT */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <div className="flex items-start gap-5">
                {/* VERTICAL LINE */}
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: "80px" }}
                  transition={{ duration: 0.6 }}
                  className="
      w-1 min-h-20
      bg-linear-to-b from-[#195733] to-[#2FA36B]
      rounded-full
      shadow-[0_0_12px_rgba(47,163,107,0.6)]
    "
                />

                {/* TEXT CONTENT */}
                <div>
                  {/* small premium badge */}
                  <motion.p
                    variants={fadeUp}
                    className="text-sm font-medium text-green-600 mb-2 tracking-wide"
                  >
                    🌱 Smart Farming Powered by AI
                  </motion.p>

                  <motion.h2
                    variants={fadeUp}
                    className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight"
                  >
                    Why Farmers Choose{" "}
                    <span className="bg-linear-to-r from-[#195733] to-[#2FA36B] bg-clip-text text-transparent">
                      KrishiAI
                    </span>
                  </motion.h2>

                  {/* extra premium subtext */}
                  <motion.p
                    variants={fadeUp}
                    className="text-muted-foreground max-w-xl text-base md:text-lg mb-10"
                  >
                    Empowering farmers with AI-driven insights, real-time
                    analytics, and precision agriculture tools to maximize
                    productivity and reduce risks.
                  </motion.p>
                </div>
              </div>

              {/* <motion.p
                variants={fadeUp}
                className="text-muted-foreground mb-10 max-w-xl"
              >
                KrishiAI combines satellite intelligence, weather insights, and
                AI models to help farmers make smarter decisions with
                confidence.
              </motion.p> */}

              {/* BENEFITS CARDS */}
              <motion.div
                variants={stagger}
                className="grid sm:grid-cols-2 gap-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="
                      group flex items-start gap-3 p-4 rounded-xl
                      bg-white/70 backdrop-blur-md border border-[#E6EFEA]
                      hover:shadow-lg transition
                    "
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#2FA36B] group-hover:scale-110 transition" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT CARD */}
            <motion.div
              variants={softFloat}
              animate="animate"
              className="relative"
            >
              {/* glow */}
              <div className="absolute inset-0 bg-linear-to-br from-[#2FA36B]/25 to-[#F4C430]/20 rounded-3xl blur-3xl opacity-40" />

              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10">
                AI Powered
              </div>

              <Card className="relative bg-white/85 backdrop-blur-xl border border-[#E6EFEA] shadow-xl rounded-3xl hover:scale-[1.02] transition duration-300">
                <CardContent className="p-8 space-y-6">
                  {/* TOP */}
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

                  {/* PROGRESS */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E6EFEA] overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 0.92 }}
                        transition={{
                          duration: 1.2,
                          ease: [0.25, 0.8, 0.25, 1], // buttery easing
                        }}
                        viewport={{ once: true }}
                        style={{ transformOrigin: "left" }}
                        className="h-full rounded-full bg-[#195733]"
                      />
                    </div>
                  </div>

                  {/* RECOMMENDATION */}
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
    </>
  );
}
