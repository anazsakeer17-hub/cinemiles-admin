import { useState, useEffect } from 'react'
import { Gift, Coins, Ticket, AlertTriangle, CheckCircle, Copy } from 'lucide-react'

export default function RewardsTab({ userId }) {
  const PAGE_SIZE = 25

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

  const [copiedId, setCopiedId] = useState(null)

  // Reset page effects on filter changes
  useEffect(() => setInventoryPage(1), [inventoryFilterStatus, inventoryFilterDateFrom, inventoryFilterDateTo])
  useEffect(() => setRedemptionsPage(1), [redemptionFilterDateFrom, redemptionFilterDateTo])

  // Fetch Data Effects
  useEffect(() => {
    if (userId) fetchRewardsStats()
  }, [userId])

  useEffect(() => {
    if (userId) fetchRewardsInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, inventoryFilterStatus, inventoryFilterDateFrom, inventoryFilterDateTo, inventoryPage])

  useEffect(() => {
    if (userId) fetchRewardsRedemptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, redemptionFilterDateFrom, redemptionFilterDateTo, redemptionsPage])

 async function fetchRewardsStats() {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin-rewards-stats?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const { data } = await response.json()
      setRewardsStats(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchRewardsInventory() {
    setLoadingInventory(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: inventoryPage, pageSize: PAGE_SIZE, status: inventoryFilterStatus,
      })
      if (inventoryFilterDateFrom) params.append('dateFrom', inventoryFilterDateFrom)
      if (inventoryFilterDateTo) params.append('dateTo', inventoryFilterDateTo)

      const response = await fetch(`/api/admin-rewards-inventory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch inventory')

      const { data, count } = await response.json()
      setTotalInventory(count || 0)
      setRewardsInventory(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingInventory(false)
    }
  }

  async function fetchRewardsRedemptions() {
    setLoadingRedemptions(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: redemptionsPage, pageSize: PAGE_SIZE
      })
      if (redemptionFilterDateFrom) params.append('dateFrom', redemptionFilterDateFrom)
      if (redemptionFilterDateTo) params.append('dateTo', redemptionFilterDateTo)

      const response = await fetch(`/api/admin-rewards-redemptions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch redemptions')

      const { data, count } = await response.json()
      setTotalRedemptions(count || 0)
      setRewardsRedemptions(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingRedemptions(false)
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

  const getRewardStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'unused': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 w-max">Active / Unused</span>
      case 'used': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 w-max">Used</span>
      case 'expired': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 w-max">Expired</span>
      default: return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 w-max">{status}</span>
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
  )
}