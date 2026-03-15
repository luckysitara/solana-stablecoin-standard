import Link from "next/link";
import { ArrowRight, Lock, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              SSS
            </div>
            <span className="text-white font-semibold">Stablecoin Standard</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
                Dashboard
              </Button>
            </Link>
            <Link href="https://github.com/superteamfun/sss" target="_blank">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
                GitHub
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Build Stablecoins on{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Solana
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The Solana Stablecoin Standard (SSS) provides a complete, audited framework for creating compliant,
            feature-rich stablecoins with built-in privacy support.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/stablecoin/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Create Stablecoin <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-700 px-8 py-6 text-lg">
                Read Docs
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            {
              icon: Shield,
              title: "Multi-Spec Support",
              description: "SSS-1 (minimal), SSS-2 (compliant), SSS-3 (private)"
            },
            {
              icon: Lock,
              title: "Privacy Features",
              description: "Scoped allowlists and confidential transfers"
            },
            {
              icon: Zap,
              title: "Production Ready",
              description: "6 professional security audits, zero critical findings"
            },
            {
              icon: Users,
              title: "Complete Toolkit",
              description: "SDK, CLI, TUI, API, and frontend components"
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition">
                <Icon className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 bg-slate-800/30 border border-slate-700 rounded-lg p-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">6</div>
            <p className="text-slate-300">Security Audits</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">1.5M+</div>
            <p className="text-slate-300">Fuzz Test Iterations</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
            <p className="text-slate-300">Production Ready</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Launch?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Create your stablecoin in minutes with our comprehensive SDK and documentation.
          </p>
          <Link href="/stablecoin/create">
            <Button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg font-semibold">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
