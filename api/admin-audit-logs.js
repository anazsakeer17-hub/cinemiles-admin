// api/admin-audit-logs.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const token = authHeader.replace('Bearer ', '')
    const authSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    const { data: userData, error: userError } = await authSupabase.auth.getUser(token)
    
    if (userError || !userData.user) return res.status(401).json({ error: 'Invalid token' })

    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: roleRow } = await adminSupabase.from('users').select('role').eq('auth_id', userData.user.id).single()
    if (roleRow?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

    const { userId, page = 1, pageSize = 25 } = req.query
    if (!userId) return res.status(400).json({ error: 'User ID required' })

    const from = (parseInt(page) - 1) * parseInt(pageSize)
    const to = from + parseInt(pageSize) - 1

    const { data, count, error } = await adminSupabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return res.status(200).json({ data, count })
  } catch (err) {
    console.error('Admin audit logs error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}