import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedRoute from './pages/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Architecture Placeholder Routes */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/tickets-fraud" element={<div className="p-6 text-2xl font-bold">Tickets & Fraud Engine Coming Soon</div>} />
        <Route path="/seasons" element={<div className="p-6 text-2xl font-bold">Seasons & Levels Control Coming Soon</div>} />
        <Route path="/economy" element={<div className="p-6 text-2xl font-bold">Miles Economy Control Coming Soon</div>} />
        <Route path="/rewards" element={<div className="p-6 text-2xl font-bold">Rewards Catalog Coming Soon</div>} />
        <Route path="/theatres" element={<div className="p-6 text-2xl font-bold">Theatre Management Coming Soon</div>} />
        <Route path="/movies" element={<div className="p-6 text-2xl font-bold">Movies Management Coming Soon</div>} />
        <Route path="/engagement" element={<div className="p-6 text-2xl font-bold">Engagement Module Coming Soon</div>} />
        <Route path="/finance" element={<div className="p-6 text-2xl font-bold">Finance Module Coming Soon</div>} />
        <Route path="/system" element={<div className="p-6 text-2xl font-bold">System Control Coming Soon</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}