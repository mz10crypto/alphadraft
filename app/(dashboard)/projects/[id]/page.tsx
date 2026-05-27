import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Copy, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  const { data: outputs } = await supabase
    .from('outputs')
    .select('*')
    .eq('project_id', params.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link href="/projects" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-200 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to projects
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="capitalize">{project.project_type.replace('_', ' ')}</Badge>
            <Badge variant="outline" className="capitalize">{project.status}</Badge>
            <span className="text-sm text-zinc-500 flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Link href={`/projects/new?template=${project.project_type}`}>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" /> New Generation
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
                  <div className="text-xs text-zinc-500">
                    {output.model_used} • {output.tokens_used} tokens
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output.content)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed">
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
            <p className="text-zinc-400">No generations yet for this project.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}