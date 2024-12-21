// src/components/wallet/wallet-connect.tsx
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { WalletIcon, ExternalLink } from "lucide-react"

export function WalletConnect() {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Connect Wallet</CardTitle>
                <CardDescription>
                    Connect your Bitcoin wallet to start using IronLedger
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                    <WalletIcon className="mr-2 h-4 w-4" />
                    Connect Unisat Wallet
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Install Unisat Wallet
                </Button>
            </CardContent>
        </Card>
    )
}