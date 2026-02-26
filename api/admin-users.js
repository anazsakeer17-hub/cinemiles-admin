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

    // Verify admin role
    const { data: roleRow, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', userData.user.id)
      .single()

    if (roleError || roleRow?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Query params
    const {
      page = 1,
      pageSize = 10,
      search = '',
      city = '',
      level = '',
      fraud = 'all'
    } = req.query

    const pageNumber = parseInt(page)
    const size = parseInt(pageSize)

    const from = (pageNumber - 1) * size
    const to = from + size - 1

    let query = supabase
      .from('admin_users_overview')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(from, to)

    // Preserve search logic
    if (search?.trim()) {
      const term = search.trim()
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`)
    }

    // Preserve city filter
    if (city) {
      query = query.eq('city', city)
    }

    // Preserve level filter
    if (level) {
      query = query.eq('level_name', level)
    }

    // Preserve fraud filter
    if (fraud === 'flagged') {
      query = query.gt('fraud_count', 0)
    } else if (fraud === 'clean') {
      query = query.eq('fraud_count', 0)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Preserve formatting logic
    const formatted = (data || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      city: u.city,
      level: u.level_name || 'Viewer',
      miles: u.miles_balance ?? 0,
      claps: u.total_claps ?? 0,
      fraudFlag: u.fraud_count > 0,
      status: 'active'
    }))

    return res.status(200).json({
      data: formatted,
      count
    })

  } catch (err) {
    console.error('Admin users error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}