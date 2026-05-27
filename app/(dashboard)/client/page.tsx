'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, Link, CheckCircle2,
  AlertTriangle, Target, Shield
} from 'lucide-react'

export default function ClientDashboardPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [mentor, setMentor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // Mentor pairs (populated from DB)
  const [mentorPairs, setMentorPairs] = useState<any[]>([])

  // MT5 Connection State
  const [mt5Login, setMt5Login] = useState('')
  const [mt5Password, setMt5Password] = useState('')
  const [mt5Server, setMt5Server] = useState('')
  const [brokerName, setBrokerName] = useState('')

  // Risk Settings
  const [riskMode, setRiskMode] = useState('fixed_lot')
  const [lotSize, setLotSize] = useState('0.01')
  const [maxTrades, setMaxTrades] = useState('1')
  const [selectedPairs, setSelectedPairs] = useState<string[]>([])

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data: sub } = await supabase
      .from('client_subscriptions')
      .select('*, mentors(*)')
      .eq('client_id', user.id)
      .single()

    if (sub) {
      setSubscription(sub)
      setMentor(sub.mentors)
      setMt5Login(sub.mt5_login || '')
      setMt5Server(sub.mt5_server || '')
      setBrokerName(sub.broker_name || '')
      setRiskMode(sub.risk_mode || 'fixed_lot')
      setLotSize(sub.my_lot_size?.toString() || '0.01')
      setMaxTrades(sub.max_trades_per_signal?.toString() || '1')
      setSelectedPairs(sub.selected_pairs || [])

      // Fetch mentor pairs separately
      const { data: pairs } = await supabase
        .from('mentor_pairs')
        .select('*')
        .eq('mentor_id', sub.mentor_id)
        .eq('is_active', true)
      
      if (pairs) {
        setMentorPairs(pairs)
      }
    }

    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('client_subscriptions')
      .update({
        mt5_login: mt5Login,
        mt5_password: mt5Password || undefined, // Don't overwrite if empty
        mt5_server: mt5Server,
        broker_name: brokerName,
        risk_mode: riskMode,
        my_lot_size: parseFloat(lotSize),
        max_trades_per_signal: parseInt(maxTrades),
        selected_pairs: selectedPairs,
        is_connected: mt5Login && mt5Server ? true : false,
      })
      .eq('client_id', user.id)

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage('Settings saved successfully!')
      setMt5Password('') // Clear password field
    }

    setIsSaving(false)
  }

  const toggleStatus = async () => {
    const newStatus = subscription.status === 'active' ? 'paused' : 'active'
    
    const { error } = await supabase
      .from('client_subscriptions')
      .update({ status: newStatus })
      .eq('id', subscription.id)

    if (!error) {
      setSubscription({ ...subscription, status: newStatus })
    }
  }

  const togglePair = (symbol: string) => {
    if (selectedPairs.includes(symbol)) {
      setSelectedPairs(selectedPairs.filter(p => p !== symbol))
    } else {
      setSelectedPairs([...selectedPairs, symbol])
    }
  }

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading...</div>

  if (!subscription) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Client Dashboard</h1>
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardContent className="p-8 text-center">
            <p className="text-zinc-400 mb-4">You haven&apos;t joined a mentor yet.</p>
            <a href="/join">
              <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">Join a Mentor</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Copy Trading</h1>
          <p className="text-zinc-400 mt-1">
            Copying: <span className="text-amber-400 font-semibold">{mentor?.display_name}</span>
          </p>
        </div>
        <Button 
          onClick={toggleStatus}
          className={subscription.status === 'active' 
            ? 'bg-red-400/10 text-red-400 hover:bg-red-400/20' 
            : 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
          }
        >
          {subscription.status === 'active' 
            ? <><Pause className="mr-2 h-4 w-4" /> Pause</> 
            : <><Play className="mr-2 h-4 w-4" /> Resume</>}
        </Button>
      </div>

      <Badge className={subscription.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}>
        {subscription.status.toUpperCase()}
      </Badge>

      {/* MT5 Connection */}
      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Link className="h-5 w-5 text-amber-400" /> MT5 Account Connection
          </h2>
          <p className="text-sm text-zinc-400">Enter your MT5 credentials so AlphaDraft can execute trades on your behalf.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="broker">Broker Name</Label>
              <Input id="broker" value={brokerName} onChange={(e) => setBrokerName(e.target.value)}
                placeholder="e.g., IC Markets" className="mt-1 bg-zinc-900 border-zinc-800" />
            </div>
            <div>
              <Label htmlFor="server">MT5 Server</Label>
              <Input id="server" value={mt5Server} onChange={(e) => setMt5Server(e.target.value)}
                placeholder="e.g., ICMarketsSC-Demo" className="mt-1 bg-zinc-900 border-zinc-800" />
            </div>
            <div>
              <Label htmlFor="login">Account Number</Label>
              <Input id="login" value={mt5Login} onChange={(e) => setMt5Login(e.target.value)}
                placeholder="12345678" className="mt-1 bg-zinc-900 border-zinc-800" />
            </div>
            <div>
              <Label htmlFor="password">Password {mt5Login && !mt5Password && '(saved)'}</Label>
              <Input id="password" type="password" value={mt5Password} onChange={(e) => setMt5Password(e.target.value)}
                placeholder={mt5Login ? '•••••••• (enter to change)' : 'Enter password'} className="mt-1 bg-zinc-900 border-zinc-800" />
            </div>
          </div>

          {subscription.is_connected && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Account connected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pair Selection */}
      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-amber-400" /> Select Pairs to Copy
          </h2>
          <p className="text-sm text-zinc-400 mb-4">Choose which of {mentor?.display_name}&apos;s pairs you want to trade.</p>
          
          <div className="flex flex-wrap gap-2">
            {mentorPairs.map((pair: any) => (
              <button
                key={pair.id}
                onClick={() => togglePair(pair.symbol)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedPairs.includes(pair.symbol)
                    ? 'bg-amber-400 text-zinc-950 font-medium'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}>
                {pair.symbol}
                <span className="ml-2 text-xs opacity-70">({pair.default_lots})</span>
              </button>
            ))}
          </div>
          
          {selectedPairs.length === 0 && (
            <p className="text-sm text-red-400 mt-3 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Select at least one pair
            </p>
          )}
        </CardContent>
      </Card>

      {/* Risk Settings */}
      <Card className="bg-zinc-900/30 border-zinc-800">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" /> Risk Management
          </h2>

          <div>
            <Label className="mb-3 block">Risk Mode</Label>
            <div className="flex gap-2">
              {[
                { id: 'fixed_lot', label: 'Fixed Lot', desc: 'Same lot every trade' },
                { id: 'fixed_percent', label: '% Risk', desc: 'Risk % of equity' },
                { id: 'mirror', label: 'Mirror', desc: 'Same as mentor' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setRiskMode(mode.id)}
                  className={`flex-1 p-3 rounded-lg border text-left transition ${
                    riskMode === mode.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-zinc-800 bg-zinc-900/30'
                  }`}>
                  <div className={`text-sm font-medium ${riskMode === mode.id ? 'text-amber-400' : 'text-zinc-300'}`}>{mode.label}</div>
                  <div className="text-xs text-zinc-500">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lots">My Lot Size</Label>
              <Input id="lots" type="number" step="0.01" value={lotSize} onChange={(e) => setLotSize(e.target.value)}
                className="mt-1 bg-zinc-900 border-zinc-800" />
              <p className="text-xs text-zinc-500 mt-1">Mentor trades: {mentorPairs[0]?.default_lots || 0.05} lots</p>
            </div>
            <div>
              <Label htmlFor="max">Trades Per Signal</Label>
              <Input id="max" type="number" min="1" max="10" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
                className="mt-1 bg-zinc-900 border-zinc-800" />
              <p className="text-xs text-zinc-500 mt-1">How many times to copy each trade</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
          {message}
        </div>
      )}

      <Button 
        onClick={handleSave} 
        disabled={isSaving || selectedPairs.length === 0}
        className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
        size="lg"
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </Button>

      <p className="text-xs text-zinc-600 text-center">
        Risk Warning: Trading involves substantial risk of loss. Only trade with capital you can afford to lose.
      </p>
    </div>
  )
}