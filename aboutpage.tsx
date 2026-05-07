"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Users, Target, Globe } from "lucide-react"

export default function AboutPage() {
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
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">About AI Discord Directory</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Your comprehensive guide to discovering and joining the best AI-focused Discord communities
            </p>
          </div>

          {/* Mission */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The AI space moves fast, and finding quality communities can be challenging. 
                  Our mission is to curate and organize the best AI Discord servers, making it 
                  easy for researchers, developers, enthusiasts, and curious minds to find their 
                  perfect community.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">What We Offer</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Curated list of AI Discord servers with quality scores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Multiple viewing modes including T-SNE visualization for finding similar communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Advanced filtering by tags, activity level, and server characteristics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Regular updates to keep information current and accurate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Community */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Community-Driven</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This directory is built and maintained by the community, for the community. 
                  We rely on user submissions and feedback to keep our database accurate and up-to-date. 
                  If you know of a great AI Discord that should be listed, or if you notice any 
                  outdated information, please let us know!
                </p>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Scoring System</h2>
            <p className="text-muted-foreground mb-4">
              Each server is assigned a score from 0-10 based on multiple factors:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-excellent" />
                <span className="text-sm"><strong className="text-foreground">7-10:</strong> <span className="text-muted-foreground">Excellent - Highly recommended</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-good" />
                <span className="text-sm"><strong className="text-foreground">6-6.9:</strong> <span className="text-muted-foreground">Good - Worth checking out</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-medium" />
                <span className="text-sm"><strong className="text-foreground">5-5.9:</strong> <span className="text-muted-foreground">Medium - Has potential</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-low" />
                <span className="text-sm"><strong className="text-foreground">Below 5:</strong> <span className="text-muted-foreground">Lower quality or inactive</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
