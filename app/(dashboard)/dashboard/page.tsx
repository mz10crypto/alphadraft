import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, Plus, ArrowRight, Target, Activity, 
  TrendingUp, Shield, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: strategies } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: signals } = await supabase
    .from('signals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  const creditsUsed = profile?.monthly_credits_used || 0
  const creditsLimit = profile?.monthly_credits_limit || 10
  const creditsPercent = (creditsUsed / creditsLimit) * 100

  // Mock portfolio stats (will be real with broker integration)
  const portfolioStats = {
    balance: 10420.50,
    dailyChange: +124.30,
    dailyChangePercent: +1.21,
    openPositions: 3,
    winRate: 58.4,
    totalTrades: 24,
    avgRR: 1.8,
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {profile?.full_name || user.email?.split('@')[0]}</p>
        </div>
        <Link href="/strategies/new">
          <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">
            <Plus className="mr-2 h-4 w-4" /> New Strategy
          </Button>
        </Link>
      </div>

      {/* Portfolio Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Account Balance</div>
            <div className="text-2xl font-bold">${portfolioStats.balance.toLocaleString()}</div>
            <div className={`text-sm flex items-center gap-1 ${portfolioStats.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className="h-3 w-3" />
              {portfolioStats.dailyChange >= 0 ? '+' : ''}{portfolioStats.dailyChange} ({portfolioStats.dailyChangePercent}%)
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Open Positions</div>
            <div className="text-2xl font-bold">{portfolioStats.openPositions}</div>
            <div className="text-sm text-zinc-500">2 long, 1 short</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Win Rate</div>
            <div className="text-2xl font-bold">{portfolioStats.winRate}%</div>
            <div className="text-sm text-zinc-500">{portfolioStats.totalTrades} total trades</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Avg R:R</div>
            <div className="text-2xl font-bold">1:{portfolioStats.avgRR}</div>
            <div className="text-sm text-zinc-500">Risk-adjusted returns</div>
          </CardContent>
        </Card>
      </div>

      {/* Credits + Plan */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Strategy Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{creditsUsed} <span className="text-lg text-zinc-500">/ {creditsLimit}</span></div>
            <Progress value={creditsPercent} className="h-2" />
            <p className="text-xs text-zinc-500 mt-2">{creditsLimit - creditsUsed} remaining this month</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{strategies?.length || 0}</div>
            <p className="text-xs text-zinc-500 mt-2">
              <Activity className="inline h-3 w-3 text-emerald-400 mr-1" />
              {strategies?.filter(s => s.status === 'completed').length || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize border-amber-400/30 text-amber-400">
                {profile?.subscription_tier || 'free'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {profile?.subscription_tier === 'free' ? 'Upgrade to Pro for 100 credits/mo' : 'You\'re on the Pro plan'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Signals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" /> Active Signals
          </h2>
          <Link href="/signals" className="text-sm text-amber-400 hover:underline flex items-center">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        
        {signals && signals.length > 0 ? (
          <div className="grid gap-4">
            {signals.map((signal) => (
              <Card key={signal.id} className="bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/60 transition">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${signal.direction === 'buy' ? 'bg-emerald-400/10' : signal.direction === 'sell' ? 'bg-red-400/10' : 'bg-zinc-800'}`}>
                      <TrendingUp className={`h-5 w-5 ${signal.direction === 'buy' ? 'text-emerald-400' : signal.direction === 'sell' ? 'text-red-400' : 'text-zinc-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{signal.pair}</h3>
                      <p className="text-sm text-zinc-500 capitalize">{signal.direction} • Confidence: {signal.confidence}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{signal.entry_price}</div>
                    <div className="text-xs text-zinc-500">SL: {signal.stop_loss} | TP: {signal.take_profit_1}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
            <CardContent className="p-8 text-center">
              <Target className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">No active signals. Generate a strategy to get trade ideas.</p>
              <Link href="/strategies/new">
                <Button variant="outline">Generate Strategy</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Strategies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Strategies</h2>
          <Link href="/strategies" className="text-sm text-amber-400 hover:underline flex items-center">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        
        {strategies && strategies.length > 0 ? (
          <div className="grid gap-4">
            {strategies.map((strategy) => (
              <Link key={strategy.id} href={`/strategies/${strategy.id}`}>
                <Card className="bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/60 transition group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-amber-400/10 transition">
                        <Target className="h-5 w-5 text-zinc-400 group-hover:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{strategy.title}</h3>
                        <p className="text-sm text-zinc-500 capitalize">{strategy.strategy_type.replace('_', ' ')} • {strategy.market.toUpperCase()} • {strategy.timeframe}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {strategy.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
            <CardContent className="p-8 text-center">
              <Zap className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">No strategies yet. Create your first AI-generated strategy.</p>
              <Link href="/strategies/new">
                <Button variant="outline">Create Strategy</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}