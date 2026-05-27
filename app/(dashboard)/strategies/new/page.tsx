'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, Sparkles, Target, Shield, BarChart3, 
  Activity, TrendingUp, Brain, Copy, Check,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const strategyTypes = [
  { id: 'signal_generator', label: 'Signal Generator', icon: Target, desc: 'Entry/exit rules with exact price levels and confidence scores' },
  { id: 'risk_analysis', label: 'Risk Analysis', icon: Shield, desc: 'Portfolio heat, correlation checks, and VaR calculations' },
  { id: 'position_sizing', label: 'Position Sizing', icon: BarChart3, desc: 'Kelly criterion, fixed fractional, and scaling plans' },
  { id: 'market_report', label: 'Market Report', icon: Activity, desc: 'Macro + technical bias forecasts with key levels' },
  { id: 'backtest_logic', label: 'Backtest Logic', icon: TrendingUp, desc: 'Historical performance metrics and optimization insights' },
  { id: 'trade_plan', label: 'Trade Plan', icon: Brain, desc: 'Complete execution plan with contingencies and invalidation' },
]

const markets = [
  { id: 'forex', label: 'Forex' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'futures', label: 'Futures' },
  { id: 'indices', label: 'Indices' },
  { id: 'commodities', label: 'Commodities' },
]

const timeframes = [
  { id: 'scalping', label: 'Scalping', desc: '1-15 min' },
  { id: 'day', label: 'Day Trading', desc: '15 min - 4H' },
  { id: 'swing', label: 'Swing', desc: '4H - Daily' },
  { id: 'position', label: 'Position', desc: 'Daily - Weekly' },
]

export default function NewStrategyPage() {
  const [selectedType, setSelectedType] = useState('signal_generator')
  const [selectedMarket, setSelectedMarket] = useState('forex')
  const [selectedTimeframe, setSelectedTimeframe] = useState('day')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async () => {
    if (!title.trim() || !prompt.trim()) return
    
    setIsGenerating(true)
    setError('')
    setOutput('')
    setConfidenceScore(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Ensure profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
        })
      }

      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          title,
          strategy_type: selectedType,
          market: selectedMarket,
          timeframe: selectedTimeframe,
          status: 'generating',
          settings: { prompt_length: prompt.length }
        })
        .select()
        .single()

      if (strategyError) throw strategyError

      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Market: ${selectedMarket.toUpperCase()}, Timeframe: ${selectedTimeframe}. ${prompt}`,
          strategy_type: selectedType,
          market: selectedMarket,
          timeframe: selectedTimeframe,
          settings: {}
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      await supabase.from('strategy_outputs').insert({
        user_id: user.id,
        strategy_id: strategy.id,
        content: result.content,
        prompt,
        model_used: 'llama-3.1-70b',
        tokens_used: result.tokens_used,
        confidence_score: result.confidence_score,
      })

      await supabase.from('strategies').update({ status: 'completed' }).eq('id', strategy.id)

      setOutput(result.content)
      setConfidenceScore(result.confidence_score || 0)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-200 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">New Strategy</h1>
        {confidenceScore > 0 && (
          <Badge className={`${confidenceScore >= 80 ? 'bg-emerald-400/10 text-emerald-400' : confidenceScore >= 60 ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
            Confidence: {confidenceScore}%
          </Badge>
        )}
      </div>
      <p className="text-zinc-400 mb-8">Configure your AI trading strategy parameters.</p>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Strategy Type</Label>
            <div className="grid gap-2">
              {strategyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition ${
                    selectedType === type.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60'
                  }`}>
                  <type.icon className={`h-5 w-5 mt-0.5 ${selectedType === type.id ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-zinc-500">{type.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Market */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Market</Label>
            <div className="grid grid-cols-3 gap-2">
              {markets.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarket(m.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    selectedMarket === m.id
                      ? 'bg-amber-400 text-zinc-950 font-medium'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Timeframe</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeframes.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTimeframe(tf.id)}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedTimeframe === tf.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60'
                  }`}>
                  <div className={`text-sm font-medium ${selectedTimeframe === tf.id ? 'text-amber-400' : 'text-zinc-300'}`}>{tf.label}</div>
                  <div className="text-xs text-zinc-500">{tf.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Title */}
          <div>
            <Label htmlFor="title">Strategy Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., EURUSD Breakout Strategy"
              className="mt-1 bg-zinc-900 border-zinc-800"
            />
          </div>

          {/* Prompt */}
          <div>
            <Label htmlFor="prompt">Strategy Context</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your trading style, risk tolerance, and what you want the AI to analyze. E.g., 'I prefer trend-following with tight stops. Focus on EURUSD during London session.'"
              className="mt-1 bg-zinc-900 border-zinc-800 min-h-[120px]"
            />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim() || !prompt.trim()}
            className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
            size="lg"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Market...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate Strategy</>
            )}
          </Button>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-3">
          <Label className="text-sm font-medium mb-3 block">Strategy Output</Label>
          <Card className="bg-zinc-900/50 border-zinc-800 min-h-[600px]">
            <CardContent className="p-0">
              {output ? (
                <div className="relative">
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="p-6 pt-12">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed font-mono text-sm">
                        {output}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-zinc-600">
                  <Brain className="h-16 w-16 mb-4" />
                  <p className="text-sm">Your AI-generated strategy will appear here</p>
                  <p className="text-xs text-zinc-700 mt-2">Select parameters and click Generate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}