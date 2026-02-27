// api/admin-ticket-actions.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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

    const { action, payload } = req.body

    // 1. Handle View Receipt action
    if (action === 'view-receipt') {
      const { data, error } = await adminSupabase.functions.invoke('admin-get-receipt-url', { 
        body: { path: payload.path } 
      })
      if (error) throw error
      return res.status(200).json({ signedUrl: data.signedUrl })
    }

    // 2. Handle Revoke Claim action
    if (action === 'revoke-claim') {
      const { error } = await adminSupabase.functions.invoke('revoke-ticket-claim', { 
        body: { ticket_claim_id: payload.claimId } 
      })
      if (error) throw error
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: 'Invalid action' })

  } catch (err) {
    console.error('Admin ticket actions error:', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}