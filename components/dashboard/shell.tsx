'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Target, Activity, Users, Settings, LogOut, 
  Zap, Menu, X, TrendingUp, Shield, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/strategies', label: 'AI Strategies', icon: Sparkles },
  { href: '/client', label: 'Copy Trading', icon: Target },
  { href: '/mentor', label: 'Mentor Hub', icon: Users },
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 py-6">
        <Zap className="h-6 w-6 text-amber-400" />
        <span className="font-bold text-lg">AlphaDraft</span>
        <Badge variant="outline" className="ml-auto text-xs border-amber-400/30 text-amber-400">PRO</Badge>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-amber-400/10 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-zinc-800 text-xs">{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-zinc-400" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <span className="font-bold">AlphaDraft</span>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800 p-0">
            <div className="flex flex-col h-full"><NavContent /></div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-zinc-800 bg-zinc-950">
          <NavContent />
        </aside>
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  )
}