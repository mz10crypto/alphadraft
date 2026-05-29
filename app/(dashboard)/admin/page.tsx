'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, Users, CheckCircle2, XCircle, Clock, 
  Search, Filter, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

type Application = {
  id: string
  user_id: string
  full_name: string
  email: string
  trading_experience: string
  strategy_description: string
  expected_pairs: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: { full_name: string; email: string }
}

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<<Application[]>([])
  const [mentors, setMentors] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedApp, setSelectedApp] = useState<<Application | null>(null)
  const [licenseKey, setLicenseKey] = useState('')
  const [commissionRate, setCommissionRate] = useState(20)
  const [maxClients, setMaxClients] = useState(50)
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin) {
      setIsAdmin(true)
      loadData()
    } else {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    const { data: apps } = await supabase
      .from('mentor_applications')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })

    const { data: mentorData } = await supabase
      .from('mentors')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })

    setApplications(apps || [])
    setMentors(mentorData || [])
    setIsLoading(false)
  }

  const approveApplication = async (app: Application) => {
    if (!licenseKey.trim()) {
      alert('Please enter a license key for this mentor')
      return
    }

    // Create mentor record
    const { error: mentorError } = await supabase.from('mentors').insert({
      id: app.user_id,
      display_name: app.full_name,
      email: app.email,
      license_key: licenseKey.toUpperCase(),
      subscription_status: 'active',
      max_clients: maxClients,
      commission_percent: commissionRate,
      is_active: true,
    })

    if (mentorError) {
      alert('Error creating mentor: ' + mentorError.message)
      return
    }

    // Add their expected pairs
    if (app.expected_pairs && app.expected_pairs.length > 0) {
      const pairs = app.expected_pairs.map(symbol => ({
        mentor_id: app.user_id,
        symbol,
        default_lots: 0.05,
      }))
      await supabase.from('mentor_pairs').insert(pairs)
    }

    // Update application status
    await supabase
      .from('mentor_applications')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', app.id)

    // Update profile
    await supabase.from('profiles').update({ trading_experience: app.trading_experience }).eq('id', app.user_id)

    setLicenseKey('')
    setSelectedApp(null)
    loadData()
  }

  const rejectApplication = async (app: Application) => {
    await supabase
      .from('mentor_applications')
      .update({ 
        status: 'rejected', 
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', app.id)

    setRejectionReason('')
    setSelectedApp(null)
    loadData()
  }

  const deactivateMentor = async (mentorId: string) => {
    await supabase.from('mentors').update({ is_active: false }).eq('id', mentorId)
    loadData()
  }

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = 
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading...</div>

  if (!isAdmin) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-zinc-400">You don't have admin privileges.</p>
        <Link href="/dashboard" className="text-amber-400 hover:underline mt-4 inline-block">
          <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-amber-400" /> Admin Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">Manage mentor applications and active mentors</p>
        </div>
        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/30">ADMIN</Badge>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Pending Applications</div>
            <div className="text-2xl font-bold text-amber-400">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Total Mentors</div>
            <div className="text-2xl font-bold">{mentors.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Active Mentors</div>
            <div className="text-2xl font-bold text-emerald-400">
              {mentors.filter(m => m.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400 mb-1">Total Clients</div>
            <div className="text-2xl font-bold">
              {mentors.reduce((sum, m) => sum + (m.current_clients || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Mentor Applications</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 w-64"
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredApps.length > 0 ? (
          <div className="grid gap-4">
            {filteredApps.map((app) => (
              <Card key={app.id} className="bg-zinc-900/30 border-zinc-800">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{app.full_name}</h3>
                        <Badge className={
                          app.status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                          app.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' :
                          'bg-red-400/10 text-red-400'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 mb-2">{app.email}</p>
                      <p className="text-sm text-zinc-400 mb-2">{app.strategy_description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {app.expected_pairs?.map((pair: string) => (
                          <Badge key={pair} variant="outline" className="text-xs">{pair}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600">
                        Experience: {app.trading_experience} • Applied: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                          onClick={() => setSelectedApp(app)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-400 hover:bg-red-400/10"
                          onClick={() => setSelectedApp({ ...app, status: 'rejected' } as any)}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
            <CardContent className="p-8 text-center">
              <Clock className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No applications found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Mentors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Mentors</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="bg-zinc-900/30 border-zinc-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{mentor.display_name}</h3>
                  <Badge className={mentor.is_active ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}>
                    {mentor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-500 mb-2">{mentor.email}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="text-zinc-400">License: <span className="text-amber-400 font-mono">{mentor.license_key}</span></div>
                  <div className="text-zinc-400">Clients: {mentor.current_clients}/{mentor.max_clients}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  {mentor.is_active && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-red-400"
                      onClick={() => deactivateMentor(mentor.id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Approve Modal */}
      {selectedApp && selectedApp.status === 'pending' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Approve Mentor Application</h3>
              <p className="text-sm text-zinc-400">Approve {selectedApp.full_name} as a mentor</p>
              
              <div>
                <Label>License Key</Label>
                <Input 
                  value={licenseKey} 
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="e.g., MENTOR-001"
                  className="mt-1 bg-zinc-950 border-zinc-800 font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commission %</Label>
                  <Input 
                    type="number" 
                    value={commissionRate} 
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="mt-1 bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div>
                  <Label>Max Clients</Label>
                  <Input 
                    type="number" 
                    value={maxClients} 
                    onChange={(e) => setMaxClients(Number(e.target.value))}
                    className="mt-1 bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                  onClick={() => approveApplication(selectedApp)}
                  disabled={!licenseKey.trim()}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedApp(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {selectedApp && selectedApp.status === 'rejected' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Reject Application</h3>
              <p className="text-sm text-zinc-400">{selectedApp.full_name}</p>
              
              <div>
                <Label>Reason (optional)</Label>
                <Textarea 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Why are you rejecting this application?"
                  className="mt-1 bg-zinc-950 border-zinc-800"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-red-400 text-zinc-950 hover:bg-red-300"
                  onClick={() => rejectApplication(selectedApp)}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedApp(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 
