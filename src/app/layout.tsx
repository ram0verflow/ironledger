import { Inter, Roboto_Mono, Orbitron, Abril_Fatface } from 'next/font/google'
import "@/styles/globals.css"
export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' })
export const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })
export const abrilFatface = Abril_Fatface({ weight: '400', subsets: ['latin'], variable: '--font-abril-fatface' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${robotoMono.variable} ${orbitron.variable} ${abrilFatface.variable} font-mono bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
