import { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle, Ban, Copy, Eye, RotateCcw } from 'lucide-react'

export default function TicketsTab({ userId }) {
  const PAGE_SIZE = 25

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
  const [copiedId, setCopiedId] = useState(null)

  // Reset page effects on filter changes
  useEffect(() => setClaimsPage(1), [claimFilterStatus, claimFilterDateFrom, claimFilterDateTo])
  useEffect(() => setReceiptsPage(1), [receiptFilterStatus, receiptFilterDateFrom, receiptFilterDateTo])

  // Fetch Data Effects
  useEffect(() => {
    if (userId) fetchUserClaims()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, claimFilterStatus, claimFilterDateFrom, claimFilterDateTo, claimsPage])

  useEffect(() => {
    if (userId) fetchUserReceipts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, receiptFilterStatus, receiptFilterDateFrom, receiptFilterDateTo, receiptsPage])

  async function fetchUserClaims() {
    setLoadingClaims(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: claimsPage, pageSize: PAGE_SIZE, status: claimFilterStatus,
      })
      if (claimFilterDateFrom) params.append('dateFrom', claimFilterDateFrom)
      if (claimFilterDateTo) params.append('dateTo', claimFilterDateTo)

      const response = await fetch(`/api/admin-ticket-claims?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch claims')
      
      const { data, count } = await response.json()
      setTotalClaims(count || 0)
      setUserClaims(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingClaims(false)
    }
  }

 async function fetchUserReceipts() {
    setLoadingReceipts(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: receiptsPage, pageSize: PAGE_SIZE, status: receiptFilterStatus,
      })
      if (receiptFilterDateFrom) params.append('dateFrom', receiptFilterDateFrom)
      if (receiptFilterDateTo) params.append('dateTo', receiptFilterDateTo)

      const response = await fetch(`/api/admin-ticket-receipts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch receipts')
      
      const { data, count } = await response.json()
      setTotalReceipts(count || 0)
      setUserReceipts(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingReceipts(false)
    }
  }

  // Action Helpers
  async function handleViewReceipt(path) {
    if (!path) return
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin-ticket-actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: 'view-receipt', payload: { path } })
      })
      
      if (!response.ok) throw new Error('Failed to load receipt')
      const result = await response.json()
      setPreviewImage(result.signedUrl)
    } catch (error) {
      console.error(error)
      alert('Could not load receipt image.')
    }
  }

  async function revokeClaim(claimId) {
    if (!window.confirm('Are you sure you want to revoke this claim?')) return
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin-ticket-actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: 'revoke-claim', payload: { claimId } })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to revoke')
      }
      
      fetchUserClaims() // Refresh the table
    } catch (error) {
      console.error(error)
      alert(error.message)
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
    <>
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-auto relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-slate-100 hover:bg-slate-200 rounded-full p-2"
            >
              ✕
            </button>
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
    </>
  )
}