import Link from 'next/link'
import { Search, Lock, ArrowRight } from 'lucide-react'
import { orbitron } from './layout'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-mono">
      <header className="border-b border-foreground/10 py-6">
        <div className="container mx-auto px-4 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 border-2 border-primary flex items-center justify-center">
              <span className="text-primary font-display font-bold text-2xl">IL</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-primary">
              IronLedger
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16">
        <h2 className={`text-8xl text-white font-bold font-hero  text-center mb-8 text-secondary leading-tight ${orbitron.className}`}>
          Welcome to<br />IronLedger
        </h2>
        <p className="text-center mb-16 max-w-2xl mx-auto text-foreground/80 text-lg leading-relaxed">
          IronLedger is a cutting-edge blockchain-based transparency system that tracks public development funds.
          Explore transactions or manage your wallet to participate in our ecosystem and help build a more accountable future.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="border border-foreground/10 p-6 hover:border-primary transition-all duration-300">
            <div className="flex items-center space-x-3 text-3xl font-display mb-4">
              <Search className="w-10 h-10 text-primary" />
              <span>Explorer</span>
            </div>
            <p className="text-foreground/80 text-lg mb-6">
              Access the public ledger to review all transactions, ensuring transparency and accountability in public fund management.
            </p>
            <Link
              href="/explorer"
              className="inline-flex items-center justify-center space-x-2 w-full border border-primary text-primary hover:bg-primary hover:text-background transition-colors duration-300 py-3 text-lg"
            >
              <span>Go to Explorer</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="border border-foreground/10 p-6 hover:border-secondary transition-all duration-300">
            <div className="flex items-center space-x-3 text-3xl font-display mb-4">
              <Lock className="w-10 text-white h-10 text-secondary" />
              <span>Government Login</span>
            </div>
            <p className="text-foreground/80 text-lg mb-6">
              Secure access for government officials to manage funds, approve transactions, and maintain the integrity of public development projects.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 w-full border border-primary text-primary hover:bg-primary hover:text-background transition-colors duration-300 py-3 text-lg"
            >
              <span>Official Login</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-foreground/10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground/60 text-sm">&copy; 2023 IronLedger. All rights reserved.</p>
          <p className="mt-2 text-foreground/40 text-xs">Empowering transparency and accountability through blockchain technology.</p>
        </div>
      </footer>
    </div>
  )
}

