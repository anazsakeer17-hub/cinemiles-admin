import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' })
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

    // Verify admin
    const { data: roleRow } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', userData.user.id)
      .single()

    if (roleRow?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Fetch cities
    const { data: cities } = await supabase
      .from('cities')
      .select('name')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('name', { ascending: true })

    // Fetch levels
    const { data: levels } = await supabase
      .from('cinephile_levels')
      .select('name')
      .order('min_claps', { ascending: true })

    const levelNames = levels?.map(l => l.name) || []

    if (!levelNames.includes('Viewer')) {
      levelNames.unshift('Viewer')
    }

    return res.status(200).json({
      cities: cities?.map(c => c.name) || [],
      levels: levelNames
    })

  } catch (err) {
    console.error('Admin filters error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}