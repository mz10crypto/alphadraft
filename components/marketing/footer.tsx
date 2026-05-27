import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="font-bold">AlphaDraft</span>
            </div>
            <p className="text-sm text-zinc-500">Algorithmic edge for every trader. AI-powered strategies, signals, and copy trading.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>Strategy Generator</li>
              <li>Signal Feed</li>
              <li>Copy Trading</li>
              <li>Risk Engine</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Markets</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>Forex</li>
              <li>Crypto</li>
              <li>Stocks</li>
              <li>Futures</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>About</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-8 flex items-center justify-between">
          <p className="text-sm text-zinc-500">© 2026 AlphaDraft. All rights reserved.</p>
          <p className="text-sm text-zinc-500">Risk Disclaimer: Trading involves substantial risk of loss.</p>
        </div>
      </div>
    </footer>
  )
}