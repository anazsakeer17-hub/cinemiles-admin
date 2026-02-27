import { useState, useEffect } from 'react'
import { Star, CheckCircle, Copy } from 'lucide-react'

export default function ClapsTab({ userId }) {
  const PAGE_SIZE = 25

  // Claps & Level States
  const [clapStats, setClapStats] = useState(null)
  const [clapTransactions, setClapTransactions] = useState([])
  const [loadingClaps, setLoadingClaps] = useState(false)
  const [clapFilterTxType, setClapFilterTxType] = useState('all') // 'all', 'credit', 'debit'
  const [clapFilterDateFrom, setClapFilterDateFrom] = useState('')
  const [clapFilterDateTo, setClapFilterDateTo] = useState('')
  const [clapsPage, setClapsPage] = useState(1)
  const [totalClaps, setTotalClaps] = useState(0)
  const [copiedId, setCopiedId] = useState(null)

  // Reset page to 1 when filters change
  useEffect(() => {
    setClapsPage(1)
  }, [clapFilterTxType, clapFilterDateFrom, clapFilterDateTo])

  // Fetch Stats
  useEffect(() => {
    if (userId) fetchClapStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Fetch Transactions
  useEffect(() => {
    if (userId) fetchClapTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, clapFilterTxType, clapFilterDateFrom, clapFilterDateTo, clapsPage])

 async function fetchClapStats() {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin-claps-stats?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch clap stats')
      
      const { data } = await response.json()
      setClapStats(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchClapTransactions() {
    setLoadingClaps(true)
    
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId,
        page: clapsPage,
        pageSize: PAGE_SIZE,
        txType: clapFilterTxType,
      })

      if (clapFilterDateFrom) params.append('dateFrom', clapFilterDateFrom)
      if (clapFilterDateTo) params.append('dateTo', clapFilterDateTo)

      const response = await fetch(`/api/admin-claps-ledger?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch claps ledger')

      const { data, count } = await response.json()

      setTotalClaps(count || 0)
      setClapTransactions((data || []).map(tx => ({
        id: tx.id, 
        transactionId: tx.transaction_id,
        date: new Date(tx.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: tx.amount > 0 ? 'Credit' : 'Debit', 
        amount: tx.amount, 
        source: tx.reason, 
        ref: tx.reference_label || '-'
      })))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingClaps(false)
    }
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
  )
}