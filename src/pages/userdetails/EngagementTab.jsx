import { useState, useEffect } from 'react'
import { BrainCircuit, MessageSquare, Star, CheckCircle, Copy } from 'lucide-react'

export default function EngagementTab({ userId }) {
  const PAGE_SIZE = 25

  // Engagement States 
  const [quizStats, setQuizStats] = useState(null)
  const [quizAttempts, setQuizAttempts] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loadingEngagement, setLoadingEngagement] = useState(false)
  const [quizFilterDateFrom, setQuizFilterDateFrom] = useState('')
  const [quizFilterDateTo, setQuizFilterDateTo] = useState('')
  const [quizPage, setQuizPage] = useState(1)
  const [totalQuiz, setTotalQuiz] = useState(0)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [copiedId, setCopiedId] = useState(null)

  // Reset page effects on filter changes
  useEffect(() => setQuizPage(1), [quizFilterDateFrom, quizFilterDateTo])

  // Fetch Data Effects
  useEffect(() => {
    if (userId) fetchEngagementStats()
  }, [userId])

  useEffect(() => {
    if (userId) fetchQuizAttempts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, quizFilterDateFrom, quizFilterDateTo, quizPage])

  useEffect(() => {
    if (userId) fetchUserReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, reviewsPage])

  async function fetchEngagementStats() {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin-engagement-stats?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch engagement stats')
      
      const { quizStats, reviewStats } = await response.json()
      setQuizStats(quizStats)
      setReviewStats(reviewStats)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchQuizAttempts() {
    setLoadingEngagement(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: quizPage, pageSize: PAGE_SIZE
      })
      if (quizFilterDateFrom) params.append('dateFrom', quizFilterDateFrom)
      if (quizFilterDateTo) params.append('dateTo', quizFilterDateTo)

      const response = await fetch(`/api/admin-engagement-quizzes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch quizzes')

      const { data, count } = await response.json()
      setTotalQuiz(count || 0)
      setQuizAttempts(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingEngagement(false)
    }
  }

  async function fetchUserReviews() {
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams({
        userId, page: reviewsPage, pageSize: PAGE_SIZE
      })

      const response = await fetch(`/api/admin-engagement-reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch reviews')

      const { data, count } = await response.json()
      setTotalReviews(count || 0)
      setReviews(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedId(text)
        setTimeout(() => setCopiedId(null), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr)
        alert('Failed to copy. Please select and copy manually.')
      }
      document.body.removeChild(textArea)
    }
  }

  const renderPagination = (page, total, setPageFn, loadingState) => {
    const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, total)
    return (
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {start} to {end} of {total.toLocaleString()} records</span>
        <div className="flex gap-2">
          <button
            disabled={page === 1 || loadingState}
            onClick={() => setPageFn(p => p - 1)}
            className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-opacity"
          >
            Previous
          </button>
          <button
            disabled={page * PAGE_SIZE >= total || loadingState}
            onClick={() => setPageFn(p => p + 1)}
            className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-opacity"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: QUIZ ACTIVITY */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-500"/> Quiz Activity
        </h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          {/* Total Attempts */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Total Attempts
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {quizStats?.total_attempts || 0}
            </p>
          </div>

          {/* Unique Quizzes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Unique Quizzes
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {quizStats?.unique_quizzes || 0}
            </p>
          </div>

          {/* Average Accuracy */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Avg Accuracy
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {quizStats?.avg_accuracy_percent
                ? `${quizStats.avg_accuracy_percent}%`
                : '0%'}
            </p>
          </div>

          {/* Miles Earned */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Miles Earned
            </p>
            <p className="text-2xl font-bold text-[#A855F7]">
              {quizStats?.total_miles_earned || 0}
            </p>
          </div>

          {/* Last Submission */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Last Submission
            </p>
            <p className="text-sm font-bold text-slate-800 mt-2">
            {quizStats?.last_submission
          ? new Date(quizStats.last_submission).toLocaleString('en-IN')
          : '—'}
            </p>
          </div>

        </div>

        {/* Quiz Attempts Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
            <h3 className="font-bold text-slate-800">Quiz Attempts Log</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={quizFilterDateFrom}
                  onChange={(e) => setQuizFilterDateFrom(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                />
                <span className="text-slate-400 text-sm">to</span>
                <input 
                  type="date" 
                  value={quizFilterDateTo}
                  onChange={(e) => setQuizFilterDateTo(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-slate-600 font-medium" 
                />
              </div>
              
              {(quizFilterDateFrom || quizFilterDateTo) && (
                <button 
                  onClick={() => { setQuizFilterDateFrom(''); setQuizFilterDateTo(''); }}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Quiz Title</th>
                  <th className="px-6 py-3">Attempt ID</th>
                  <th className="px-6 py-3">Submitted At</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3">Accuracy</th>
                  <th className="px-6 py-3">Miles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingEngagement ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">
                      Loading quiz attempts...
                    </td>
                  </tr>
                ) : quizAttempts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">
                      No quiz attempts found matching filters.
                    </td>
                  </tr>
                ) : (
                  quizAttempts.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-slate-50">
                      
                      {/* Quiz Title */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {quiz.quiz_title}
                      </td>

                      {/* Attempt ID */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span title={quiz.id}>
                            {quiz.id.split('-')[0]}...{quiz.id.split('-')[4]}
                          </span>
                          <button
                            onClick={() => handleCopy(quiz.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {copiedId === quiz.id ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(quiz.submitted_at).toLocaleString('en-IN')}
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-medium text-slate-700">
                        {quiz.correct_answers} / {quiz.total_questions}
                      </td>

                      {/* Accuracy */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            quiz.accuracy_percent >= 80
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {quiz.accuracy_percent}%
                        </span>
                      </td>

                      {/* Miles */}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-[#A855F7]">
                        {quiz.miles_awarded > 0 ? `+${quiz.miles_awarded}` : '0'} M
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination(quizPage, totalQuiz, setQuizPage, loadingEngagement)}
        </div>
      </div>

      {/* SECTION 2: THEATRE REVIEWS */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500"/> Theatre Reviews
        </h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Written</p>
           <p className="text-2xl font-bold text-slate-900">
            {reviewStats?.total_reviews || 0}
          </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-slate-900 flex items-center gap-1">{reviewStats?.avg_rating || 0} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/></p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">5★ Count</p>
            <p className="text-2xl font-bold text-emerald-600">{reviewStats?.five_star_count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">1★ Count</p>
            <p className="text-2xl font-bold text-rose-600"> {reviewStats?.one_star_count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Last Review</p>
            <p className="text-sm font-bold text-slate-800 mt-2"> {reviewStats?.last_review
            ? new Date(reviewStats.last_review).toLocaleString('en-IN')
            : '—'}</p>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Review History</h3>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Theatre & City</th>
                  <th className="px-6 py-3">Breakdown</th>
                  <th className="px-6 py-3">Overall</th>
                  <th className="px-6 py-3 w-1/3">Review Text</th>
                  <th className="px-6 py-3">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingEngagement ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400">
                      Loading reviews...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50 items-start">
                      
                      {/* Theatre */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          {review.theatre_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {review.city}
                        </p>
                      </td>

                      {/* Breakdown */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span>Screen: <strong>{review.screen_rating}</strong></span>
                          <span>Sound: <strong>{review.sound_rating}</strong></span>
                          <span>Snacks: <strong>{review.snacks_rating}</strong></span>
                          <span>Comfort: <strong>{review.comfort_rating}</strong></span>
                        </div>
                      </td>

                      {/* Overall */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold flex items-center gap-1">
                          {review.overall_rating}
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                        </span>
                      </td>

                      {/* Review Text */}
                      <td className="px-6 py-4 text-slate-700">
                        <p className="line-clamp-2" title={review.review_text}>
                          {review.review_text}
                        </p>
                      </td>

                      {/* Timeline */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        <p>
                          Created: {new Date(review.created_at).toLocaleString('en-IN')}
                        </p>
                        {review.updated_at && review.updated_at !== review.created_at && (
                          <p className="mt-0.5">
                            Updated: {new Date(review.updated_at).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination(reviewsPage, totalReviews, setReviewsPage, loadingEngagement)}
        </div>
      </div>

    </div>
  )
}