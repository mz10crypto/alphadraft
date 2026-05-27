import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*, outputs(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-zinc-400 mt-1">Manage all your AI generations</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/60 transition group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-amber-400/10 transition">
                      <FileText className="h-5 w-5 text-zinc-400 group-hover:text-amber-400" />
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-zinc-500 capitalize mb-3">{project.project_type.replace('_', ' ')}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{project.outputs?.[0]?.count || 0} generations</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-zinc-400 mb-6">Create your first AI generation to get started.</p>
            <Link href="/dashboard/projects/new">
              <Button>Create First Project</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}