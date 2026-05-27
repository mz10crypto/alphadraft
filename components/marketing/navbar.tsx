'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X, Zap, TrendingUp } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            <span className="text-xl font-bold tracking-tight">AlphaDraft</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-zinc-400 hover:text-zinc-100 transition">Features</Link>
            <Link href="#strategies" className="text-sm text-zinc-400 hover:text-zinc-100 transition">Strategies</Link>
            <Link href="#copy-trading" className="text-sm text-zinc-400 hover:text-zinc-100 transition">Copy Trading</Link>
            <Link href="#pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-amber-400 text-zinc-950 hover:bg-amber-300">Start Trading</Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 space-y-4">
          <Link href="#features" className="block text-zinc-400">Features</Link>
          <Link href="#strategies" className="block text-zinc-400">Strategies</Link>
          <Link href="#copy-trading" className="block text-zinc-400">Copy Trading</Link>
          <Link href="#pricing" className="block text-zinc-400">Pricing</Link>
          <Link href="/login">
            <Button className="w-full bg-amber-400 text-zinc-950">Start Trading</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}