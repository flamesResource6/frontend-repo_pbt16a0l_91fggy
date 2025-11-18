import { useEffect, useMemo, useState } from 'react'
import Timer from './components/Timer'
import QuestionCard from './components/QuestionCard'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [stage, setStage] = useState('intro') // intro | playing | results
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [endsAt, setEndsAt] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answered, setAnswered] = useState({})
  const [playerName, setPlayerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])

  const loadLeaderboard = async () => {
    try {
      const r = await fetch(`${baseUrl}/api/leaderboard`)
      const data = await r.json()
      setLeaderboard(data.items || [])
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const startGame = async () => {
    const r = await fetch(`${baseUrl}/api/start`, { method: 'POST' })
    const data = await r.json()
    setSession(data.session_id)
    setEndsAt(data.ends_at)
    setQuestions(data.questions)
    setStage('playing')
    setScore(0)
    setStreak(0)
    setAnswered({})
  }

  const handleAnswer = async (qIndex, choice) => {
    if (!session) return
    if (answered[qIndex]) return
    const res = await fetch(`${baseUrl}/api/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session, question_index: qIndex, selected_index: choice })
    })
    const data = await res.json()
    setScore(data.score)
    setStreak(data.streak)
    setAnswered((a) => ({ ...a, [qIndex]: true }))
  }

  const endGame = async () => {
    setStage('results')
  }

  const durationSeconds = useMemo(() => {
    if (!endsAt) return 0
    const end = new Date(endsAt).getTime()
    const now = Date.now()
    return Math.max(1, Math.floor((end - now) / 1000))
  }, [endsAt, stage])

  const submitScore = async () => {
    if (!playerName.trim()) return
    try {
      setSubmitting(true)
      await fetch(`${baseUrl}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName.trim(),
          score,
          duration_seconds: Math.min(300, 300 - durationSeconds),
          streak,
        })
      })
      setPlayerName('')
      await loadLeaderboard()
    } catch (e) {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative text-blue-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.2),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(2,132,199,0.15),transparent_30%)]" />

      <div className="relative max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Arcane Blitz</h1>
            <p className="text-blue-300/80">A 5-minute fantasy knowledge duel</p>
          </div>
          {stage === 'playing' && endsAt && (
            <Timer endsAt={endsAt} onExpire={endGame} />
          )}
        </div>

        {stage === 'intro' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">How it works</h2>
                <ul className="list-disc pl-5 space-y-2 text-blue-200/90 text-sm">
                  <li>You get a mix of fantasy-themed quick-fire questions.</li>
                  <li>Answer as many as you can before time runs out.</li>
                  <li>Rack up points and build streaks for glory.</li>
                </ul>
              </div>
              <button onClick={startGame} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition">
                Begin the Challenge
              </button>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
                <div className="space-y-3">
                  {(leaderboard || []).slice(0, 10).map((item, i) => (
                    <div key={item._id || i} className="flex items-center justify-between bg-slate-800/60 rounded-lg p-3 border border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-blue-300">{i + 1}</span>
                        <span className="font-semibold text-white">{item.player_name || 'Mage'}</span>
                      </div>
                      <span className="text-blue-200">{item.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === 'playing' && (
          <div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {questions.map((q) => (
                  <QuestionCard key={q.index} q={q} onAnswer={handleAnswer} disabled={false} />
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 sticky top-6">
                  <div className="mb-4">
                    <div className="text-sm text-blue-300/90">Score</div>
                    <div className="text-3xl font-extrabold text-white">{score}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-blue-300/90">Streak</div>
                    <div className="text-2xl font-bold text-white">{streak}</div>
                  </div>
                  <button onClick={endGame} className="w-full px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-blue-100 border border-slate-600/60">End Early</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === 'results' && (
          <div className="max-w-2xl">
            <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Your Results</h2>
              <p className="text-blue-200">Score: <span className="font-semibold text-white">{score}</span> • Best Streak: <span className="font-semibold text-white">{streak}</span></p>
            </div>
            <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Enter your name to join the Leaderboard</h3>
              <div className="flex gap-3">
                <input value={playerName} onChange={(e)=>setPlayerName(e.target.value)} placeholder="Your adventurer name" className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-blue-100 placeholder:text-blue-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button disabled={submitting || !playerName.trim()} onClick={submitScore} className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">Submit</button>
              </div>
            </div>
            <button onClick={() => setStage('intro')} className="px-6 py-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-blue-100 border border-slate-600/60">Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
