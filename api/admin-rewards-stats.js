// api/admin-rewards-stats.js
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

    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'User ID required' })

    const { data, error } = await adminSupabase
      .from('admin_user_rewards_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore "no rows returned"

    return res.status(200).json({ data: data || null })
  } catch (err) {
    console.error('Admin rewards stats error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}