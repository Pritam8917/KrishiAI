import { ShieldCheck, Users, Globe, Database, Lock } from "lucide-react";

export default function AfterFeaturesSections() {
  return (
    <>
      {/* ================= WHO IS THIS FOR ================= */}
      <section className="py-28 bg-linear-to-b from-[#F4FAF6] via-[#F8F8F2] to-white">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold relative inline-block">
              Who Is KrishiAI For?
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-20 h-1 rounded-full bg-linear-to-r from-[#195733] to-[#2FA36B]" />
            </h2>
            <p className="text-muted-foreground mt-6">
              Built to support every stakeholder in modern agriculture
            </p>
          </div>

          {/* Icon Rows */}
          <div className="max-w-4xl mx-auto space-y-10">
            <Row
              icon={Users}
              title="Small Farmers"
              desc="Simple AI guidance to improve daily farming decisions"
            />
            <Divider />
            <Row
              icon={Globe}
              title="Large Farms & FPOs"
              desc="Scalable insights for managing large land holdings efficiently"
            />
            <Divider />
            <Row
              icon={Database}
              title="Students & Researchers"
              desc="Reliable data-driven insights for learning and experimentation"
            />
            <Divider />
            <Row
              icon={ShieldCheck}
              title="Government & NGOs"
              desc="Village-level intelligence for planning and policy support"
            />
          </div>
        </div>
      </section>

      {/* ================= DATA PRIVACY ================= */}
      {/* ================= DATA PRIVACY ================= */}
<section className="py-28 bg-white">
  <div className="container mx-auto px-6 max-w-5xl">
    {/* Heading */}
    <div className="text-center mb-20">
      <h2 className="text-3xl md:text-4xl font-bold relative inline-block">
        Your Data Is Safe
        <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 
                         w-16 h-1 rounded-full 
                         bg-linear-to-r from-[#195733] to-[#2FA36B]" />
      </h2>
      <p className="text-muted-foreground mt-6">
        Built with privacy-first principles for farmers
      </p>
    </div>

    {/* Privacy Cards */}
    <div className="grid gap-6 md:grid-cols-3">
      <PrivacyCard
        icon={Lock}
        title="Private by Default"
        text="Your farm data is encrypted and visible only to you."
      />
      <PrivacyCard
        icon={ShieldCheck}
        title="Consent-Based Access"
        text="We never share your data without explicit permission."
      />
      <PrivacyCard
        icon={Database}
        title="Secure Infrastructure"
        text="Protected storage with strict access controls."
      />
    </div>
  </div>
</section>

    </>
  );
}

/* ================= UI PARTS ================= */

function Row({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-12 h-12 rounded-xl bg-[#195733]/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-[#195733]" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-xl">{desc}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#E6EFEA]" />;
}

function PrivacyCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        rounded-3xl p-8 text-center
        bg-[#F8F8F2]
        border border-[#E6EFEA]
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
      "
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl 
                      bg-[#195733]/10 flex items-center justify-center">
        <Icon className="w-7 h-7 text-[#195733]" />
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

