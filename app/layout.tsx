import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlphaDraft — Algorithmic Edge for Every Trader',
  description: 'AI-powered trading strategies, real-time signals, and copy trading. Professional-grade tools for forex, crypto, stocks, and futures.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof window !== 'undefined') {
            window.__REACT_HYDRATION_MISMATCH__ = true;
          }
        `}} />
      </head>
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  )
}// trigger rebuild 
// rebuild trigger 
