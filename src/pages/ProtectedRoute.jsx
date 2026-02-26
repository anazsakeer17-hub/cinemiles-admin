import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../api/supabaseClient"

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single()

      if (data?.role === "admin") {
        setIsAdmin(true)
      }

      setLoading(false)
    }

    checkRole()
  }, [])

  if (loading) return <div>Checking access...</div>

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}