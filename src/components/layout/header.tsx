import { MainNav } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { WalletIcon } from "lucide-react"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold inline-block">IronLedger</span>
                    </Link>
                    <MainNav />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <WalletIcon className="h-4 w-4 mr-2" />
                        Connect Wallet
                    </Button>
                </div>
            </div>
        </header>
    )
}
