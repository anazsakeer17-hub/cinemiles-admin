import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WalletTab from './WalletTab'
import ClapsTab from './ClapsTab' 
import TicketsTab from './TicketsTab'
import RewardsTab from './RewardsTab'
import EngagementTab from './EngagementTab' 
import AuditTab from './AuditTab' // <-- Import the new component
import { 
  ArrowLeft, ShieldAlert, CheckCircle, Ban, 
  Wallet, Trophy, Ticket, Gift, Activity, 
  FileText, Coins
} from 'lucide-react'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('wallet')

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ==========================================
  // GLOBAL USER FETCH
  // ==========================================
  useEffect(() => {
    fetchUser()
  }, [id])

 async function fetchUser() {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin-user-detail?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch user')
      
      const { overview, walletStats } = await response.json()

      setUser({
        id: overview.id,
        name: overview.name,
        fullName: overview.member_name,
        email: overview.email,
        phone: overview.phone || '—',
        city: overview.city || '—',
        createdAt: new Date(overview.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'active',
        fraudFlag: overview.fraud_count > 0,
        level: overview.level_name || 'Viewer',
        claps: overview.total_claps || 0,
        miles: walletStats?.current_balance || 0,
        lifetimeMiles: walletStats?.lifetime_earned || 0,
        lifetimeRedeemed: walletStats?.lifetime_redeemed || 0,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'wallet', label: 'Wallet & Miles', icon: Wallet },
    { id: 'claps', label: 'Claps & Level', icon: Trophy },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'engagement', label: 'Engagement', icon: Activity },
    { id: 'audit', label: 'Audit Log', icon: FileText },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading user details...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-10 flex flex-col">
      
      {/* 1. STICKY TOP SUMMARY HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        
        {/* Top Navigation Row */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button 
            onClick={() => navigate('/users')}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
          </button>
          <div className="text-xs font-mono text-slate-400">
            ID: {user.id} • Created: {user.createdAt}
          </div>
        </div>

        {/* Core Identity & Actions Row */}
        <div className="px-6 py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#A855F7] to-[#60A5FA] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 leading-none">{user.name}</h1>
                {user.status === 'active' ? (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold"><CheckCircle className="w-3 h-3"/> Active</span>
                ) : (
                  <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold"><Ban className="w-3 h-3"/> Banned</span>
                )}
                {user.fraudFlag && (
                  <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold"><ShieldAlert className="w-3 h-3"/> High Risk</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                {user.email} • {user.phone} • {user.city}
              </p>
              <p className="text-sm text-slate-500 mt-1.5 font-medium">
                User Full Name: {user.fullName}
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-8 px-8 border-x border-slate-200">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Miles Balance</p>
              <p className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-emerald-500" /> {user.miles.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Level & Claps</p>
              <p className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-yellow-500" /> {user.level} <span className="text-sm text-slate-400 font-medium">({user.claps})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="px-6 flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#A855F7] text-[#A855F7]' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'wallet' && <WalletTab userId={id} user={user} />}
        {activeTab === 'claps' && <ClapsTab userId={id} />}
        {activeTab === 'tickets' && <TicketsTab userId={id} />}
        {activeTab === 'rewards' && <RewardsTab userId={id} />}
        {activeTab === 'engagement' && <EngagementTab userId={id} />}
        {activeTab === 'audit' && <AuditTab userId={id} />}
      </div>
    </div>
  )
}