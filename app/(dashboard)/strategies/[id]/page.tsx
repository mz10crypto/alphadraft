import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Copy, Clock, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function StrategyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: strategy } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!strategy) notFound()

  const { data: outputs } = await supabase
    .from('strategy_outputs')
    .select('*')
    .eq('strategy_id', params.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link href="/strategies" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-200 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to strategies
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{strategy.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="outline" className="capitalize">{strategy.strategy_type.replace('_', ' ')}</Badge>
            <Badge variant="outline" className="uppercase">{strategy.market}</Badge>
            <Badge variant="outline" className="capitalize">{strategy.timeframe}</Badge>
            <Badge variant="outline" className="capitalize">{strategy.status}</Badge>
            <span className="text-sm text-zinc-500 flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(strategy.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Link href={`/strategies/new?type=${strategy.strategy_type}&market=${strategy.market}`}>
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" /> New Generation
          </Button>
        </Link>
      </div>

      <Separator className="mb-8" />

      {outputs && outputs.length > 0 ? (
        <div className="space-y-6">
          {outputs.map((output) => (
            <Card key={output.id} className="bg-zinc-900/30 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-zinc-500">
                      {output.model_used} • {output.tokens_used} tokens
                    </div>
                    {output.confidence_score && (
                      <Badge className={`text-xs ${
                        output.confidence_score >= 80 
                          ? 'bg-emerald-400/10 text-emerald-400' 
                          : output.confidence_score >= 60 
                            ? 'bg-amber-400/10 text-amber-400' 
                            : 'bg-red-400/10 text-red-400'
                      }`}>
                        Confidence: {output.confidence_score}%
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output.content)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed font-mono text-sm">
                  {output.content}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
                  Prompt: {output.prompt}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-zinc-400">No outputs yet for this strategy.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}