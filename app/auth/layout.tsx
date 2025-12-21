import { Toaster } from "sonner";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">

      {/* Gradient base */}
      <div className="absolute inset-0 bg-linear-to-br from-[#e6f4ea] to-white" />

      {/* Dot pattern */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle,rgba(25,87,51,0.25)_1px,transparent_1px)]
          bg-size-[22px_22px]
        "
      />

      {/* Card wrapper */}
      <div className="relative z-10 w-full align-middle flex flex-col items-center justify-center">
          <Toaster position="bottom-center" richColors />
        {children}
      </div>
    </div>
  );
}
