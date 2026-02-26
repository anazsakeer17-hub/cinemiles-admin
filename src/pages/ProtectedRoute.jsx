import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("admin_token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/admin-verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setAuthorized(true)
        }
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    }

    verify()
  }, [])

  if (loading) return <div>Checking access...</div>

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return children
}