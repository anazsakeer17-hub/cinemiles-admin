import { useState, useEffect } from 'react'
import { CheckCircle, Copy } from 'lucide-react'

export default function AuditTab({ userId }) {
  const PAGE_SIZE = 25

  const [auditLogs, setAuditLogs] = useState([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [totalAudit, setTotalAudit] = useState(0)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (userId) fetchAuditLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, auditPage])

  async function fetchAuditLogs() {
    setLoadingAudit(true)
    
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: auditPage, pageSize: PAGE_SIZE
      })

      const response = await fetch(`/api/admin-audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const { data, count } = await response.json()
      
      setTotalAudit(count || 0)
      setAuditLogs(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingAudit(false)
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
  )
}