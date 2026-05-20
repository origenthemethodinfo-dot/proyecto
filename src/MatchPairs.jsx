import { useState, useEffect, useRef } from 'react'
import { lessons } from '../data/lessons.js'
import { playCorrect, playIncorrect } from '../utils/sounds.js'

const allVocab = lessons.flatMap((l) =>
  (l.vocabulary || []).map((v) => ({ ...v, lessonId: l.id })),
)

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function MatchPairs({ onBack }) {
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [pairs, setPairs] = useState([])
  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState([])
  const [feedback, setFeedback] = useState(null)
  const timerRef = useRef(null)

  function startGame() {
    setScore(0)
    setTimeLeft(60)
    setMatched([])
    setSelected(null)
    setFeedback(null)
    setGameState('playing')

    const subset = shuffle(allVocab).slice(0, 6)
    const cards = []
    subset.forEach((v, i) => {
      cards.push({ id: `es-${i}`, text: v.noun, matchId: i, lang: 'es' })
      cards.push({ id: `en-${i}`, text: v.enDefinite.replace(/^the /i, ''), matchId: i, lang: 'en' })
    })
    setPairs(shuffle(cards))

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setGameState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handleCard(card) {
    if (feedback !== null || matched.includes(card.matchId) || (selected && selected.id === card.id)) return

    if (!selected) {
      setSelected(card)
      return
    }

    if (selected.matchId === card.matchId && selected.lang !== card.lang) {
      playCorrect()
      setScore((s) => s + 1)
      setMatched((prev) => [...prev, card.matchId])
      setSelected(null)
      if (matched.length + 1 >= pairs.length / 2) {
        setTimeout(() => setGameState('finished'), 800)
      }
    } else {
      playIncorrect()
      setFeedback('incorrect')
      setTimeout(() => {
        setFeedback(null)
        setSelected(null)
      }, 600)
    }
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div className="min-h-screen bg-origen-cream p-4 text-origen-carbon dark:bg-slate-950 dark:text-slate-200 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 rounded-xl bg-origen-white px-4 py-2 text-sm font-bold text-origen-carbon shadow-sm transition hover:bg-origen-cream dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-origen-mostaza/20 bg-origen-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-origen-mostaza/20 to-origen-granate/10 p-8 text-center">
            <h1 className="font-display text-4xl text-origen-granate dark:text-origen-mostaza">Match Pairs</h1>
            <p className="mt-2 font-bold text-origen-carbon/70 dark:text-slate-400">Find the matching words</p>
          </div>

          <div className="p-8">
            {gameState === 'start' && (
              <div className="text-center">
                <p className="text-xl font-bold text-origen-carbon/70 dark:text-slate-400">
                  Match 6 Spanish words with their English meanings in 60 seconds.
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  className="mt-8 rounded-2xl bg-origen-granate px-8 py-4 text-xl font-black text-white transition hover:bg-origen-granate/90"
                >
                  Start Game
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl bg-origen-mostaza/20 px-6 py-3 font-black text-origen-granate dark:bg-origen-mostaza/10 dark:text-origen-mostaza">
                    Score: {score}
                  </div>
                  <div className={`rounded-2xl px-6 py-3 font-black ${timeLeft <= 10 ? 'animate-pulse bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-origen-cream text-origen-carbon dark:bg-slate-800 dark:text-slate-300'}`}>
                    Time: {timeLeft}s
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {pairs.map((card) => {
                    const isMatched = matched.includes(card.matchId)
                    const isSelected = selected?.id === card.id
                    const isWrong = feedback === 'incorrect' && (selected?.id === card.id || (selected && selected.matchId !== card.matchId && isSelected))

                    let cls = 'bg-origen-white border-2 border-origen-cream text-origen-carbon hover:border-origen-mostaza hover:bg-origen-mostaza/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-origen-mostaza dark:hover:bg-origen-mostaza/20'
                    if (isMatched) {
                      cls = 'bg-green-100 border-2 border-green-500 text-green-900 dark:bg-green-900/40 dark:border-green-400 dark:text-green-100'
                    } else if (isSelected) {
                      cls = 'bg-origen-mostaza/20 border-2 border-origen-mostaza text-origen-granate dark:bg-origen-mostaza/30 dark:border-origen-mostaza dark:text-origen-mostaza'
                    } else if (isWrong) {
                      cls = 'bg-red-100 border-2 border-red-500 text-red-900 dark:bg-red-900/40 dark:border-red-400 dark:text-red-100'
                    }

                    return (
                      <button
                        key={card.id}
                        type="button"
                        className={`flex h-24 items-center justify-center rounded-2xl p-3 text-center text-lg font-black transition-all ${cls}`}
                        onClick={() => handleCard(card)}
                        disabled={isMatched || feedback !== null}
                      >
                        {card.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <h2 className="text-4xl font-black text-origen-carbon dark:text-white">
                  {matched.length >= pairs.length / 2 ? 'You matched them all!' : "Time's Up!"}
                </h2>
                <p className="mt-4 text-2xl text-origen-carbon/70 dark:text-slate-400">
                  Matched <span className="font-black text-origen-granate dark:text-origen-mostaza">{score}</span> pairs.
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  className="mt-8 rounded-2xl bg-origen-granate px-8 py-4 text-xl font-black text-white transition hover:bg-origen-granate/90"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
