import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Filter, ShieldAlert, CheckCircle, 
  MoreVertical, Eye, ChevronDown
} from 'lucide-react'

export default function Users() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search States
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Filter States
  const [filterCity, setFilterCity] = useState('')
  const [citiesList, setCitiesList] = useState([])
  
  const [filterLevel, setFilterLevel] = useState('')
  const [levelsList, setLevelsList] = useState([])

  const [filterFraud, setFilterFraud] = useState('all')
  
  const [page, setPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const PAGE_SIZE = 10

  // Fetch filter dropdown data from backend
  useEffect(() => {
    async function fetchFilters() {
      try {
        const token = localStorage.getItem("admin_token")

        const response = await fetch('/api/admin-filters', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const result = await response.json()

        if (!response.ok) throw new Error(result.error)

        setCitiesList(result.cities || [])
        setLevelsList(result.levels || [])

      } catch (err) {
        console.error("Filter fetch error:", err)
      }
    }

    fetchFilters()
  }, [])

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterCity, filterLevel, filterFraud])

  // Fetch users
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, filterCity, filterLevel, filterFraud])

  async function fetchUsers() {
    setLoading(true)

    try {
      const token = localStorage.getItem("admin_token")

      const params = new URLSearchParams({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        city: filterCity,
        level: filterLevel,
        fraud: filterFraud
      })

      const response = await fetch(`/api/admin-users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      setUsers(result.data || [])
      setTotalUsers(result.count || 0)

    } catch (err) {
      console.error("User fetch error:", err)
    }

    setLoading(false)
  }

  const getLevelBadge = (level) => {
    const styles = {
      'Viewer': 'bg-slate-100 text-slate-700 border-slate-200',
      'Fan': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rising Star': 'bg-sky-100 text-sky-700 border-sky-200',
      'Superstar': 'bg-purple-100 text-purple-700 border-purple-200',
      'Legend': 'bg-amber-100 text-amber-800 border-amber-300',
    }
    const style = styles[level] || 'bg-slate-100 text-slate-600 border-slate-200'

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${style}`}>
        {level}
      </span>
    )
  }

  const start = totalUsers === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, totalUsers)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Search, filter, and manage Cinemiles accounts.</p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:bg-white transition-colors"
            placeholder="Search by name or email..."
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          
          {/* Dynamic City Filter Dropdown */}
          <div className="relative shrink-0">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] cursor-pointer transition-colors"
            >
              <option value="">All Cities</option>
              {citiesList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Dynamic Level Filter Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] cursor-pointer transition-colors"
            >
              <option value="">All Levels</option>
              {levelsList.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Fraud Status Filter Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filterFraud}
              onChange={(e) => setFilterFraud(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#A855F7] cursor-pointer transition-colors"
            >
              <option value="all">All Status</option>
              <option value="clean">Clean</option>
              <option value="flagged">Flagged</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="p-10 text-center text-slate-500 font-medium">
            Fetching users...
          </div>
        )}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Wallet Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isProfileIncomplete = !user.name || !user.city
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#A855F7]/20 to-[#60A5FA]/20 text-[#A855F7] flex items-center justify-center font-bold text-sm shrink-0">
                              {(user.name || user.email)?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">
                                  {user.name || user.email?.split('@')[0]}
                                </p>
                                {isProfileIncomplete && (
                                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                    Incomplete
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                          {user.city || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getLevelBadge(user.level)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {user.miles.toLocaleString()} Miles
                            </span>
                            <span className="text-xs text-slate-500">
                              {user.claps} Claps
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            {user.fraudFlag && (
                              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                                <ShieldAlert className="w-3 h-3" /> Flagged
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/users/${user.id}`)}
                              className="p-2 text-slate-400 hover:text-[#A855F7] hover:bg-[#A855F7]/10 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing {totalUsers === 0 ? 0 : start} to {end} of {totalUsers.toLocaleString()} users
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-opacity"
            >
              Previous
            </button>
            <button
              disabled={page * PAGE_SIZE >= totalUsers || loading}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}