import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";

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
      <section
        className="
          py-24
          bg-linear-to-b from-[#E9F4EE] via-[#F8F8F2] to-white
        "
      >
        <div className="container mx-auto px-15">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT CONTENT */}
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Why Farmers Choose KrishiAI
              </h2>

              <p className="text-muted-foreground mb-10 max-w-xl">
                KrishiAI combines satellite intelligence, weather insights, and
                AI models to help farmers make smarter decisions with confidence.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#2FA36B]" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT VISUAL CARD */}
            <div className="relative">
              {/* Soft glow */}
              <div
                className="
                  absolute inset-0
                  bg-linear-to-br from-[#2FA36B]/25 to-[#F4C430]/20
                  rounded-3xl blur-3xl opacity-40
                "
              />

              <Card
                className="
                  relative
                  bg-white/85 backdrop-blur-xl
                  border border-[#E6EFEA]
                  shadow-xl rounded-3xl
                "
              >
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
                    <div className="h-2 rounded-full bg-[#E6EFEA]">
                      <div className="h-full w-[92%] rounded-full bg-linear-to-r from-[#195733] to-[#2FA36B]" />
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
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Farming?
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Join thousands of farmers who are already using AI to improve crop
            health, reduce risk, and increase yield.
          </p>

          <Button
            size="lg"
            className="
              bg-linear-to-r from-[#195733] to-[#2FA36B]
              text-white font-semibold px-12 py-7 rounded-xl
              hover:opacity-90 hover:-translate-y-0.5 transition
              shadow-lg text-lg cursor-pointer
            "
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </>
  );
}
