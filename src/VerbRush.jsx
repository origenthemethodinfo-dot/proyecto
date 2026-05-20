import { useState, useEffect, useRef } from 'react'
import { lessons } from '../data/lessons.js'
import { playCorrect, playIncorrect } from '../utils/sounds.js'

const allVerbs = lessons.flatMap((l) => l.verbs)

const CONJUGATIONS = {
  easy: { label: 'Infinitives', data: allVerbs },
  medium: {
    label: 'Present Tense',
    data: [
      { spanish: 'soy', english: 'I am' },
      { spanish: 'eres', english: 'you are' },
      { spanish: 'es', english: 'he/she is' },
      { spanish: 'somos', english: 'we are' },
      { spanish: 'son', english: 'they are' },
      { spanish: 'estoy', english: 'I am (temporary)' },
      { spanish: 'estás', english: 'you are (temporary)' },
      { spanish: 'está', english: 'he/she is (temporary)' },
      { spanish: 'estamos', english: 'we are (temporary)' },
      { spanish: 'están', english: 'they are (temporary)' },
      { spanish: 'tengo', english: 'I have' },
      { spanish: 'tiene', english: 'he/she has' },
      { spanish: 'hago', english: 'I do/make' },
      { spanish: 'va', english: 'he/she goes' },
      { spanish: 'quiero', english: 'I want' },
    ],
  },
  hard: {
    label: 'Past Tense',
    data: [
      { spanish: 'era', english: 'I was (imperfect)' },
      { spanish: 'eras', english: 'you were (imperfect)' },
      { spanish: 'estaba', english: 'I was (temporary, imperfect)' },
      { spanish: 'estabas', english: 'you were (temporary, imperfect)' },
      { spanish: 'tuve', english: 'I had (preterite)' },
      { spanish: 'tuvo', english: 'he/she had (preterite)' },
      { spanish: 'hice', english: 'I did/made (preterite)' },
      { spanish: 'fui', english: 'I went/was (preterite)' },
      { spanish: 'quise', english: 'I wanted (preterite)' },
      { spanish: 'dije', english: 'I said (preterite)' },
      { spanish: 'vine', english: 'I came (preterite)' },
      { spanish: 'pude', english: 'I could (preterite)' },
    ],
  },
}

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function VerbRush({ onBack }) {
  const [difficulty, setDifficulty] = useState('easy')
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentVerb, setCurrentVerb] = useState(null)
  const [options, setOptions] = useState([])
  const [feedback, setFeedback] = useState(null)
  const timerRef = useRef(null)

  const verbPool = CONJUGATIONS[difficulty].data

  function startGame() {
    setScore(0)
    setTimeLeft(60)
    setGameState('playing')
    nextVerb()

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

  function nextVerb() {
    const target = verbPool[Math.floor(Math.random() * verbPool.length)]
    setCurrentVerb(target)

    const wrongOptions = []
    while (wrongOptions.length < 3) {
      const randomVerb = verbPool[Math.floor(Math.random() * verbPool.length)]
      if (randomVerb.spanish !== target.spanish && !wrongOptions.find((v) => v.spanish === randomVerb.spanish)) {
        wrongOptions.push(randomVerb)
      }
    }

    const allOptions = shuffle([target, ...wrongOptions])
    setOptions(allOptions)
    setFeedback(null)
  }

  function handleGuess(option) {
    if (feedback !== null) return

    if (option.spanish === currentVerb.spanish) {
      playCorrect()
      setScore((s) => s + 1)
      setFeedback('correct')
    } else {
      playIncorrect()
      setFeedback('incorrect')
    }

    setTimeout(() => {
      if (gameState === 'playing') {
        nextVerb()
      }
    }, 500)
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
            <h1 className="font-display text-4xl text-origen-granate dark:text-origen-mostaza">Verb Rush</h1>
            <p className="mt-2 font-bold text-origen-carbon/70 dark:text-slate-400">Match the verb as fast as you can!</p>
          </div>

          <div className="p-8">
            {gameState === 'start' && (
              <div className="text-center">
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {Object.entries(CONJUGATIONS).map(([key, { label }]) => (
                    <button
                      key={key}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm font-black transition ${
                        difficulty === key
                          ? 'bg-origen-granate text-white'
                          : 'bg-origen-cream text-origen-carbon hover:bg-origen-mostaza/20 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => setDifficulty(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xl font-bold text-origen-carbon/70 dark:text-slate-400">
                  You have 60 seconds to match as many verbs as possible.
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

            {gameState === 'playing' && currentVerb && (
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <div className="rounded-2xl bg-origen-mostaza/20 px-6 py-3 font-black text-origen-granate dark:bg-origen-mostaza/10 dark:text-origen-mostaza">
                    Score: {score}
                  </div>
                  <div className={`rounded-2xl px-6 py-3 font-black ${timeLeft <= 10 ? 'animate-pulse bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-origen-cream text-origen-carbon dark:bg-slate-800 dark:text-slate-300'}`}>
                    Time: {timeLeft}s
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-origen-carbon/40">Translate</p>
                  <p className="mt-4 text-5xl font-black text-origen-carbon dark:text-white">{currentVerb.english}</p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {options.map((opt, i) => {
                    let btnClass = "bg-origen-white border-2 border-origen-cream text-origen-carbon hover:border-origen-mostaza hover:bg-origen-mostaza/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-origen-mostaza"

                    if (feedback !== null) {
                      if (opt.spanish === currentVerb.spanish) {
                        btnClass = "bg-green-100 border-2 border-green-500 text-green-900 dark:bg-green-900/50 dark:border-green-400 dark:text-green-100"
                      } else if (feedback === 'incorrect') {
                        btnClass = "bg-red-100 border-2 border-red-500 text-red-900 opacity-50 dark:bg-red-900/50 dark:border-red-400 dark:text-red-100"
                      }
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleGuess(opt)}
                        className={`rounded-2xl p-6 text-2xl font-black transition-all ${btnClass}`}
                      >
                        {opt.spanish}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <h2 className="text-4xl font-black text-origen-carbon dark:text-white">Time's Up!</h2>
                <p className="mt-4 text-2xl text-origen-carbon/70 dark:text-slate-400">
                  You matched <span className="font-black text-origen-granate dark:text-origen-mostaza">{score}</span> verbs correctly.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={startGame}
                    className="rounded-2xl bg-origen-granate px-8 py-4 text-xl font-black text-white transition hover:bg-origen-granate/90"
                  >
                    Play Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameState('start')}
                    className="rounded-2xl bg-origen-mostaza/20 px-6 py-4 text-lg font-black text-origen-carbon transition hover:bg-origen-mostaza/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Change Difficulty
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
