import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Plus, Brain } from 'lucide-react'
import Link from 'next/link'

export default async function StrategiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: strategies } = await supabase
    .from('strategies')
    .select('*, strategy_outputs(confidence_score)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Strategies</h1>
          <p className="text-zinc-400 mt-1">All your AI-generated trading strategies</p>
        </div>
        <Link href="/strategies/new">
          <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">
            <Plus className="mr-2 h-4 w-4" /> New Strategy
          </Button>
        </Link>
      </div>

      {strategies && strategies.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy: any) => (
            <Link key={strategy.id} href={`/strategies/${strategy.id}`}>
              <Card className="bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/60 transition group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-amber-400/10 transition">
                      <Target className="h-5 w-5 text-zinc-400 group-hover:text-amber-400" />
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {strategy.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-1">{strategy.title}</h3>
                  <p className="text-sm text-zinc-500 capitalize mb-2">{strategy.strategy_type.replace('_', ' ')}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                    <span className="uppercase">{strategy.market}</span>
                    <span>•</span>
                    <span className="capitalize">{strategy.timeframe}</span>
                  </div>
                  {strategy.strategy_outputs?.[0]?.confidence_score && (
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      strategy.strategy_outputs[0].confidence_score >= 80 
                        ? 'bg-emerald-400/10 text-emerald-400' 
                        : 'bg-amber-400/10 text-amber-400'
                    }`}>
                      Confidence: {strategy.strategy_outputs[0].confidence_score}%
                    </div>
                  )}
                  <div className="mt-3 text-xs text-zinc-600">
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No strategies yet</h3>
            <p className="text-zinc-400 mb-6">Create your first AI-generated trading strategy.</p>
            <Link href="/strategies/new">
              <Button>Create First Strategy</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}