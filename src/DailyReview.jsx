import { useState, useMemo } from 'react'
import { getReviewDrills, getSrsStats } from '../engine/progress.js'
import { generateLessonDrills } from '../engine/generateDrills.js'
import { lessons } from '../data/lessons.js'
import PracticeMode from './PracticeMode.jsx'

export default function DailyReview({ onBack }) {
  const [started, setStarted] = useState(false)
  const drills = useMemo(() => getReviewDrills(lessons, generateLessonDrills), [])
  const stats = useMemo(() => getSrsStats(lessons, generateLessonDrills), [])

  if (!started) {
    return (
      <main className="min-h-screen bg-origen-cream p-4 text-origen-carbon dark:bg-slate-950 dark:text-slate-200 sm:p-8">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-origen-granate transition hover:text-origen-granate/80 dark:text-origen-mostaza"
            onClick={onBack}
          >
            ← Back
          </button>
          <div className="rounded-[2rem] border border-origen-mostaza/20 bg-origen-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-origen-granate dark:text-origen-mostaza">Daily Review</p>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-origen-carbon dark:text-white sm:text-6xl">
              SRS Review
            </h1>

            {/* SRS stats grid */}
            <div className="mt-6 grid grid-cols-4 gap-3">
              <div className="rounded-2xl bg-origen-mostaza/10 p-3 dark:bg-origen-mostaza/10">
                <p className="text-2xl font-black text-origen-granate">{stats.new}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-origen-carbon/70 dark:text-origen-mostaza">New</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-950/30">
                <p className="text-2xl font-black text-red-600">{stats.due}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Due</p>
              </div>
              <div className="rounded-2xl bg-origen-mostaza/10 p-3 dark:bg-origen-mostaza/10">
                <p className="text-2xl font-black text-origen-granate">{stats.learning}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-origen-carbon/70 dark:text-origen-mostaza">Learning</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-3 dark:bg-green-950/30">
                <p className="text-2xl font-black text-green-600">{stats.mature}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">Mature</p>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-lg text-lg font-semibold text-origen-carbon/70 dark:text-slate-400">
              {drills.length > 0
                ? `You have ${drills.length} card${drills.length === 1 ? '' : 's'} queued for today's session.`
                : "You're all caught up! Come back tomorrow for more reviews."}
            </p>
            {drills.length > 0 ? (
              <button
                type="button"
                className="mt-8 rounded-2xl bg-origen-granate px-10 py-4 font-black text-white transition hover:bg-origen-granate/90"
                onClick={() => setStarted(true)}
              >
                Start Review
              </button>
            ) : (
              <button
                type="button"
                className="mt-8 rounded-2xl bg-origen-mostaza/20 px-10 py-4 font-black text-origen-carbon transition hover:bg-origen-mostaza/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={onBack}
              >
                Go Home
              </button>
            )}
          </div>
        </div>
      </main>
  )
  }

  return (
    <main className="min-h-screen bg-origen-cream p-4 text-origen-carbon dark:bg-slate-950 dark:text-slate-200 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-origen-granate transition hover:text-origen-granate/80 dark:text-origen-mostaza"
          onClick={onBack}
        >
          ← Back
        </button>
        <PracticeMode drills={drills} lessonId="daily-review" />
      </div>
    </main>
  )
}
