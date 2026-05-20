import { useState, useEffect, useRef } from 'react'
import { lessons } from '../data/lessons.js'
import { playCorrect, playIncorrect } from '../utils/sounds.js'

const allDrills = lessons.flatMap((l) =>
  (l.finalGym || []).map(([en, es]) => ({ en, es, lessonId: l.id })),
)

function getBlankSentence(es) {
  const words = es.replace(/[¿¡]/g, '').replace(/\./g, '').split(' ')
  const blankIndex = Math.floor(Math.random() * words.length)
  const answer = words[blankIndex]
  const display = words.map((w, i) => (i === blankIndex ? '_____' : w)).join(' ')
  return { display, answer: answer.toLowerCase(), full: es }
}

export default function FillInBlank({ onBack }) {
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90)
  const [current, setCurrent] = useState(null)
  const [blank, setBlank] = useState(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  function startGame() {
    setScore(0)
    setStreak(0)
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
    setBlank(getBlankSentence(target.es))
    setInput('')
    setFeedback(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleSubmit() {
    if (!input.trim() || feedback !== null) return
    const isCorrect = input.trim().toLowerCase() === blank.answer
    if (isCorrect) {
      playCorrect()
      setScore((s) => s + 1 + Math.floor(streak / 3))
      setStreak((s) => s + 1)
      setFeedback('correct')
    } else {
      playIncorrect()
      setStreak(0)
      setFeedback('incorrect')
    }
    setTimeout(() => {
      if (gameState === 'playing') nextRound()
    }, 1200)
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
            <h1 className="font-display text-4xl text-origen-granate dark:text-origen-mostaza">Fill in the Blank</h1>
            <p className="mt-2 font-bold text-origen-carbon/70 dark:text-slate-400">Type the missing word</p>
          </div>

          <div className="p-8">
            {gameState === 'start' && (
              <div className="text-center">
                <p className="text-xl font-bold text-origen-carbon/70 dark:text-slate-400">
                  90 seconds. Type the missing Spanish word. Streaks earn bonus points!
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

            {gameState === 'playing' && current && blank && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl bg-origen-mostaza/20 px-6 py-3 font-black text-origen-granate dark:bg-origen-mostaza/10 dark:text-origen-mostaza">
                    Score: {score}
                  </div>
                  <div className={`rounded-2xl px-6 py-3 font-black ${timeLeft <= 10 ? 'animate-pulse bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-origen-cream text-origen-carbon dark:bg-slate-800 dark:text-slate-300'}`}>
                    Time: {timeLeft}s
                  </div>
                </div>

                <div className="mb-2 text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-origen-carbon/40">English</p>
                  <p className="mt-1 text-xl font-bold text-origen-carbon/80 dark:text-slate-300">{current.en}</p>
                </div>

                <div className="mb-6 text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-origen-carbon/40">Spanish</p>
                  <p className="mt-2 text-3xl font-black text-origen-carbon dark:text-white">
                    {blank.display.split('_____').map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className={`inline-block min-w-[4rem] border-b-4 ${feedback === 'correct' ? 'border-green-500 text-green-600' : feedback === 'incorrect' ? 'border-red-500 text-red-600' : 'border-origen-mostaza'}`}>
                            {feedback === 'correct' ? blank.answer : feedback === 'incorrect' ? blank.answer : ''}
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="mx-auto max-w-md">
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full rounded-2xl border-2 border-origen-cream bg-origen-white p-4 text-center text-xl font-bold text-origen-carbon outline-none transition focus:border-origen-mostaza dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Missing word..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit()
                    }}
                    disabled={feedback !== null}
                  />
                  <button
                    type="button"
                    className="mt-4 w-full rounded-2xl bg-origen-granate px-8 py-3 font-black text-white transition hover:bg-origen-granate/90 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={!input.trim() || feedback !== null}
                  >
                    Check
                  </button>
                </div>

                {feedback === 'incorrect' && (
                  <p className="mt-4 text-center text-sm font-bold text-red-600">
                    The correct word was: <span className="font-black">{blank.answer}</span>
                  </p>
                )}
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <h2 className="text-4xl font-black text-origen-carbon dark:text-white">Time's Up!</h2>
                <p className="mt-4 text-2xl text-origen-carbon/70 dark:text-slate-400">
                  Final score: <span className="font-black text-origen-granate dark:text-origen-mostaza">{score}</span>
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
