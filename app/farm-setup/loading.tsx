export default function Loading() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#F8F8F2] overflow-hidden">
      {/* dotted background */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_4px_4px,rgba(25,87,51,0.15)_3px,transparent_3px)]
          bg-size-[36px_36px]
          opacity-30
        "
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-[#195733] to-emerald-700 flex items-center justify-center shadow-lg animate-pulse">
          🌱
        </div>

        <p className="text-sm font-medium text-[#195733]">
          Preparing your farm details…
        </p>

        <p className="text-xs text-gray-500">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}
