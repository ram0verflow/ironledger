// app/page.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: 'IronLedger - Transparent Fund Management',
  description: 'Track and verify public fund allocation with blockchain technology'
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to IronLedger
        </h1>
        <p className="text-xl text-muted-foreground">
          Bringing transparency to public fund management through blockchain technology
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Explore Projects</CardTitle>
            <CardDescription>
              View ongoing and completed public projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/explorer">Open Explorer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Manage projects and verify transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/wallet">Open Wallet</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}