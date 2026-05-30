'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, Copy, CheckCircle2, Link as LinkIcon
} from 'lucide-react'

export default function MentorDashboardPage() {
  const [mentor, setMentor] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadMentorData()
    const interval = setInterval(() => {
      loadMentorData()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadMentorData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: mentorData } = await supabase
      .from('mentors')
      .select('*, mentor_pairs(*)')
      .eq('id', user.id)
      .single()

    if (mentorData) {
      setMentor(mentorData)

      const { data: clientsData } = await supabase
        .from('client_subscriptions')
        .select('*, profiles(full_name, email)')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false })

      setClients(clientsData || [])
    }

    setIsLoading(false)
  }

  const handleCopy = () => {
    if (mentor) {
      const link = `${window.location.origin}/join?license=${mentor.license_key}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading...</div>

  if (!mentor) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Become a Mentor</h1>
        <p className="text-zinc-400 mb-6">Set up your trading signal service on AlphaDraft.</p>
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-zinc-400">
              Apply to become a mentor and start earning from your trading strategies. 
              Share your EA with clients and earn commission on every subscription.
            </p>
            <div className="flex gap-3">
              <a href="/become-mentor">
                <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">
                  Apply Now
                </Button>
              </a>
              <a href="/admin">
                <Button variant="outline">
                  Admin Panel
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/join?license=${mentor.license_key}`

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage your signal service and clients</p>
        </div>
        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/30">
          {mentor.subscription_status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Active Clients</div>
            <div className="text-2xl font-bold">{mentor.current_clients} / {mentor.max_clients}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">License Key</div>
            <div className="text-lg font-mono font-bold text-amber-400">{mentor.license_key}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Your Commission</div>
            <div className="text-2xl font-bold">{100 - mentor.commission_percent}%</div>
            <div className="text-xs text-zinc-500">AlphaDraft keeps {mentor.commission_percent}%</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Available Pairs</div>
            <div className="text-2xl font-bold">{mentor.mentor_pairs?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-amber-400" /> Client Invite Link
          </h3>
          <p className="text-sm text-zinc-400 mb-3">Share this link with clients. They'll auto-connect to your signals.</p>
          <div className="flex gap-2">
            <Input value={inviteLink} readOnly className="bg-zinc-950 border-zinc-800 font-mono text-sm" />
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Trading Pairs</h2>
        <div className="flex flex-wrap gap-2">
          {mentor.mentor_pairs?.map((pair: any) => (
            <Badge key={pair.id} variant="outline" className="text-sm px-3 py-1">
              {pair.symbol} ({pair.default_lots} lots)
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" /> Your Clients
        </h2>
        
        {clients.length > 0 ? (
          <div className="grid gap-4">
            {clients.map((client: any) => (
              <Card key={client.id} className="bg-zinc-900/30 border-zinc-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{client.profiles?.full_name || 'Anonymous'}</div>
                    <div className="text-sm text-zinc-500">{client.profiles?.email}</div>
                    <div className="text-xs text-zinc-600 mt-1">
                      Risk: {client.risk_mode} • {client.my_lot_size} lots • {client.selected_pairs?.length || 0} pairs
                    </div>
                  </div>
                  <Badge className={client.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}>
                    {client.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
            <CardContent className="p-8 text-center">
              <Users className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No clients yet. Share your invite link to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}