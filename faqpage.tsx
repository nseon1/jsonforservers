"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "What is the AI Discord Directory?",
    answer: "The AI Discord Directory is a curated collection of Discord servers focused on artificial intelligence, machine learning, and related topics. We provide quality scores, activity levels, and detailed descriptions to help you find the perfect community."
  },
  {
    question: "How are servers scored?",
    answer: "Servers are scored on a scale of 0-10 based on multiple factors including: activity level, quality of discussions, helpfulness of the community, moderation quality, and relevance to AI topics. Scores are periodically reviewed and updated."
  },
  {
    question: "What is the T-SNE view?",
    answer: "T-SNE (t-distributed Stochastic Neighbor Embedding) is a visualization technique that places similar servers closer together on a 2D map. This helps you discover servers that are similar to ones you already like. The colors represent score ranges: green for high scores (7-10), yellow (6-6.9), orange (5-5.9), and red for lower scores."
  },
  {
    question: "How does the Quadrant view work?",
    answer: "The Quadrant view lets you select two tags and see how servers are distributed based on whether they have those tags or not. This is useful for finding servers that match specific combinations of characteristics."
  },
  {
    question: "How can I submit a server?",
    answer: "To submit a new server for consideration, please reach out through our community channels. We review all submissions to ensure they meet our quality standards before adding them to the directory."
  },
  {
    question: "Why isn't my favorite server listed?",
    answer: "We may not know about it yet! The directory is community-driven, so if you know of a quality AI Discord server that should be included, please submit it for consideration."
  },
  {
    question: "How often is the data updated?",
    answer: "We aim to review and update server information regularly. Activity levels and scores may be adjusted based on periodic checks. If you notice outdated information, please let us know."
  },
  {
    question: "What do the activity tags mean?",
    answer: "Activity tags indicate how active a server is: 'Very Active' means constant activity, 'Active' means regular daily discussions, 'Semi Active' means periodic activity, 'Mostly Inactive' means occasional activity, and 'Dead' means little to no recent activity."
  },
  {
    question: "Can I filter out certain types of servers?",
    answer: "Yes! Use the Advanced Filters dropdown to include or exclude servers with specific tags. Click once to require a tag (green +), click twice to exclude it (red -), and click again to reset."
  },
  {
    question: "Is this project open source?",
    answer: "The directory data and frontend are maintained by the community. For contribution guidelines and more information, check our Credits page."
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-card rounded-xl border border-border bevel-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
      >
        <span className="font-semibold text-foreground">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
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
              <HelpCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to know about using the AI Discord Directory
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* Still have questions */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20 bevel-border text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              If you could not find what you were looking for, feel free to reach out to our community.
            </p>
            <Link href="/about">
              <Button variant="outline" className="bevel-border">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
