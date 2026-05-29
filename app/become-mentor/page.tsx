'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function BecomeMentorPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    trading_experience: 'beginner',
    strategy_description: '',
    expected_pairs: 'XAUUSD, EURUSD, GBPUSD',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login?returnTo=/become-mentor'
        return
      }

      const pairs = formData.expected_pairs
        .split(',')
        .map(p => p.trim().toUpperCase())
        .filter(p => p)

      const { error } = await supabase.from('mentor_applications').insert({
        user_id: user.id,
        full_name: formData.full_name,
        email: user.email,
        trading_experience: formData.trading_experience,
        strategy_description: formData.strategy_description,
        expected_pairs: pairs,
      })

      if (error) throw error
      setSubmitted(true)

    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-zinc-400 mb-6">
              Our team will review your application and get back to you within 24 hours.
            </p>
            <Link href="/dashboard">
              <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-8 w-8 text-amber-400" />
            <span className="text-2xl font-bold">AlphaDraft</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Become a Mentor</h1>
          <p className="text-zinc-400">Share your trading strategies and earn commission from subscribers</p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="full_name">Full Name / Brand Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="e.g., Muiz Trading"
                  required
                  className="mt-1 bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <Label htmlFor="experience">Trading Experience</Label>
                <select
                  id="experience"
                  value={formData.trading_experience}
                  onChange={(e) => setFormData({...formData, trading_experience: e.target.value})}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3-5 years)</option>
                  <option value="professional">Professional (5+ years)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="strategy">Strategy Description</Label>
                <Textarea
                  id="strategy"
                  value={formData.strategy_description}
                  onChange={(e) => setFormData({...formData, strategy_description: e.target.value})}
                  placeholder="Describe your trading style, preferred markets, and what clients can expect..."
                  required
                  className="mt-1 bg-zinc-900 border-zinc-800 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="pairs">Expected Trading Pairs (comma separated)</Label>
                <Input
                  id="pairs"
                  value={formData.expected_pairs}
                  onChange={(e) => setFormData({...formData, expected_pairs: e.target.value})}
                  placeholder="XAUUSD, EURUSD, GBPUSD, BTCUSD"
                  required
                  className="mt-1 bg-zinc-900 border-zinc-800"
                />
                <p className="text-xs text-zinc-500 mt-1">These are the pairs your clients will be able to copy</p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already approved? <Link href="/login" className="text-amber-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
} 
