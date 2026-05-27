'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function JoinPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prefillLicense = searchParams.get('license') || ''
  
  const [licenseKey, setLicenseKey] = useState(prefillLicense)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleJoin = async () => {
    if (!licenseKey.trim()) return
    
    setIsJoining(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?returnTo=/join?license=${licenseKey}`)
        return
      }

      const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('license_key', licenseKey)
        .single()

      if (mentorError || !mentor) {
        throw new Error('Invalid license key')
      }

      if (!mentor.is_active) {
        throw new Error('This mentor is not currently active')
      }

      if (mentor.current_clients >= mentor.max_clients) {
        throw new Error('This mentor has reached their client limit')
      }

      const { error: subError } = await supabase
        .from('client_subscriptions')
        .insert({
          client_id: user.id,
          mentor_id: mentor.id,
          license_key: licenseKey,
          status: 'active',
        })

      if (subError) {
        if (subError.message.includes('duplicate')) {
          throw new Error('You are already subscribed to this mentor')
        }
        throw subError
      }

      await supabase
        .from('mentors')
        .update({ current_clients: mentor.current_clients + 1 })
        .eq('id', mentor.id)

      setSuccess(true)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsJoining(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You're Connected!</h2>
            <p className="text-zinc-400 mb-6">You can now configure your MT5 connection and risk settings.</p>
            <Link href="/client">
              <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">
                Go to Client Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Zap className="h-8 w-8 text-amber-400" />
            <span className="text-2xl font-bold">AlphaDraft</span>
          </Link>
          <h2 className="text-2xl font-bold">Join a Mentor</h2>
          <p className="text-zinc-400 mt-2">Enter your mentor's license key to start copying trades.</p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="license">License Key</Label>
              <Input
                id="license"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="e.g., MUIZ-001"
                className="mt-1 bg-zinc-900 border-zinc-800 font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button 
              onClick={handleJoin} 
              disabled={isJoining || !licenseKey.trim()}
              className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
            >
              {isJoining ? 'Connecting...' : 'Connect to Mentor'}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-zinc-500">
          Don't have a license? <Link href="/" className="text-amber-400 hover:underline">Browse mentors</Link>
        </p>
      </div>
    </div>
  )
} 
