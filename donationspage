"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Wallet, Copy, Check, Coffee } from "lucide-react"
import { useState } from "react"

const cryptoAddresses = [
  {
    name: "Bitcoin (BTC)",
    address: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    icon: "₿",
    color: "from-orange-500 to-orange-600"
  },
  {
    name: "Ethereum (ETH)",
    address: "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    icon: "Ξ",
    color: "from-indigo-500 to-purple-600"
  },
  {
    name: "Solana (SOL)",
    address: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    icon: "◎",
    color: "from-purple-500 to-pink-500"
  }
]

function CryptoCard({ name, address, icon, color }: { name: string; address: string; icon: string; color: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card rounded-xl border border-border bevel-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-lg`}>
          {icon}
        </div>
        <span className="font-semibold text-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 overflow-hidden text-ellipsis">
          {address}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex-shrink-0 bevel-border"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default function DonationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center bevel-border glow-gold">
              <Heart className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Support the Project</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Help us keep the AI Discord Directory running and growing
            </p>
          </div>

          {/* Why Donate */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Why Donate?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The AI Discord Directory is a free, community-driven project. Your donations help cover:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Hosting and infrastructure costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Time spent curating and updating server information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Development of new features and improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Community outreach and support</span>
              </li>
            </ul>
          </div>

          {/* Traditional Donations */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              Buy Us a Coffee
            </h2>
            <p className="text-muted-foreground mb-4">
              Show your appreciation with a small donation through these platforms:
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bevel-border" disabled>
                Ko-fi (Coming Soon)
              </Button>
              <Button variant="outline" className="bevel-border" disabled>
                Buy Me a Coffee (Coming Soon)
              </Button>
              <Button variant="outline" className="bevel-border" disabled>
                Patreon (Coming Soon)
              </Button>
            </div>
          </div>

          {/* Crypto Donations */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Cryptocurrency
            </h2>
            <p className="text-muted-foreground mb-4">
              Prefer crypto? Send donations to any of these addresses:
            </p>
            <div className="space-y-3">
              {cryptoAddresses.map((crypto) => (
                <CryptoCard key={crypto.name} {...crypto} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Note: These are placeholder addresses. Real addresses will be provided soon.
            </p>
          </div>

          {/* Thank You */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20 bevel-border text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              Every contribution, no matter how small, helps us continue improving the 
              AI Discord Directory. We truly appreciate your support!
            </p>
          </div>

          {/* Non-monetary ways to help */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Other Ways to Help</h2>
            <p className="text-muted-foreground mb-4">
              Do not have the means to donate? No worries! Here are other ways you can support us:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Submit new servers to be listed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Report outdated or incorrect information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Share the directory with others in the AI community</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Provide feedback and suggestions for improvements</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
