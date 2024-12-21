import { Inter, Roboto_Mono, Orbitron, Abril_Fatface } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeSwitcher } from '@/components/theme-switcher'
import './globals.css'
import Link from 'next/link'

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' })
export const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })
export const abrilFatface = Abril_Fatface({ weight: '400', subsets: ['latin'], variable: '--font-abril-fatface' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} ${orbitron.variable} ${abrilFatface.variable} font-mono bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-foreground/10 py-4">
              <div className="container mx-auto px-4 flex flex-wrap justify-between items-center">
                <Link href="/">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary flex items-center justify-center">
                      <span className="text-primary font-display font-bold text-lg sm:text-xl">IL</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-primary">
                      IronLedger
                    </h1>
                  </div>
                </Link>
                <ThemeSwitcher />
              </div>
            </header>
            <main className="flex-grow">
              {children}
            </main>
            <footer className="border-t border-foreground/10 py-6">
              <div className="container mx-auto px-4 text-center">
                <p className="text-foreground/60 text-xs sm:text-sm">&copy; 2023 IronLedger. All rights reserved.</p>
                <p className="mt-2 text-foreground/40 text-xs">Empowering transparency and accountability through blockchain technology.</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

