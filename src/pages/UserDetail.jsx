import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Simple Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/users')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </button>

        <div className="text-sm text-slate-400">
          User ID: {id}
        </div>
      </div>

      {/* Blank Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">
            User Detail Page
          </h1>
          <p className="text-slate-500">
            Deployment Test Mode
          </p>
        </div>
      </div>

    </div>
  )
}