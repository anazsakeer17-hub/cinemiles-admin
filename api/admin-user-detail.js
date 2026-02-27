// api/admin-user-detail.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const token = authHeader.replace('Bearer ', '')
    
    // Auth client uses anon key to verify token
    const authSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    const { data: userData, error: userError } = await authSupabase.auth.getUser(token)
    
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Admin DB client uses Service Role Key to bypass RLS
    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Verify admin role
    const { data: roleRow } = await adminSupabase
      .from('users')
      .select('role')
      .eq('auth_id', userData.user.id)
      .single()

    if (roleRow?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'User ID required' })

    // Fetch Overview
    const { data: overview, error: overviewError } = await adminSupabase
      .from('admin_users_overview')
      .select('*')
      .eq('id', id)
      .single()

    if (overviewError) throw overviewError

    // Fetch Wallet Stats
    const { data: walletStats } = await adminSupabase
      .from('admin_user_wallet_stats')
      .select('*')
      .eq('user_id', id)
      .single()

    return res.status(200).json({
      overview,
      walletStats: walletStats || null
    })

  } catch (err) {
    console.error('Admin user detail error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}