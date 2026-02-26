import {
  Users, Activity, Ticket, CheckCircle, ShieldAlert,
  Trophy, Coins, Gift, TrendingUp, Building2, Film,
  PieChart, AlertTriangle, ArrowUpRight, ArrowDownRight,
  ChevronRight, BarChart3, LineChart
} from 'lucide-react'

export default function Dashboard() {

  /* =========================================================
     1️⃣ ACTION CENTER (CRITICAL OPERATIONS ALERTS)
  ========================================================== */

  const actionAlerts = [
    { label: "Pending Tickets", value: "182", sub: "Requires manual review", severity: "warning" },
    { label: "High-Risk Fraud Cases", value: "7", sub: "Immediate action needed", severity: "danger" },
    { label: "Rewards Low Inventory", value: "3", sub: "Under 10 items left", severity: "warning" },
    { label: "Miles Inflation", value: "Alert", sub: "Trending above 5% threshold", severity: "info" },
  ]

  const alertStyles = {
    danger: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500", dot: "bg-red-500" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500", dot: "bg-amber-500" },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-500", dot: "bg-blue-500" },
  }

  /* =========================================================
     2️⃣ KPI DATA (TREND-AWARE)
  ========================================================== */

  const engagementStats = [
    { title: "Total Users", value: "124,592", trend: "+2.4%", isPositive: true, icon: Users, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
    { title: "Active Users (30d)", value: "48,231", trend: "+1.2%", isPositive: true, icon: Activity, color: "text-[#60A5FA]", bg: "bg-[#60A5FA]/10" },
    { title: "Total Claps", value: "2.4M", trend: "+3.8%", isPositive: true, icon: Trophy, color: "text-[#FACC15]", bg: "bg-[#FACC15]/15" },
    { title: "Top Movie", value: "Dune: Part Two", trend: "14.2k claims", isNeutral: true, icon: Film, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
  ]

  const economyStats = [
    { title: "Miles Minted", value: "85.2M", trend: "+5.2%", isPositive: true, icon: Coins, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { title: "Miles Burned", value: "32.1M", trend: "+3.1%", isPositive: true, icon: Gift, color: "text-[#FACC15]", bg: "bg-[#FACC15]/15" },
    { title: "Net Inflation", value: "+4.2%", trend: "Healthy", isNeutral: true, icon: TrendingUp, color: "text-[#60A5FA]", bg: "bg-[#60A5FA]/10" },
    { title: "Redemption Rate", value: "37.6%", trend: "+1.1%", isPositive: true, icon: PieChart, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
  ]

  const fraudStats = [
    { title: "Tickets (Today)", value: "3,402", trend: "+6.0%", isPositive: true, icon: Ticket, color: "text-[#60A5FA]", bg: "bg-[#60A5FA]/10" },
    { title: "Approval Rate", value: "94.2%", trend: "+0.8%", isPositive: true, icon: CheckCircle, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { title: "Fraud Rate", value: "1.8%", trend: "-0.3%", isPositive: true, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" }, // Negative trend is good here
    { title: "Top Theatre", value: "PVR Lulu Mall", trend: "1.2k scans", isNeutral: true, icon: Building2, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
  ]

  /* =========================================================
     3️⃣ REUSABLE KPI CARD
  ========================================================== */

  const StatCard = ({ stat }) => (
    <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`${stat.bg} ${stat.color} p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 ease-out`}>
          <stat.icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        
        {/* Dynamic Trend Pill */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          stat.isNeutral 
            ? 'bg-slate-100 text-slate-600' 
            : stat.isPositive 
              ? 'bg-[#22C55E]/10 text-[#16a34a]' 
              : 'bg-red-50 text-red-600'
        }`}>
          {!stat.isNeutral && (
            stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
          )}
          {stat.trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
      </div>
    </div>
  )

  /* =========================================================
     4️⃣ DASHBOARD LAYOUT
  ========================================================== */

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 font-sans">

      {/* HEADER */}
      <div className="relative bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#A855F7] via-[#60A5FA] to-[#22C55E]" />
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Control Center</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1.5">Operational overview of the CineMiles ecosystem</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#22C55E]/10 border border-[#22C55E]/20 px-4 py-3 rounded-2xl shrink-0">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#22C55E]"></span>
          </span>
          <span className="text-[#16a34a] font-bold text-sm tracking-wide uppercase">System Healthy</span>
        </div>
      </div>

      {/* ACTION CENTER */}
      <section>
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Action Required</h2>
          </div>
          <button className="text-sm font-semibold text-[#60A5FA] hover:text-blue-700 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {actionAlerts.map((alert, idx) => {
            const style = alertStyles[alert.severity]
            return (
              <div
                key={idx}
                className={`p-5 rounded-[20px] border ${style.bg} ${style.border} flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${style.dot} mt-1.5`} />
                  <span className={`text-2xl font-black ${style.text} tracking-tight leading-none`}>{alert.value}</span>
                </div>
                <div>
                  <p className={`font-bold ${style.text} leading-tight`}>{alert.label}</p>
                  <p className={`text-xs font-medium ${style.text} opacity-70 mt-1`}>{alert.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ENGAGEMENT */}
      <section>
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="p-2 bg-[#A855F7]/10 rounded-xl">
            <Activity className="w-5 h-5 text-[#A855F7]" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Platform Engagement</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {engagementStats.map((stat, idx) => <StatCard key={`eng-${idx}`} stat={stat} />)}
        </div>
      </section>

      {/* ECONOMY */}
      <section>
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="p-2 bg-[#FACC15]/15 rounded-xl">
            <Coins className="w-5 h-5 text-[#ca8a04]" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">The Miles Economy</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {economyStats.map((stat, idx) => <StatCard key={`eco-${idx}`} stat={stat} />)}
        </div>
      </section>

      {/* TICKETS & FRAUD */}
      <section>
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="p-2 bg-slate-100 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Tickets & Fraud Engine</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {fraudStats.map((stat, idx) => <StatCard key={`fraud-${idx}`} stat={stat} />)}
        </div>
      </section>

      {/* CHARTS PLACEHOLDER SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Level Distribution</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="flex-1 min-h-[200px] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 gap-2">
             <PieChart className="w-8 h-8 opacity-50" />
             <span className="text-sm font-medium">Distribution Chart Placeholder</span>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Miles Minted vs Burned</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <LineChart className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="flex-1 min-h-[200px] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 gap-2">
             <TrendingUp className="w-8 h-8 opacity-50" />
             <span className="text-sm font-medium">Economy Trend Chart Placeholder</span>
          </div>
        </div>

      </section>

    </div>
  )
}