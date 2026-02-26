import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Validate token
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Check role from database
    const { data: userRow, error: roleError } =
      await supabase
        .from('users')
        .select('role')
        .eq('auth_id', userData.user.id)
        .single()

    if (roleError || userRow?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}