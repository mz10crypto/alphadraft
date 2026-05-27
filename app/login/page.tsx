'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, Code2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (mode === 'login') {
      await supabase.auth.signInWithPassword({ email, password })
    } else {
      await supabase.auth.signUp({ email, password })
    }
    setIsLoading(false)
  }

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Zap className="h-8 w-8 text-amber-400" />
            <span className="text-2xl font-bold">AlphaDraft</span>
          </Link>
          <h2 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-zinc-400 mt-2">Enter your credentials to access your workspace.</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="mt-1 bg-zinc-900 border-zinc-800" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="mt-1 bg-zinc-900 border-zinc-800" required />
          </div>
          <Button type="submit" className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300" disabled={isLoading}>
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-zinc-950 px-2 text-zinc-500">Or continue with</span></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGithub}>
          <Code2 className="mr-2 h-4 w-4" /> GitHub
        </Button>

        <p className="text-center text-sm text-zinc-500">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('signup')} className="text-amber-400 hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')} className="text-amber-400 hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}