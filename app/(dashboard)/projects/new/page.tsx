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
import { 
  Loader2, Sparkles, Copy, Check, 
  FileText, Target, Mail, Share2, Globe, TrendingUp 
} from 'lucide-react'

const projectTypes = [
  { id: 'ad_copy', label: 'Ad Copy', icon: Target, desc: 'High-converting ads for any platform' },
  { id: 'blog_outline', label: 'Blog Outline', icon: FileText, desc: 'SEO-structured content plans' },
  { id: 'email_sequence', label: 'Email Sequence', icon: Mail, desc: 'Drip campaigns that convert' },
  { id: 'social_post', label: 'Social Post', icon: Share2, desc: 'Engaging posts for every channel' },
  { id: 'landing_page', label: 'Landing Page', icon: Globe, desc: 'Conversion-focused page copy' },
  { id: 'trading_strategy', label: 'Strategy Doc', icon: TrendingUp, desc: 'Analytical summaries & plans' },
]

const toneOptions = ['Professional', 'Casual', 'Witty', 'Authoritative', 'Empathetic', 'Direct']

export default function NewProjectPage() {
  const [selectedType, setSelectedType] = useState('ad_copy')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('Professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async () => {
    if (!title.trim() || !prompt.trim()) return
    
    setIsGenerating(true)
    setError('')
    setOutput('')

    try {
            const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          project_type: selectedType,
          status: 'generating',
          settings: { tone, prompt_length: prompt.length }
        })
        .select()
        .single()

      if (projectError) throw projectError

      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Tone: ${tone}. ${prompt}`,
          project_type: selectedType,
          settings: { tone }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

            await supabase.from('outputs').insert({
        user_id: user.id,
        project_id: project.id,
        content: result.content,
        prompt,
        model_used: 'gpt-4o',
        tokens_used: result.tokens_used,
      })

      await supabase.from('projects').update({ status: 'completed' }).eq('id', project.id)

      setOutput(result.content)

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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">New Project</h1>
      <p className="text-zinc-400 mb-8">Configure your generation parameters.</p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Project Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    selectedType === type.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60'
                  }`}>
                  <type.icon className={`h-5 w-5 mb-2 ${selectedType === type.id ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-zinc-500 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q4 Facebook Ad Campaign" className="mt-1 bg-zinc-900 border-zinc-800" />
          </div>

          <div>
            <Label className="mb-3 block">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    tone === t ? 'bg-amber-400 text-zinc-950 font-medium' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="prompt">What do you want to create?</Label>
            <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your product, audience, and what you want the AI to generate..."
              className="mt-1 bg-zinc-900 border-zinc-800 min-h-[120px]" />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleGenerate} disabled={isGenerating || !title.trim() || !prompt.trim()}
            className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300" size="lg">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</>
            )}
          </Button>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Output</Label>
          <Card className="bg-zinc-900/50 border-zinc-800 min-h-[500px]">
            <CardContent className="p-0">
              {output ? (
                <div className="relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="p-6 pt-12">
                    <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed">
                      {output}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-zinc-600">
                  <Sparkles className="h-12 w-12 mb-4" />
                  <p className="text-sm">Your generated content will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}