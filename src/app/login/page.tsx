// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, WalletIcon } from "lucide-react"

// Replace with your government testnet address
const TESTNET_ADDRESS = process.env.NEXT_PUBLIC_TESTNET_ADDR;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if already logged in
        const address = localStorage.getItem('userAddress');
        if (address) {
            window.location.href = '/projects';
        }
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!window.unisat) {
                throw new Error('Please install Unisat wallet');
            }

            // Check network
            const network = await window.unisat.getNetwork();
            if (network !== 'testnet') {
                throw new Error('Please switch to testnet');
            }

            // Get account
            const [account] = await window.unisat.requestAccounts();
            console.log(account)
            if (account === TESTNET_ADDRESS) {
                localStorage.setItem('userAddress', account);
                window.location.href = '/projects';
            } else {
                throw new Error('Not authorized. Please use government wallet.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error instanceof Error ? error.message : 'Failed to connect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">IronLedger Login</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleConnect}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <WalletIcon className="mr-2 h-4 w-4" />
                        )}
                        Connect with Unisat
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Alert>
                        <AlertDescription className="text-center text-sm text-muted-foreground">
                            Connect using government wallet on testnet
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
}