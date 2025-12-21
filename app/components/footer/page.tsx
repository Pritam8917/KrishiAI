import { Sparkles } from "lucide-react";
export default function  Footer () {
  return (
    <div>
        <footer className="py-8 bg-card border-t border-border px-15">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#195733] to-emerald-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">KrishiAI</h3>
                <p className="text-xs text-muted-foreground">Smart Farming Solutions</p>
              </div>
            </div>
            <p className="text-sm text-green-800">
              © {new Date().getFullYear()} KrishiAI. Empowering farmers with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

