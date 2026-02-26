import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabaseClient'
import { 
  ArrowLeft, ShieldAlert, CheckCircle, Ban, 
  Wallet, Trophy, Ticket, Gift, Activity, 
  FileText, Settings, AlertTriangle, Coins,
  TrendingUp, TrendingDown, Eye, MoreVertical, Shield, Copy, Star, RotateCcw,
  Film, MessageSquare, Clock, BarChart2, Zap, MapPin, Target, CalendarDays, BrainCircuit,
  User, Mail, Phone, Calendar, Hash, ShieldCheck
} from 'lucide-react'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Default tab set to 'wallet'
  const [activeTab, setActiveTab] = useState('wallet')

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const PAGE_SIZE = 25
  

  // Wallet Ledger States
  const [walletTransactions, setWalletTransactions] = useState([])
  const [loadingWallet, setLoadingWallet] = useState(false)
  const [filterTxType, setFilterTxType] = useState('all') // 'all', 'credit', 'debit'
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [walletPage, setWalletPage] = useState(1)
  const [totalWallet, setTotalWallet] = useState(0)

  // Claps & Level States
  const [clapStats, setClapStats] = useState(null)
  const [clapTransactions, setClapTransactions] = useState([])
  const [loadingClaps, setLoadingClaps] = useState(false)
  const [clapFilterTxType, setClapFilterTxType] = useState('all') // 'all', 'credit', 'debit'
  const [clapFilterDateFrom, setClapFilterDateFrom] = useState('')
  const [clapFilterDateTo, setClapFilterDateTo] = useState('')
  const [clapsPage, setClapsPage] = useState(1)
  const [totalClaps, setTotalClaps] = useState(0)

  // Tickets & Upload States
  const [userClaims, setUserClaims] = useState([])
  const [loadingClaims, setLoadingClaims] = useState(false)
  const [claimFilterStatus, setClaimFilterStatus] = useState('all')
  const [claimFilterDateFrom, setClaimFilterDateFrom] = useState('')
  const [claimFilterDateTo, setClaimFilterDateTo] = useState('')
  const [claimsPage, setClaimsPage] = useState(1)
  const [totalClaims, setTotalClaims] = useState(0)

  const [userReceipts, setUserReceipts] = useState([])
  const [loadingReceipts, setLoadingReceipts] = useState(false)
  const [receiptFilterStatus, setReceiptFilterStatus] = useState('all')
  const [receiptFilterDateFrom, setReceiptFilterDateFrom] = useState('')
  const [receiptFilterDateTo, setReceiptFilterDateTo] = useState('')
  const [receiptsPage, setReceiptsPage] = useState(1)
  const [totalReceipts, setTotalReceipts] = useState(0)
  
  const [previewImage, setPreviewImage] = useState(null)

  // Rewards States
  const [rewardsStats, setRewardsStats] = useState(null)
  
  const [rewardsInventory, setRewardsInventory] = useState([])
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [inventoryFilterStatus, setInventoryFilterStatus] = useState('all')
  const [inventoryFilterDateFrom, setInventoryFilterDateFrom] = useState('')
  const [inventoryFilterDateTo, setInventoryFilterDateTo] = useState('')
  const [inventoryPage, setInventoryPage] = useState(1)
  const [totalInventory, setTotalInventory] = useState(0)

  const [rewardsRedemptions, setRewardsRedemptions] = useState([])
  const [loadingRedemptions, setLoadingRedemptions] = useState(false)
  const [redemptionFilterDateFrom, setRedemptionFilterDateFrom] = useState('')
  const [redemptionFilterDateTo, setRedemptionFilterDateTo] = useState('')
  const [redemptionsPage, setRedemptionsPage] = useState(1)
  const [totalRedemptions, setTotalRedemptions] = useState(0)

  // Engagement States 
  const [quizStats, setQuizStats] = useState(null)
  const [quizAttempts, setQuizAttempts] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loadingEngagement, setLoadingEngagement] = useState(false)
  const [quizFilterDateFrom, setQuizFilterDateFrom] = useState('')
  const [quizFilterDateTo, setQuizFilterDateTo] = useState('')
  const [quizPage, setQuizPage] = useState(1)
  const [totalQuiz, setTotalQuiz] = useState(0)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)

  // --- TAB: AUDIT ---
