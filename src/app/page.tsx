// src/app/page.tsx
'use client'

import { useState } from 'react'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import { networks } from 'bitcoinjs-lib'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyRound, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as bitcoin from 'bitcoinjs-lib'
const ECPair = ECPairFactory(ecc)

export default function HomePage() {
  const [privateKey, setPrivateKey] = useState('')
  const [address, setAddress] = useState('')
  const { toast } = useToast()

  const generateNewKey = () => {
    try {
      const keyPair = ECPair.makeRandom({ network: networks.testnet })
      const wif = keyPair.toWIF()
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: networks.testnet
      })

      setPrivateKey(wif)
      setAddress(address || '')

      toast({
        title: "New Key Generated",
        description: "Make sure to save your private key securely."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate new key pair.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string, type: 'key' | 'address') => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type === 'key' ? 'Private key' : 'Address'} copied to clipboard.`
    })
  }

  return (
    <main className="container max-w-5xl py-10 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">IronLedger</h1>
        <p className="text-xl text-muted-foreground">
          Transparent public fund management through blockchain technology
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
            <CardDescription>Create and monitor public projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <a href="/projects/create">Create New Project</a>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <a href="/projects">View Projects</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testnet Key Management</CardTitle>
            <CardDescription>Generate and manage Bitcoin testnet keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={generateNewKey}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>

            {privateKey && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Private Key (WIF)</label>
                  <div className="flex gap-2">
                    <Input
                      value={privateKey}
                      readOnly
                      type="password"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(privateKey, 'key')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <div className="flex gap-2">
                    <Input
                      value={address}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(address, 'address')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <KeyRound className="h-4 w-4" />
                  <AlertDescription>
                    Get testnet coins from a faucet to start using this address.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertDescription className="text-center">
          Using Bitcoin Testnet for development. All transactions are for testing purposes only.
        </AlertDescription>
      </Alert>
    </main>
  )
}