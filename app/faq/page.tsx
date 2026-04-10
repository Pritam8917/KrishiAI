"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [active, setActive] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does KrishiAI predict crop yield?",
      a: "KrishiAI uses satellite imagery, weather data, and machine learning models to analyze crop conditions and predict yield accurately.",
    },
    {
      q: "Is KrishiAI suitable for small farmers?",
      a: "Yes, KrishiAI is designed to support farmers of all scales by providing simple, actionable insights.",
    },
    {
      q: "Do I need technical knowledge to use it?",
      a: "No, the platform is built with a user-friendly interface so farmers can easily understand recommendations.",
    },
    {
      q: "How accurate are the predictions?",
      a: "Our AI models achieve high accuracy by combining real-time data with historical agricultural patterns.",
    },
    {
      q: "Can it help reduce farming risks?",
      a: "Yes, KrishiAI provides alerts on weather, pests, and soil health to help farmers take proactive actions.",
    },
  ];

  return (
    <section className="relative py-24 bg-[#F8F8F2] overflow-hidden ">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2FA36B]/10 to-[#195733]/10 blur-3xl opacity-40"></div>

      <div className="container mx-auto px-6 relative">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-green-600 font-medium mb-3">
            ❓ Frequently Asked Questions
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Got Questions?{" "}
            <span className="bg-linear-to-r from-[#195733] to-[#2FA36B] bg-clip-text text-transparent">
              We’ve Got Answers
            </span>
          </h2>

          <p className="text-muted-foreground text-lg">
            Everything you need to know about KrishiAI and how it helps farmers.
          </p>
        </motion.div>

        {/* FAQ LIST */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = active === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-[#E6EFEA] bg-white/80 backdrop-blur-xl shadow-md overflow-hidden"
              >
                {/* QUESTION */}
                <button
                  onClick={() => setActive(isOpen ? null : index)}
                  className="w-full flex justify-between items-center p-5 text-left cursor-pointer"
                >
                  <span className="font-medium">{faq.q}</span>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-green-600" />
                  </motion.div>
                </button>

                {/* ANSWER */}
                <AnimatePresence>
                  {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-gray-600 text-sm">
                          {faq.a}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}