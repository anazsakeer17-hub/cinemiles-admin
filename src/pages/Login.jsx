import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import appLogo from '../assets/Images/app-icon.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // NEW: State to control password visibility
  const [showPassword, setShowPassword] = useState(false) 
  
  const navigate = useNavigate()

 const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    const response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error)
    }

    // Save token
    localStorage.setItem('admin_token', result.access_token)

    navigate('/dashboard')
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle background ambient glows */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#A855F7]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#60A5FA]/5 blur-[120px]" />

      <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden z-10">
        
        {/* Signature Brand Gradient Top Border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#A855F7] via-[#60A5FA] to-[#22C55E]" />

        <div className="p-8 sm:p-10">
          {/* Header Section */}
          <div className="mb-8 text-center flex flex-col items-center">
            
            <div className="w-16 h-16 mb-5 rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-1 bg-white">
              <img 
                src={appLogo}
                alt="CineMiles Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              CineMiles Admin
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              Secure portal for operations management.
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#A855F7] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#A855F7]/15 focus:border-[#A855F7] transition-all duration-200 sm:text-sm font-medium"
                  placeholder="admin@cinemiles.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                Password
                <a href="#" className="text-[#A855F7] hover:text-purple-700 font-semibold transition-colors">Forgot?</a>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#A855F7] transition-colors" />
                </div>
                
                {/* NEW: Dynamic input type based on state */}
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#A855F7]/15 focus:border-[#A855F7] transition-all duration-200 sm:text-sm font-medium"
                  placeholder="••••••••"
                />
                
                {/* NEW: Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#A855F7] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 mt-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] text-sm font-bold text-white bg-gradient-to-r from-[#A855F7] to-[#8B5CF6] hover:from-[#9333EA] hover:to-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#A855F7]/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}