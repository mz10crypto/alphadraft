'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Zap, ArrowRight, TrendingUp, BarChart3, Shield, 
  Brain, Users, Target, Activity, Clock, CheckCircle2,
  Download, Smartphone
} from 'lucide-react'
import Link from 'next/link'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
}

const marketTicker = [
  { pair: 'EURUSD', price: '1.0847', change: '+0.24%', up: true },
  { pair: 'GBPUSD', price: '1.2673', change: '+0.18%', up: true },
  { pair: 'USDJPY', price: '156.42', change: '-0.12%', up: false },
  { pair: 'BTCUSD', price: '67,245', change: '+2.34%', up: true },
  { pair: 'ETHUSD', price: '3,512', change: '+1.89%', up: true },
  { pair: 'XAUUSD', price: '2,341', change: '+0.45%', up: true },
]

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Live Ticker */}
      <div className="fixed top-16 w-full z-40 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-sm">
        <div className="flex overflow-hidden py-2">
          <div className="flex gap-8 animate-marquee whitespace-nowrap px-4">
            {[...marketTicker, ...marketTicker].map((m, i) => (
              <span key={i} className="text-sm font-mono">
                <span className="text-zinc-400">{m.pair}</span>{' '}
                <span className="text-zinc-200">{m.price}</span>{' '}
                <span className={m.up ? 'text-emerald-400' : 'text-red-400'}>{m.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.12),transparent)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
            <Badge variant="outline" className="mb-6 border-amber-400/30 text-amber-400 bg-amber-400/10">
              <Activity className="h-3 w-3 mr-1" /> Live Market Data
            </Badge>
          </motion.div>

          <motion.h1 custom={1} variants={fadeIn} initial="hidden" animate="visible"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Algorithmic Edge<br />
            <span className="text-amber-400">For Every Trader.</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeIn} initial="hidden" animate="visible"
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            AI-generated trading strategies, real-time signals, and copy trading. 
            Professional-grade tools for forex, crypto, stocks, and futures — 
            zero technical setup required.
          </motion.p>

          <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-amber-400 text-zinc-950 hover:bg-amber-300 text-base px-8">
                Start Trading <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8">
              View Strategies
            </Button>
          </motion.div>

          <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible"
            className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 10 free generations</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cancel anytime</span>
          </motion.div>
        </div>

        {/* Strategy Preview Card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }} className="mt-20 max-w-5xl mx-auto px-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold">AI Strategy Generator</span>
                </div>
                <Badge className="bg-emerald-400/10 text-emerald-400">Live</Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="text-zinc-500 mb-1">Signal</div>
                  <div className="text-emerald-400 font-mono font-bold">BUY EURUSD</div>
                  <div className="text-zinc-400 mt-1">Entry: 1.0845 | SL: 1.0820 | TP: 1.0890</div>
                </div>
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="text-zinc-500 mb-1">Risk Analysis</div>
                  <div className="text-amber-400 font-mono font-bold">1.2% Portfolio Heat</div>
                  <div className="text-zinc-400 mt-1">Correlation: High | VaR(95%): -2.1%</div>
                </div>
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="text-zinc-500 mb-1">Backtest</div>
                  <div className="text-emerald-400 font-mono font-bold">62% Win Rate</div>
                  <div className="text-zinc-400 mt-1">Sharpe: 1.45 | Max DD: -18.3%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Traders</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Every tool is designed to give you an edge in execution, risk management, and strategy development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Strategy Generator', desc: 'Generate complete trading strategies with entry rules, risk parameters, and backtest logic in seconds.' },
              { icon: Target, title: 'Precision Signals', desc: 'Real-time trade ideas with exact entry, stop loss, and take profit levels across all major markets.' },
              { icon: BarChart3, title: 'Risk Engine', desc: 'Portfolio heat analysis, correlation checks, position sizing, and VaR calculations — automatically.' },
              { icon: Shield, title: 'Backtest on Demand', desc: 'Every strategy includes historical performance metrics: win rate, Sharpe ratio, max drawdown.' },
              { icon: Users, title: 'Copy Trading', desc: 'Follow verified profitable traders with allocation controls and max risk limits per trade.' },
              { icon: TrendingUp, title: 'Market Intelligence', desc: 'AI reads macro data, technical landscape, and institutional flow for bias forecasts.' },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition group">
                <feature.icon className="h-8 w-8 text-amber-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Types */}
      <section id="strategies" className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">6 Strategy Types</h2>
            <p className="text-zinc-400">From signal generation to full backtest logic — cover every trading need.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Signal Generator', desc: 'Entry/exit rules with exact price levels', icon: Target },
              { type: 'Risk Analysis', desc: 'Portfolio heat, correlation, VaR', icon: Shield },
              { type: 'Position Sizing', desc: 'Kelly criterion, fixed fractional, scaling', icon: BarChart3 },
              { type: 'Market Report', desc: 'Macro + technical bias forecasts', icon: Activity },
              { type: 'Backtest Logic', desc: 'Historical performance + optimization', icon: TrendingUp },
              { type: 'Trade Plan', desc: 'Complete execution plan with contingencies', icon: Brain },
            ].map((s, i) => (
              <Card key={s.type} className="bg-zinc-900/30 border-zinc-800 hover:border-amber-400/30 transition">
                <CardContent className="p-6">
                  <s.icon className="h-6 w-6 text-amber-400 mb-3" />
                  <h3 className="font-semibold mb-1">{s.type}</h3>
                  <p className="text-sm text-zinc-400">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Copy Trading */}
      <section id="copy-trading" className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-amber-400/10 text-amber-400">Copy Trading</Badge>
              <h2 className="text-3xl font-bold mb-4">Follow the Best.<br />Control Your Risk.</h2>
              <p className="text-zinc-400 mb-6">
                Copy verified profitable traders with full control. Set max allocation, risk per trade, 
                and automatic stop limits. Never blindly follow — always stay in control.
              </p>
              <ul className="space-y-3">
                {[
                  'Verified P&L leaderboard with 90-day track record',
                  'Allocation controls: 1% to 100% of your capital',
                  'Max risk per trade: Never exceed your comfort zone',
                  'Auto-stop: Pause copying if drawdown hits your limit',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Top Traders This Month</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'AlphaBot Pro', return: '+24.5%', winRate: '68%', followers: 342 },
                    { name: 'SwingMaster', return: '+18.2%', winRate: '62%', followers: 198 },
                    { name: 'ScalpKing', return: '+31.1%', winRate: '58%', followers: 567 },
                  ].map((trader) => (
                    <div key={trader.name} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{trader.name}</div>
                        <div className="text-xs text-zinc-500">{trader.winRate} win rate • {trader.followers} followers</div>
                      </div>
                      <div className="text-emerald-400 font-mono font-bold text-sm">{trader.return}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* App Downloads */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Trade Anywhere</h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Web-first platform that works on any device. No app store required. 
            Add to home screen for native-like experience.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" className="gap-2">
              <Smartphone className="h-5 w-5" /> iOS Web App
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-5 w-5" /> Android Web App
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Credit-Based Pricing</h2>
            <p className="text-zinc-400">Pay for what you generate. Upgrade when you scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { tier: 'Free', price: '$0', credits: '10/mo', features: ['All strategy types', 'Basic signals', 'Community support', '1 active copy trade'] },
              { tier: 'Pro', price: '$49', credits: '100/mo', features: ['All Free features', 'Priority signals', 'Advanced risk engine', 'Unlimited copy trades', 'Export strategies', 'Email support'], popular: true },
              { tier: 'Enterprise', price: 'Custom', credits: 'Unlimited', features: ['All Pro features', 'Custom AI models', 'API access', 'White-label', 'Dedicated support', 'SLA guarantee'] },
            ].map((plan) => (
              <div key={plan.tier} className={`rounded-xl border p-8 ${plan.popular ? 'border-amber-400 bg-amber-400/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
                {plan.popular && <Badge className="mb-4 bg-amber-400 text-zinc-950">Most Popular</Badge>}
                <h3 className="text-xl font-bold mb-2">{plan.tier}</h3>
                <div className="text-3xl font-bold mb-1">{plan.price}</div>
                <div className="text-sm text-zinc-500 mb-6">{plan.credits}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300' : ''}`}>
                  {plan.tier === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked</h2>
          <div className="space-y-4">
            {[
              { q: 'How do strategy credits work?', a: 'Each AI strategy generation consumes 1 credit. Free users get 10 credits per month. Pro users get 100. Unused credits do not roll over.' },
              { q: 'Can I backtest strategies before trading live?', a: 'Yes — every strategy output includes historical backtest metrics: win rate, Sharpe ratio, max drawdown, and profit factor.' },
              { q: 'What markets does AlphaDraft support?', a: 'Forex, crypto, stocks, futures, indices, and commodities. You select your market when generating a strategy.' },
              { q: 'Is copy trading fully automated?', a: 'You control allocation percentage and max risk per trade. We execute signals, but you set the limits. Auto-stop triggers if drawdown exceeds your threshold.' },
              { q: 'How accurate are the AI signals?', a: 'Signals include a confidence score (1-100%) based on technical confluence. Past performance is shown in backtests, but all trading carries risk.' },
              { q: 'Is my trading data secure?', a: 'Absolutely. Row-Level Security in Supabase ensures only you access your strategies. We never store broker credentials or API keys.' },
            ].map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/30">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for your edge?</h2>
          <p className="text-zinc-400 mb-8 text-lg">Join thousands of traders using AlphaDraft to generate, test, and execute strategies.</p>
          <Link href="/login">
            <Button size="lg" className="bg-amber-400 text-zinc-950 hover:bg-amber-300 text-base px-8">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}