import Link from 'next/link'
import { Search, LogIn, ArrowRight } from 'lucide-react'
import { orbitron } from './layout'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-mono">
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-16">
        <h2 className={`text-4xl sm:text-5xl text-foreground/100 md:text-6xl font-hero font-normal text-center mb-6 sm:mb-8 text-secondary leading-tight ${orbitron.className}`}>
          Welcome to<br />IronLedger
        </h2>
        <p className="text-center mb-8 sm:mb-16 max-w-2xl mx-auto text-foreground/80 text-base sm:text-lg leading-relaxed">
          IronLedger is a cutting-edge blockchain-based transparency system that tracks public development funds.
          Explore transactions or log in as a government official to manage and oversee fund allocation.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div className="border border-foreground/10 p-4 sm:p-6 hover:border-primary transition-all duration-300">
            <div className="flex items-center space-x-3 text-2xl sm:text-3xl font-display mb-4">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <span>Explorer</span>
            </div>
            <p className="text-foreground/80 text-sm sm:text-base mb-6">
              Access the public ledger to review all transactions, ensuring transparency and accountability in public fund management.
            </p>
            <Link
              href="/explorer"
              className="inline-flex items-center justify-center space-x-2 w-full border border-primary text-primary hover:bg-primary hover:text-background transition-colors duration-300 py-2 sm:py-3 text-sm sm:text-base"
            >
              <span>Go to Explorer</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>

          <div className="border border-foreground/10 p-4 sm:p-6 hover:border-secondary transition-all duration-300">
            <div className="flex items-center space-x-3 text-2xl sm:text-3xl font-display mb-4">
              <LogIn className="w-8 h-8  sm:w-10 sm:h-10 text-foreground/100" />
              <span>Government Login</span>
            </div>
            <p className="text-foreground/80 text-sm sm:text-base mb-6">
              Secure access for government officials to manage funds, approve transactions, and maintain the integrity of public development projects.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 w-full border border-primary text-primary hover:bg-primary hover:text-background transition-colors duration-300 py-2 sm:py-3 text-sm sm:text-base"

            >
              <span>Official Login</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

