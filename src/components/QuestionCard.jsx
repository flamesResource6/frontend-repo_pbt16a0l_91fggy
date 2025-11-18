export default function QuestionCard({ q, onAnswer, disabled }) {
  return (
    <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5 mb-4">
      <p className="text-lg text-white mb-4">{q.prompt}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onAnswer(q.index, idx)}
            className="text-left px-4 py-3 rounded-lg bg-slate-700/60 hover:bg-slate-700/80 border border-slate-600/50 text-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="mr-2 font-semibold text-blue-300">{String.fromCharCode(65 + idx)}.</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
