import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle, Copy } from 'lucide-react'

export default function WalletTab({ userId, user }) {
  const PAGE_SIZE = 25

  // Wallet Ledger States
  const [walletTransactions, setWalletTransactions] = useState([])
  const [loadingWallet, setLoadingWallet] = useState(false)
  const [filterTxType, setFilterTxType] = useState('all') // 'all', 'credit', 'debit'
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [walletPage, setWalletPage] = useState(1)
  const [totalWallet, setTotalWallet] = useState(0)
  const [copiedId, setCopiedId] = useState(null)

  // Reset page effects on filter changes
  useEffect(() => {
    setWalletPage(1)
  }, [filterTxType, filterDateFrom, filterDateTo])

  // Fetch Wallet Transactions
  useEffect(() => {
    if (userId) fetchWalletTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterTxType, filterDateFrom, filterDateTo, walletPage])

  async function fetchWalletTransactions() {
    setLoadingWallet(true)
    
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId,
        page: walletPage,
        pageSize: PAGE_SIZE,
        txType: filterTxType,
      })

      if (filterDateFrom) params.append('dateFrom', filterDateFrom)
      if (filterDateTo) params.append('dateTo', filterDateTo)

      const response = await fetch(`/api/admin-wallet-ledger?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch ledger')

      const { data, count } = await response.json()

      setTotalWallet(count || 0)
      setWalletTransactions((data || []).map(tx => ({
        id: tx.id, 
        transactionId: tx.transaction_id, 
        date: new Date(tx.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: tx.amount > 0 ? 'Credit' : 'Debit', 
        amount: tx.amount, 
        source: tx.reason, 
        ref: tx.reference_label || '-', 
        reason: tx.reason,
      })))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingWallet(false)
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
  )
}