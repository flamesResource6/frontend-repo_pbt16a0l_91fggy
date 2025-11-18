import { useEffect, useState } from 'react'

export default function Timer({ endsAt, onExpire }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const rem = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000))
      setRemaining(rem)
      if (rem === 0 && onExpire) onExpire()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, onExpire])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="inline-flex items-center gap-2 text-sm font-mono text-blue-200">
      <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30">{mm}:{ss}</span>
      <span className="text-blue-300/70">remaining</span>
    </div>
  )
}
