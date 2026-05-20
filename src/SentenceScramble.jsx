import { useState, useEffect, useRef } from 'react'
import { lessons } from '../data/lessons.js'
import { playCorrect, playIncorrect } from '../utils/sounds.js'

const allDrills = lessons.flatMap((l) =>
  (l.finalGym || []).map(([en, es]) => ({ en, es, lessonId: l.id })),
)

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function SentenceScramble({ onBack }) {
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90)
  const [current, setCurrent] = useState(null)
  const [shuffledWords, setShuffledWords] = useState([])
  const [selected, setSelected] = useState([])
  const [feedback, setFeedback] = useState(null)
  const timerRef = useRef(null)

  function startGame() {
    setScore(0)
    setTimeLeft(90)
    setGameState('playing')
    nextRound()
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

  function nextRound() {
    const target = allDrills[Math.floor(Math.random() * allDrills.length)]
    setCurrent(target)
    const words = target.es.replace(/[¿¡]/g, '').replace(/\./g, '').split(' ')
    setShuffledWords(shuffle(words))
    setSelected([])
    setFeedback(null)
  }

  function handleWord(word, index) {
    if (feedback !== null) return
    const next = [...selected, word]
    setSelected(next)
    setShuffledWords((prev) => prev.filter((_, i) => i !== index))

    const targetWords = current.es.replace(/[¿¡]/g, '').replace(/\./g, '').split(' ')
    if (next.length === targetWords.length) {
      const isCorrect = next.join(' ') === targetWords.join(' ')
      if (isCorrect) {
        playCorrect()
        setScore((s) => s + 1)
        setFeedback('correct')
      } else {
        playIncorrect()
        setFeedback('incorrect')
      }
      setTimeout(() => {
        if (gameState === 'playing') nextRound()
      }, 1000)
    }
  }

  function handleReset() {
    setSelected([])
    setShuffledWords(shuffle(current.es.replace(/[¿¡]/g, '').replace(/\./g, '').split(' ')))
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const targetWords = current ? current.es.replace(/[¿¡]/g, '').replace(/\./g, '').split(' ') : []
  const progress = current ? selected.length / targetWords.length : 0

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
            <h1 className="font-display text-4xl text-origen-granate dark:text-origen-mostaza">Sentence Scramble</h1>
            <p className="mt-2 font-bold text-origen-carbon/70 dark:text-slate-400">Tap words in the right order</p>
          </div>

          <div className="p-8">
            {gameState === 'start' && (
              <div className="text-center">
                <p className="text-xl font-bold text-origen-carbon/70 dark:text-slate-400">
                  You have 90 seconds to unscramble as many Spanish sentences as possible.
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

            {gameState === 'playing' && current && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl bg-origen-mostaza/20 px-6 py-3 font-black text-origen-granate dark:bg-origen-mostaza/10 dark:text-origen-mostaza">
                    Score: {score}
                  </div>
                  <div className={`rounded-2xl px-6 py-3 font-black ${timeLeft <= 10 ? 'animate-pulse bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-origen-cream text-origen-carbon dark:bg-slate-800 dark:text-slate-300'}`}>
                    Time: {timeLeft}s
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-origen-carbon/40">Translate</p>
                  <p className="mt-2 text-2xl font-black text-origen-carbon dark:text-white">{current.en}</p>
                </div>

                {/* Progress bar */}
                <div className="mb-6 h-2 overflow-hidden rounded-full bg-origen-cream dark:bg-slate-800">
                  <div className="h-full rounded-full bg-origen-mostaza transition-all" style={{ width: `${progress * 100}%` }} />
                </div>

                {/* Selected words */}
                <div className="mb-6 min-h-[3.5rem] rounded-2xl border-2 border-dashed border-origen-mostaza/30 p-4 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    {selected.map((word, i) => (
                      <span key={i} className={`rounded-xl px-3 py-1 text-lg font-bold ${feedback === 'correct' ? 'bg-green-100 text-green-800' : feedback === 'incorrect' ? 'bg-red-100 text-red-800' : 'bg-origen-mostaza/20 text-origen-granate'}`}>
                        {word}
                      </span>
                    ))}
                    {selected.length === 0 && (
                      <span className="text-sm font-bold text-origen-carbon/40">Tap words to build the sentence...</span>
                    )}
                  </div>
                </div>

                {/* Word bank */}
                <div className="flex flex-wrap justify-center gap-2">
                  {shuffledWords.map((word, i) => (
                    <button
                      key={`${word}-${i}`}
                      type="button"
                      className="rounded-xl bg-origen-white px-4 py-2 text-lg font-bold text-origen-carbon shadow-sm transition hover:bg-origen-mostaza/10 hover:shadow dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={() => handleWord(word, i)}
                      disabled={feedback !== null}
                    >
                      {word}
                    </button>
                  ))}
                </div>

                {feedback === 'incorrect' && (
                  <p className="mt-4 text-center text-sm font-bold text-red-600">
                    Correct: {current.es}
                  </p>
                )}

                <button
                  type="button"
                  className="mx-auto mt-6 block text-sm font-bold text-origen-carbon/50 underline transition hover:text-origen-carbon"
                  onClick={handleReset}
                >
                  Reset sentence
                </button>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <h2 className="text-4xl font-black text-origen-carbon dark:text-white">Time's Up!</h2>
                <p className="mt-4 text-2xl text-origen-carbon/70 dark:text-slate-400">
                  You unscrambled <span className="font-black text-origen-granate dark:text-origen-mostaza">{score}</span> sentences.
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
