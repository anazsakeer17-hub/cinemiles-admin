import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabaseClient'
import { 
  LayoutDashboard, Users, ShieldCheck, Trophy, 
  CircleDollarSign, Gift, Building2, Film, 
  Megaphone, LineChart, Settings, LogOut, Menu, Bell, Search 
} from 'lucide-react'
import appLogo from '../assets/Images/app-icon.png'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // 🏗 THE ENTERPRISE ARCHITECTURE NAVIGATION
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Tickets & Fraud', path: '/tickets-fraud', icon: ShieldCheck },
    { name: 'Seasons & Levels', path: '/seasons', icon: Trophy },
    { name: 'Miles Economy', path: '/economy', icon: CircleDollarSign },
    { name: 'Rewards', path: '/rewards', icon: Gift },
    { name: 'Theatres', path: '/theatres', icon: Building2 },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Engagement', path: '/engagement', icon: Megaphone },
    { name: 'Finance', path: '/finance', icon: LineChart },
    { name: 'System Control', path: '/system', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <aside className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full z-20'}`}>
        {/* Sidebar Header / Logo */}
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 shrink-0">
          <img src={appLogo} alt="Logo" className="w-8 h-8 rounded-lg mr-3 bg-white p-0.5" />
          <span className="text-white font-bold text-lg tracking-wide">CineMiles</span>
        </div>

        {/* Navigation Links - Now nicely scrollable for the large architecture */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#A855F7] text-white shadow-md' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">{link.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-500 hover:text-slate-700 focus:outline-none p-2 rounded-md hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex items-center ml-4 bg-slate-100 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-[#A855F7] focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search global records..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A855F7] to-[#60A5FA] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                SA
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-700 leading-none">Super Admin</p>
                <p className="text-xs text-slate-500 mt-1">Platform Control</p>
              </div>
            </div>
          </div>
        </header>

        {/* 3. PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet /> 
        </main>
      </div>
    </div>
  )
}