const [auditLogs, setAuditLogs] = useState([])
const [loadingAudit, setLoadingAudit] = useState(false)
const [auditPage, setAuditPage] = useState(1)
const [totalAudit, setTotalAudit] = useState(0)
  
  // Copy to clipboard state
  const [copiedId, setCopiedId] = useState(null)

  // ==========================================
  // RESET PAGE EFFECTS ON FILTER CHANGES
  // ==========================================
  useEffect(() => setWalletPage(1), [filterTxType, filterDateFrom, filterDateTo])
  useEffect(() => setClapsPage(1), [clapFilterTxType, clapFilterDateFrom, clapFilterDateTo])
  useEffect(() => setClaimsPage(1), [claimFilterStatus, claimFilterDateFrom, claimFilterDateTo])
  useEffect(() => setReceiptsPage(1), [receiptFilterStatus, receiptFilterDateFrom, receiptFilterDateTo])
  useEffect(() => setInventoryPage(1), [inventoryFilterStatus, inventoryFilterDateFrom, inventoryFilterDateTo])
  useEffect(() => setRedemptionsPage(1), [redemptionFilterDateFrom, redemptionFilterDateTo])
  useEffect(() => setQuizPage(1), [quizFilterDateFrom, quizFilterDateTo])

  // ==========================================
  // GLOBAL USER FETCH
  // ==========================================
  useEffect(() => {
    fetchUser()
  }, [id])

  async function fetchUser() {
    setLoading(true)
    const { data, error } = await supabase.from('admin_users_overview').select('*').eq('id', id).single()
    const { data: walletStats } = await supabase.from('admin_user_wallet_stats').select('*').eq('user_id', id).single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setUser({
      id: data.id,
      name: data.name,
      fullName: data.member_name,
      email: data.email,
      phone: data.phone || '—',
      city: data.city || '—',
      createdAt: new Date(data.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      fraudFlag: data.fraud_count > 0,
      level: data.level_name || 'Viewer',
      claps: data.total_claps || 0,
      miles: walletStats?.current_balance || 0,
      lifetimeMiles: walletStats?.lifetime_earned || 0,
      lifetimeRedeemed: walletStats?.lifetime_redeemed || 0,
    })
    setLoading(false)
  }

  // ==========================================
  // TAB DATA FETCHING
  // ==========================================


  // --- TAB: WALLET ---
  useEffect(() => {
    if (activeTab === 'wallet' && id) fetchWalletTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, filterTxType, filterDateFrom, filterDateTo, walletPage])

  async function fetchWalletTransactions() {
    setLoadingWallet(true)
    const from = (walletPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('miles_ledger').select('id, transaction_id, created_at, amount, reason, reference_label', { count: 'exact' })
      .eq('user_id', id).order('created_at', { ascending: false }).range(from, to)

    if (filterTxType === 'credit') query = query.gt('amount', 0)
    if (filterTxType === 'debit') query = query.lt('amount', 0)
    if (filterDateFrom) query = query.gte('created_at', `${filterDateFrom}T00:00:00.000Z`)
    if (filterDateTo) query = query.lte('created_at', `${filterDateTo}T23:59:59.999Z`)

    const { data: walletData, count, error } = await query

    if (error) { console.error(error); setLoadingWallet(false); return }
    setTotalWallet(count || 0)
    setWalletTransactions((walletData || []).map(tx => ({
      id: tx.id, transactionId: tx.transaction_id, 
      date: new Date(tx.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: tx.amount > 0 ? 'Credit' : 'Debit', amount: tx.amount, source: tx.reason, ref: tx.reference_label || '-', reason: tx.reason,
    })))
    setLoadingWallet(false)
  }

  // --- TAB: CLAPS ---
  useEffect(() => {
    if (activeTab === 'claps' && id) fetchClapStats()
  }, [activeTab, id])

  useEffect(() => {
    if (activeTab === 'claps' && id) fetchClapTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, clapFilterTxType, clapFilterDateFrom, clapFilterDateTo, clapsPage])

  async function fetchClapStats() {
    const { data, error } = await supabase.from('admin_user_claps_stats').select('*').eq('user_id', id).single()
    if (!error) setClapStats(data)
  }

  async function fetchClapTransactions() {
    setLoadingClaps(true)
    const from = (clapsPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('admin_user_claps_ledger').select('*', { count: 'exact' })
      .eq('user_id', id).order('created_at', { ascending: false }).range(from, to)

    if (clapFilterTxType === 'credit') query = query.gt('amount', 0)
    if (clapFilterTxType === 'debit') query = query.lt('amount', 0)
    if (clapFilterDateFrom) query = query.gte('created_at', `${clapFilterDateFrom}T00:00:00.000Z`)
    if (clapFilterDateTo) query = query.lte('created_at', `${clapFilterDateTo}T23:59:59.999Z`)

    const { data, count, error } = await query

    if (error) { console.error(error); setLoadingClaps(false); return }
    setTotalClaps(count || 0)
    setClapTransactions((data || []).map(tx => ({
      id: tx.id, transactionId: tx.transaction_id,
      date: new Date(tx.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: tx.amount > 0 ? 'Credit' : 'Debit', amount: tx.amount, source: tx.reason, ref: tx.reference_label || '-'
    })))
    setLoadingClaps(false)
  }

  // --- TAB: TICKETS ---
  useEffect(() => {
    if (activeTab === 'tickets' && id) fetchUserClaims()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, claimFilterStatus, claimFilterDateFrom, claimFilterDateTo, claimsPage])

  useEffect(() => {
    if (activeTab === 'tickets' && id) fetchUserReceipts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, receiptFilterStatus, receiptFilterDateFrom, receiptFilterDateTo, receiptsPage])

  async function fetchUserClaims() {
    setLoadingClaims(true)
    const from = (claimsPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('admin_user_ticket_claims').select('*', { count: 'exact' })
      .eq('claimed_by_user_id', id).order('created_at', { ascending: false }).range(from, to)
    
    if (claimFilterStatus !== 'all') query = query.eq('claim_status', claimFilterStatus)
    if (claimFilterDateFrom) query = query.gte('created_at', `${claimFilterDateFrom}T00:00:00.000Z`)
    if (claimFilterDateTo) query = query.lte('created_at', `${claimFilterDateTo}T23:59:59.999Z`)

    const { data, count } = await query
    setTotalClaims(count || 0)
    setUserClaims(data || [])
    setLoadingClaims(false)
  }

  async function fetchUserReceipts() {
    setLoadingReceipts(true)
    const from = (receiptsPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('admin_user_uploaded_receipts').select('*', { count: 'exact' })
      .eq('uploaded_by_user_id', id).order('created_at', { ascending: false }).range(from, to)
    
    if (receiptFilterStatus !== 'all') query = query.eq('status', receiptFilterStatus)
    if (receiptFilterDateFrom) query = query.gte('created_at', `${receiptFilterDateFrom}T00:00:00.000Z`)
    if (receiptFilterDateTo) query = query.lte('created_at', `${receiptFilterDateTo}T23:59:59.999Z`)

    const { data, count } = await query
    setTotalReceipts(count || 0)
    setUserReceipts(data || [])
    setLoadingReceipts(false)
  }

  // --- TAB: REWARDS ---
  useEffect(() => {
    if (activeTab === 'rewards' && id) fetchRewardsStats()
  }, [activeTab, id])

  useEffect(() => {
    if (activeTab === 'rewards' && id) fetchRewardsInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, inventoryFilterStatus, inventoryFilterDateFrom, inventoryFilterDateTo, inventoryPage])

  useEffect(() => {
    if (activeTab === 'rewards' && id) fetchRewardsRedemptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, redemptionFilterDateFrom, redemptionFilterDateTo, redemptionsPage])

  async function fetchRewardsStats() {
    const { data } = await supabase.from('admin_user_rewards_stats').select('*').eq('user_id', id).single()
    setRewardsStats(data)
  }

  async function fetchRewardsInventory() {
    setLoadingInventory(true)
    const from = (inventoryPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('admin_user_rewards_inventory').select('*', { count: 'exact' })
      .eq('user_id', id).order('issued_at', { ascending: false }).range(from, to)

    if (inventoryFilterStatus !== 'all') query = query.eq('status', inventoryFilterStatus)
    if (inventoryFilterDateFrom) query = query.gte('issued_at', `${inventoryFilterDateFrom}T00:00:00.000Z`)
    if (inventoryFilterDateTo) query = query.lte('issued_at', `${inventoryFilterDateTo}T23:59:59.999Z`)

    const { data, count } = await query
    setTotalInventory(count || 0)
    setRewardsInventory(data || [])
    setLoadingInventory(false)
  }

  async function fetchRewardsRedemptions() {
    setLoadingRedemptions(true)
    const from = (redemptionsPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('admin_user_rewards_redemptions').select('*', { count: 'exact' })
      .eq('user_id', id).order('redeemed_at', { ascending: false }).range(from, to)

    if (redemptionFilterDateFrom) query = query.gte('redeemed_at', `${redemptionFilterDateFrom}T00:00:00.000Z`)
    if (redemptionFilterDateTo) query = query.lte('redeemed_at', `${redemptionFilterDateTo}T23:59:59.999Z`)

    const { data, count } = await query
    setTotalRedemptions(count || 0)
    setRewardsRedemptions(data || [])
    setLoadingRedemptions(false)
  }

  // --- TAB: ENGAGEMENT ---
  useEffect(() => {
    if (activeTab === 'engagement' && id) fetchEngagementStats()
  }, [activeTab, id])

  useEffect(() => {
    if (activeTab === 'engagement' && id) fetchQuizAttempts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, quizFilterDateFrom, quizFilterDateTo, quizPage])

  useEffect(() => {
    if (activeTab === 'engagement' && id) fetchUserReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, reviewsPage])

  async function fetchEngagementStats() {
    const { data: qs } = await supabase.from('admin_user_quiz_stats').select('*').eq('user_id', id).maybeSingle()
    const { data: rs } = await supabase.from('admin_user_review_stats').select('*').eq('user_id', id).maybeSingle()
    setQuizStats(qs)
    setReviewStats(rs)
  }

  async function fetchQuizAttempts() {
    setLoadingEngagement(true)
    const from = (quizPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('admin_user_quiz_attempts').select('*', { count: 'exact' })
      .eq('user_id', id).order('submitted_at', { ascending: false }).range(from, to)

    if (quizFilterDateFrom) query = query.gte('submitted_at', `${quizFilterDateFrom}T00:00:00.000Z`)
    if (quizFilterDateTo) query = query.lte('submitted_at', `${quizFilterDateTo}T23:59:59.999Z`)

    const { data, count } = await query
    setTotalQuiz(count || 0)
    setQuizAttempts(data || [])
    setLoadingEngagement(false)
  }

  async function fetchUserReviews() {
    const from = (reviewsPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await supabase.from('admin_user_reviews').select('*', { count: 'exact' })
      .eq('user_id', id).order('created_at', { ascending: false }).range(from, to)

    setTotalReviews(count || 0)
    setReviews(data || [])
  }



  // Tab Audit Logs
  useEffect(() => {
  if (activeTab === 'audit' && id) fetchAuditLogs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, id, auditPage])

async function fetchAuditLogs() {
  setLoadingAudit(true)

  const from = (auditPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count, error } = await supabase
    .from('admin_audit_logs')
    .select('*', { count: 'exact' })
    .eq('target_user_id', id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error(error)
    setLoadingAudit(false)
    return
  }

  setTotalAudit(count || 0)
  setAuditLogs(data || [])
  setLoadingAudit(false)
}


  // Action Helpers
  async function handleViewReceipt(path) {
    if (!path) return
    const { data, error } = await supabase.functions.invoke('admin-get-receipt-url', { body: { path } })
    if (!error) setPreviewImage(data.signedUrl)
  }

  async function revokeClaim(claimId) {
    if (!window.confirm('Are you sure you want to revoke this claim?')) return
    const { error } = await supabase.functions.invoke('revoke-ticket-claim', { body: { ticket_claim_id: claimId } })
    if (error) {
      alert(error.message || 'Failed to revoke')
      return
    }
    fetchUserClaims()
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedId(text)
        setTimeout(() => setCopiedId(null), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr)
        alert('Failed to copy. Please select and copy manually.')
      }
      document.body.removeChild(textArea)
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

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Approved</span>
      case 'rewarded': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Rewarded</span>
      case 'pending': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-max">Pending</span>
      case 'rejected': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 flex items-center gap-1 w-max"><Ban className="w-3 h-3"/> Rejected</span>
      case 'revoked': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Revoked</span>
      default: return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">{status}</span>
    }
  }

  // Helper for Reward Inventory Badges
  const getRewardStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'unused': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 w-max">Active / Unused</span>
      case 'used': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 w-max">Used</span>
      case 'expired': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 w-max">Expired</span>
      default: return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 w-max">{status}</span>
    }
  }

  // Pagination Footer Component
  const renderPagination = (page, total, setPageFn, loadingState) => {
    const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, total)
    return (
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {start} to {end} of {total.toLocaleString()} records</span>
        <div className="flex gap-2">
          <button
            disabled={page === 1 || loadingState}
            onClick={() => setPageFn(p => p - 1)}
            className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-opacity"
          >
            Previous
          </button>
          <button
            disabled={page * PAGE_SIZE >= total || loadingState}
            onClick={() => setPageFn(p => p + 1)}
            className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-opacity"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 flex flex-col">
      
      {/* 1. STICKY TOP SUMMARY HEADER (The Control Panel) */}
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
          
          {/* Left: Identity */}
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

          {/* Middle: Key Financial Metrics */}
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

        
        {/* WALLET & MILES TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Current Balance</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{user.miles.toLocaleString()}</h3>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Available to spend</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Lifetime Earned</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{user.lifetimeMiles.toLocaleString()}</h3>
                <p className="text-xs text-slate-400 font-medium mt-2">All time platform creation</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Lifetime Redeemed</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{user.lifetimeRedeemed.toLocaleString()}</h3>
                <p className="text-xs text-amber-600 font-medium mt-2">Value extracted</p>
              </div>
            </div>

            {/* Wallet Ledger Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Filter Control Bar */}
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <h3 className="font-bold text-slate-800">Transaction Ledger</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={filterTxType}
                    onChange={(e) => setFilterTxType(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium text-slate-600"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credits Only</option>
                    <option value="debit">Debits Only</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium"
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input 
                      type="date" 
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium"
                    />
                  </div>
                  
                  {/* Clear Filters Button */}
                  {(filterTxType !== 'all' || filterDateFrom || filterDateTo) && (
                    <button 
                      onClick={() => { setFilterTxType('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Txn ID</th>
                      <th className="px-6 py-3">Date & Time</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Source / Details</th>
                      <th className="px-6 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingWallet ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400">Loading transactions...</td>
                      </tr>
                    ) : walletTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400">No transactions found matching filters.</td>
                      </tr>
                    ) : (
                      walletTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 group">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400" title={tx.transactionId}>
                            <div className="flex items-center gap-2">
                              <span>
                                {tx.transactionId 
                                  ? `${tx.transactionId.split('-')[0]}...${tx.transactionId.split('-')[4]}` 
                                  : 'N/A'}
                              </span>
                              {/* Copy Button */}
                              {tx.transactionId && (
                                <button 
                                  onClick={() => handleCopy(tx.transactionId)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded text-slate-500"
                                  title="Copy full Txn ID"
                                >
                                  {copiedId === tx.transactionId ? (
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{tx.source}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{tx.ref}</p>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-bold text-lg ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {renderPagination(walletPage, totalWallet, setWalletPage, loadingWallet)}
            </div>
          </div>
        )}

        {/* CLAPS & LEVEL TAB */}
        {activeTab === 'claps' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Claps & Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Level Progress Card (Spans 2 columns) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500"/> Current Level</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{clapStats?.level_name || '—'}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-500">Next: {clapStats?.next_level_name || 'Max Level'}</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                      {clapStats?.total_claps?.toLocaleString() || 0} <span className="text-slate-400 text-sm font-medium">/ {clapStats?.next_min_claps?.toLocaleString() || clapStats?.total_claps}</span>
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 mb-2 overflow-hidden border border-slate-200/60 inset-shadow-sm">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                    style={{ width: `${clapStats?.progress_percent || 0}%` }}
                  >
                    {/* Optional little shine effect on the progress bar */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 skew-x-[-20deg] transform -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium text-right">{clapStats?.progress_percent || 0}% Completed</p>
              </div>

              {/* Lifetime Claps Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500"> Current Season Claps</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2"> {clapStats?.total_claps?.toLocaleString() || 0}</h3>
                <p className="text-xs text-slate-400 font-medium mt-2">Claps earned in active season</p>
              </div>
            </div>

            {/* Claps Ledger Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Filter Control Bar */}
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <h3 className="font-bold text-slate-800">Claps Transaction Ledger</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={clapFilterTxType}
                    onChange={(e) => setClapFilterTxType(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium text-slate-600"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Earned Only</option>
                    <option value="debit">Deducted Only</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={clapFilterDateFrom}
                      onChange={(e) => setClapFilterDateFrom(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input 
                      type="date" 
                      value={clapFilterDateTo}
                      onChange={(e) => setClapFilterDateTo(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                  </div>
                  
                  {(clapFilterTxType !== 'all' || clapFilterDateFrom || clapFilterDateTo) && (
                    <button 
                      onClick={() => { setClapFilterTxType('all'); setClapFilterDateFrom(''); setClapFilterDateTo(''); }}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table Claps and Levels */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Txn ID</th>
                      <th className="px-6 py-3">Date & Time</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Source / Details</th>
                      <th className="px-6 py-3">Claps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingClaps ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400">
                          Loading transactions...
                        </td>
                      </tr>
                    ) : clapTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400">No transactions found matching filters.</td>
                      </tr>
                    ) : (
                      clapTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 group">
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400" title={tx.transactionId}>
                            <div className="flex items-center gap-2">
                              <span>
                                {tx.transactionId 
                                  ? `${tx.transactionId.split('-')[0]}...${tx.transactionId.split('-')[4]}` 
                                  : 'N/A'}
                              </span>
                              {tx.transactionId && (
                                <button 
                                  onClick={() => handleCopy(tx.transactionId)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded text-slate-500"
                                  title="Copy full Txn ID"
                                >
                                  {copiedId === tx.transactionId ? (
                                    <CheckCircle className="w-3 h-3 text-yellow-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{tx.source}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{tx.ref}</p>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-bold text-lg ${tx.amount > 0 ? 'text-yellow-600' : 'text-rose-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {renderPagination(clapsPage, totalClaps, setClapsPage, loadingClaps)}
            </div>
          </div>
        )}

        {/* TICKETS & FRAUD TAB */}
        {activeTab === 'tickets' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* SECTION 1: SEATS CLAIMED BY THIS USER */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Claimed Seats (Rewards)</h3>
                  <p className="text-sm text-slate-500 mt-1">Individual tickets this user has actively claimed for miles and claps.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={claimFilterStatus}
                    onChange={(e) => setClaimFilterStatus(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium text-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="revoked">Revoked</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={claimFilterDateFrom}
                      onChange={(e) => setClaimFilterDateFrom(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input 
                      type="date" 
                      value={claimFilterDateTo}
                      onChange={(e) => setClaimFilterDateTo(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                  </div>
                  
                  {(claimFilterStatus !== 'all' || claimFilterDateFrom || claimFilterDateTo) && (
                    <button 
                      onClick={() => { setClaimFilterStatus('all'); setClaimFilterDateFrom(''); setClaimFilterDateTo(''); }}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Receipt Ref</th>
                      <th className="px-6 py-3">Movie & Theatre</th>
                      <th className="px-6 py-3">Show Date</th>
                      <th className="px-6 py-3">Yield</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Approved At</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                   {loadingClaims ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        Loading claims...
                      </td>
                    </tr>
                  ) : userClaims.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        No claims found matching filters.
                      </td>
                    </tr>
                  ) : (
                    userClaims.map((claim) => (
                      <tr key={claim.id || `${claim.receipt_uuid}-${claim.ticket_number}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span title={claim.receipt_uuid}>
                              {claim.receipt_uuid
                                ? `${claim.receipt_uuid.split('-')[0]}...${claim.receipt_uuid.split('-')[4]}`
                                : 'N/A'}
                            </span>

                            {claim.receipt_uuid && (
                              <button
                                onClick={() => handleCopy(claim.receipt_uuid)}
                                className="p-1 hover:bg-slate-200 rounded"
                              >
                                {copiedId === claim.receipt_uuid ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            {claim.ticket_number || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{claim.movie_title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{claim.theatre_name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                          {claim.show_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 text-xs font-bold">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-max">  +{claim.miles_earned} Miles</span>
                            <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded w-max">+{claim.claps_earned} Claps</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(claim.claim_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {claim.approved_at
                            ? new Date(claim.approved_at).toLocaleString('en-IN')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {claim.claim_status === 'approved' && (
                            <button
                              onClick={() => revokeClaim(claim.id)}
                              className="flex items-center justify-end gap-1.5 ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
              {renderPagination(claimsPage, totalClaims, setClaimsPage, loadingClaims)}
            </div>

            {/* SECTION 2: RECEIPTS UPLOADED BY THIS USER */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Uploaded Receipts</h3>
                  <p className="text-sm text-slate-500 mt-1">Physical or digital receipts submitted by this user for verification.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={receiptFilterStatus}
                    onChange={(e) => setReceiptFilterStatus(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium text-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={receiptFilterDateFrom}
                      onChange={(e) => setReceiptFilterDateFrom(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input 
                      type="date" 
                      value={receiptFilterDateTo}
                      onChange={(e) => setReceiptFilterDateTo(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                  </div>
                  
                  {(receiptFilterStatus !== 'all' || receiptFilterDateFrom || receiptFilterDateTo) && (
                    <button 
                      onClick={() => { setReceiptFilterStatus('all'); setReceiptFilterDateFrom(''); setReceiptFilterDateTo(''); }}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Receipt ID</th>
                      <th className="px-6 py-3">Movie & Theatre</th>
                      <th className="px-6 py-3">Show Date</th>
                      <th className="px-6 py-3">Total Seats</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Uploaded On</th>
                      <th className="px-6 py-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                  {loadingReceipts ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        Loading receipts...
                      </td>
                    </tr>
                  ) : userReceipts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        No uploads found matching filters.
                      </td>
                    </tr>
                  ) : (
                    userReceipts.map((receipt) => (
                      <tr key={receipt.receipt_uuid} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span title={receipt.receipt_uuid}>
                              {receipt.receipt_uuid
                                ? `${receipt.receipt_uuid.split('-')[0]}...${receipt.receipt_uuid.split('-')[4]}`
                                : 'N/A'}
                            </span>

                            {receipt.receipt_uuid && (
                              <button
                                onClick={() => handleCopy(receipt.receipt_uuid)}
                                className="p-1 hover:bg-slate-200 rounded"
                              >
                                {copiedId === receipt.receipt_uuid ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            {receipt.ticket_number || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{receipt.movie_title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{receipt.theatre_name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                          {receipt.show_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-700">{receipt.total_seats}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(receipt.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {new Date(receipt.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewReceipt(receipt.receipt_image_path)}
                            className="p-1.5 text-slate-400 hover:text-[#A855F7] hover:bg-purple-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4"/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
              {renderPagination(receiptsPage, totalReceipts, setReceiptsPage, loadingReceipts)}
            </div>

          </div>
        )}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* SECTION 1: Rewards Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-[#A855F7] rounded-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Total Redeemed</p>
                  <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{rewardsStats?.total_redeemed || 0}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Miles Spent</p>
                  <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{(rewardsStats?.miles_spent || 0).toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Active (Unused)</p>
                  <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{rewardsStats?.active_rewards || 0}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Expired Rewards</p>
                  <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{rewardsStats?.expired_rewards || 0}</h3>
                </div>
              </div>
            </div>

            {/* SECTION 2: Rewards Inventory Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Rewards Inventory</h3>
                  <p className="text-sm text-slate-500 mt-1">All rewards acquired by the user via miles redemption.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={inventoryFilterStatus}
                    onChange={(e) => setInventoryFilterStatus(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium text-slate-600"
                  >
                    <option value="all">All Status</option>
                    <option value="unused">Unused</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={inventoryFilterDateFrom}
                      onChange={(e) => setInventoryFilterDateFrom(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input 
                      type="date" 
                      value={inventoryFilterDateTo}
                      onChange={(e) => setInventoryFilterDateTo(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                  </div>
                  
                  {(inventoryFilterStatus !== 'all' || inventoryFilterDateFrom || inventoryFilterDateTo) && (
                    <button 
                      onClick={() => { setInventoryFilterStatus('all'); setInventoryFilterDateFrom(''); setInventoryFilterDateTo(''); }}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Redeem Code</th>
                      <th className="px-6 py-3">Reward Title</th>
                      <th className="px-6 py-3">Miles Cost</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Issued On</th>
                      <th className="px-6 py-3">Expires At</th>
                      <th className="px-6 py-3">Used At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingInventory ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-slate-400">Loading inventory...</td>
                      </tr>
                    ) : rewardsInventory.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-10 text-slate-400">No inventory records found matching filters.</td></tr>
                    ) : (
                      rewardsInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded tracking-wider">
                                {item.redeem_code}
                              </span>
                              <button 
                                onClick={() => handleCopy(item.redeem_code)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                {copiedId === item.redeem_code 
                                  ? <CheckCircle className="w-4 h-4 text-emerald-500" /> 
                                  : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {item.reward_title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-rose-600 font-bold">
                            -{item.miles_required}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRewardStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {new Date(item.issued_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {item.expires_at 
                              ? new Date(item.expires_at).toLocaleDateString('en-IN')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {item.used_at 
                              ? new Date(item.used_at).toLocaleString('en-IN')
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(inventoryPage, totalInventory, setInventoryPage, loadingInventory)}
            </div>

            {/* SECTION 3: Redemption History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Redemption History (Audit Log)</h3>
                  <p className="text-sm text-slate-500 mt-1">Tracking where and by whom a user's rewards were physically consumed.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={redemptionFilterDateFrom}
                      onChange={(e) => setRedemptionFilterDateFrom(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input 
                      type="date" 
                      value={redemptionFilterDateTo}
                      onChange={(e) => setRedemptionFilterDateTo(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                    />
                  </div>
                  
                  {(redemptionFilterDateFrom || redemptionFilterDateTo) && (
                    <button 
                      onClick={() => { setRedemptionFilterDateFrom(''); setRedemptionFilterDateTo(''); }}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Reward Title</th>
                      <th className="px-6 py-3">Miles Spent</th>
                      <th className="px-6 py-3">Theatre Location</th>
                      <th className="px-6 py-3">Staff / Cashier Phone</th>
                      <th className="px-6 py-3">Redeemed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingRedemptions ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400">Loading redemptions...</td>
                      </tr>
                    ) : rewardsRedemptions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400">
                          No redemption history found matching filters.
                        </td>
                      </tr>
                    ) : (
                      rewardsRedemptions.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {log.reward_title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                            {log.miles_spent}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {log.theatre_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">
                            {log.staff_phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {log.redeemed_at 
                              ? new Date(log.redeemed_at).toLocaleString('en-IN')
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(redemptionsPage, totalRedemptions, setRedemptionsPage, loadingRedemptions)}
            </div>

          </div>
        )}

        {/* ENGAGEMENT TAB */}
        {activeTab === 'engagement' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* SECTION 1: QUIZ ACTIVITY */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-500"/> Quiz Activity
              </h2>
              
              {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
  
              {/* Total Attempts */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Total Attempts
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {quizStats?.total_attempts || 0}
                </p>
              </div>

              {/* Unique Quizzes */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Unique Quizzes
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {quizStats?.unique_quizzes || 0}
                </p>
              </div>

              {/* Average Accuracy */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Avg Accuracy
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {quizStats?.avg_accuracy_percent
                    ? `${quizStats.avg_accuracy_percent}%`
                    : '0%'}
                </p>
              </div>

              {/* Miles Earned */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Miles Earned
                </p>
                <p className="text-2xl font-bold text-[#A855F7]">
                  {quizStats?.total_miles_earned || 0}
                </p>
              </div>

              {/* Last Submission */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Last Submission
                </p>
                <p className="text-sm font-bold text-slate-800 mt-2">
                {quizStats?.last_submission
              ? new Date(quizStats.last_submission).toLocaleString('en-IN')
              : '—'}
                </p>
              </div>

            </div>

              {/* Quiz Attempts Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                  <h3 className="font-bold text-slate-800">Quiz Attempts Log</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={quizFilterDateFrom}
                        onChange={(e) => setQuizFilterDateFrom(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                      />
                      <span className="text-slate-400 text-sm">to</span>
                      <input 
                        type="date" 
                        value={quizFilterDateTo}
                        onChange={(e) => setQuizFilterDateTo(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                      />
                    </div>
                    
                    {(quizFilterDateFrom || quizFilterDateTo) && (
                      <button 
                        onClick={() => { setQuizFilterDateFrom(''); setQuizFilterDateTo(''); }}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Quiz Title</th>
                        <th className="px-6 py-3">Attempt ID</th>
                        <th className="px-6 py-3">Submitted At</th>
                        <th className="px-6 py-3 text-center">Score</th>
                        <th className="px-6 py-3">Accuracy</th>
                        <th className="px-6 py-3">Miles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingEngagement ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-400">
                            Loading quiz attempts...
                          </td>
                        </tr>
                      ) : quizAttempts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-400">
                            No quiz attempts found matching filters.
                          </td>
                        </tr>
                      ) : (
                        quizAttempts.map((quiz) => (
                          <tr key={quiz.id} className="hover:bg-slate-50">
                            
                            {/* Quiz Title */}
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {quiz.quiz_title}
                            </td>

                            {/* Attempt ID */}
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <span title={quiz.id}>
                                  {quiz.id.split('-')[0]}...{quiz.id.split('-')[4]}
                                </span>
                                <button
                                  onClick={() => handleCopy(quiz.id)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  {copiedId === quiz.id ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Submitted Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                              {new Date(quiz.submitted_at).toLocaleString('en-IN')}
                            </td>

                            {/* Score */}
                            <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-medium text-slate-700">
                              {quiz.correct_answers} / {quiz.total_questions}
                            </td>

                            {/* Accuracy */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`font-bold ${
                                  quiz.accuracy_percent >= 80
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {quiz.accuracy_percent}%
                              </span>
                            </td>

                            {/* Miles */}
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-[#A855F7]">
                              {quiz.miles_awarded > 0 ? `+${quiz.miles_awarded}` : '0'} M
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(quizPage, totalQuiz, setQuizPage, loadingEngagement)}
              </div>
            </div>

            {/* SECTION 2: THEATRE REVIEWS */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500"/> Theatre Reviews
              </h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Written</p>
                 <p className="text-2xl font-bold text-slate-900">
                  {reviewStats?.total_reviews || 0}
                </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Avg Rating</p>
                  <p className="text-2xl font-bold text-slate-900 flex items-center gap-1">{reviewStats?.avg_rating || 0} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">5★ Count</p>
                  <p className="text-2xl font-bold text-emerald-600">{reviewStats?.five_star_count || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">1★ Count</p>
                  <p className="text-2xl font-bold text-rose-600"> {reviewStats?.one_star_count || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Last Review</p>
                  <p className="text-sm font-bold text-slate-800 mt-2"> {reviewStats?.last_review
                  ? new Date(reviewStats.last_review).toLocaleString('en-IN')
                  : '—'}</p>
                </div>
              </div>

              {/* Reviews Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Review History</h3>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Theatre & City</th>
                        <th className="px-6 py-3">Breakdown</th>
                        <th className="px-6 py-3">Overall</th>
                        <th className="px-6 py-3 w-1/3">Review Text</th>
                        <th className="px-6 py-3">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingEngagement ? (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-slate-400">
                            Loading reviews...
                          </td>
                        </tr>
                      ) : reviews.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-slate-400">
                            No reviews found.
                          </td>
                        </tr>
                      ) : (
                        reviews.map((review) => (
                          <tr key={review.id} className="hover:bg-slate-50 items-start">
                            
                            {/* Theatre */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-bold text-slate-900">
                                {review.theatre_name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {review.city}
                              </p>
                            </td>

                            {/* Breakdown */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <span>Screen: <strong>{review.screen_rating}</strong></span>
                                <span>Sound: <strong>{review.sound_rating}</strong></span>
                                <span>Snacks: <strong>{review.snacks_rating}</strong></span>
                                <span>Comfort: <strong>{review.comfort_rating}</strong></span>
                              </div>
                            </td>

                            {/* Overall */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold flex items-center gap-1">
                                {review.overall_rating}
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                              </span>
                            </td>

                            {/* Review Text */}
                            <td className="px-6 py-4 text-slate-700">
                              <p className="line-clamp-2" title={review.review_text}>
                                {review.review_text}
                              </p>
                            </td>

                            {/* Timeline */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                              <p>
                                Created: {new Date(review.created_at).toLocaleString('en-IN')}
                              </p>
                              {review.updated_at && review.updated_at !== review.created_at && (
                                <p className="mt-0.5">
                                  Updated: {new Date(review.updated_at).toLocaleString('en-IN')}
                                </p>
                              )}
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {renderPagination(reviewsPage, totalReviews, setReviewsPage, loadingEngagement)}
              </div>
            </div>

          </div>
        )}


        {/* PLACEHOLDER FOR OTHER TABS */}
        {activeTab === 'audit' && (
  <div className="space-y-6 animate-in fade-in duration-300">
    
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">
          Admin Action Audit Log
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Tracks administrative actions performed on this user.
        </p>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Admin ID</th>
              <th className="px-6 py-3">Target Table</th>
              <th className="px-6 py-3">Created At</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loadingAudit ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-400">
                  Loading audit logs...
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-400">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  
                  {/* Action */}
                  <td className="px-6 py-4 font-bold text-rose-600">
                    {log.action_type}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-slate-700">
                    {log.action_category}
                  </td>

                  {/* Admin ID */}
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span title={log.admin_user_id}>
                        {log.admin_user_id.split('-')[0]}...{log.admin_user_id.split('-')[4]}
                      </span>
                      <button
                        onClick={() => handleCopy(log.admin_user_id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {copiedId === log.admin_user_id ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Target Table */}
                  <td className="px-6 py-4 text-slate-600">
                    {log.target_table}
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination(auditPage, totalAudit, setAuditPage, loadingAudit)}
    </div>
  </div>
)}

      </div>


      {previewImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-auto relative">

            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-slate-100 hover:bg-slate-200 rounded-full p-2"
            >
              ✕
            </button>

            {/* Image */}
            <div className="p-4">
              <img
                src={previewImage}
                alt="Receipt"
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}