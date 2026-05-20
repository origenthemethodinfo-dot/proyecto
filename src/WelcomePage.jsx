import { useState, useEffect } from 'react'
import { getSettings } from '../engine/progress.js'
import { lessons } from '../data/lessons.js'
import { isLessonUnlocked, getGlobalStats, ACHIEVEMENTS } from '../engine/progress.js'
import { playClick } from '../utils/sounds.js'

const USERNAME_KEY = 'origen-username'
function loadUsername() { return localStorage.getItem(USERNAME_KEY) || '' }
function saveUsername(name) { localStorage.setItem(USERNAME_KEY, name) }
function getDailyGoal() {
  const data = getGlobalStats()
  const today = new Date().toISOString().slice(0, 10)
  const todayDrills = data.sessions.filter((s) => new Date(s.date).toISOString().slice(0, 10) === today)
  const count = todayDrills.reduce((sum, s) => sum + s.correct + s.incorrect, 0)
  return { count, goal: 20 }
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('origin-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('origin-theme', 'light')
    }
  }
  return (
    <button
      type="button"
      className="rounded-xl bg-[#EDE6D8] p-2 text-[#3A3A3A] transition hover:bg-[#8B1A2B] hover:text-white"
      onClick={toggle}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/></svg>
      )}
    </button>
  )
}

export default function WelcomePage({ onSelectLesson, onPlayVerbRush, onReadStories, onDailyReview, onSentenceScramble, onFillInBlank, onMatchPairs, onBackup, onCustomGym }) {
  const [stats, setStats] = useState(() => getGlobalStats())
  const [username, setUsername] = useState(() => loadUsername())
  const [editingName, setEditingName] = useState(false)
  const daily = getDailyGoal()

  useEffect(() => { setStats(getGlobalStats()) }, [])

  const completedLessons = Object.values(stats.lessons).filter((l) => l.completed).length

  function handleShare() {
    const text = `🔥 ${stats.streak}-day streak on Origen, el método! ${completedLessons}/10 lessons completed. Can you beat me?`
    if (navigator.share) {
      navigator.share({ title: 'Origen, el método', text })
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Progress copied to clipboard!'))
    }
  }

  return (
    <main lang="es" className="min-h-screen bg-[#F5F0E8] p-4 text-[#3A3A3A] dark:bg-[#1a1a1a] dark:text-[#F5F0E8] sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header with theme toggle */}
        <div className="mb-4 flex items-center justify-end">
          <ThemeToggle />
        </div>

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black tracking-tight text-[#3A3A3A] dark:text-[#F5F0E8] sm:text-7xl">
            Método Origen
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            {editingName ? (
              <input
                type="text"
                className="rounded-xl border-2 border-[#C4962A] bg-white px-4 py-2 text-center text-lg font-bold text-[#3A3A3A] outline-none focus:border-[#8B1A2B] dark:bg-[#2a2a2a] dark:text-[#F5F0E8]"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => { saveUsername(username); setEditingName(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { saveUsername(username); setEditingName(false) } }}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="text-xl font-bold text-[#5A5A5A] transition hover:text-[#8B1A2B] dark:text-[#b0b0b0]"
                onClick={() => setEditingName(true)}
              >
                {username ? `¡Hola, ${username}!` : 'Set your name'}
              </button>
            )}
          </div>
        </div>

        {/* Daily goal */}
        <div className="mx-auto mb-10 max-w-xl">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#5A5A5A] dark:text-[#b0b0b0]">
            <span>Daily goal</span>
            <span>{daily.count}/{daily.goal} drills</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#EDE6D8] dark:bg-[#333]">
            <div
              className="h-full rounded-full bg-[#8B1A2B] transition-all"
              style={{ width: `${Math.min(100, (daily.count / daily.goal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: stats.streak, label: 'Day streak', color: '#8B1A2B' },
            { value: stats.totalDrills, label: 'Drills done', color: '#8B1A2B' },
            { value: `${completedLessons}/10`, label: 'Lessons done', color: '#C4962A' },
            { value: stats.achievements.length, label: 'Achievements', color: '#C4962A' },
          ].map(({ value, label, color }) => (
            <div key={label} className="rounded-3xl border border-[#EDE6D8] bg-white p-5 text-center shadow-sm dark:border-[#333] dark:bg-[#2a2a2a]">
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#5A5A5A] dark:text-[#b0b0b0]">{label}</p>
            </div>
          ))}
        </div>

        {/* Práctica rápida */}
        <div className="mb-10">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[#8B1A2B]">
            Práctica rápida
          </p>
          <button
            type="button"
            className="group flex w-full items-center gap-5 rounded-3xl border border-[#EDE6D8] bg-gradient-to-r from-[#F5F0E8] to-[#FAFAF8] p-6 text-left shadow-sm transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg dark:border-[#333] dark:from-[#2a2a2a] dark:to-[#333]"
            onClick={() => { playClick(); onDailyReview() }}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EDE6D8] text-[#8B1A2B] dark:bg-[#333]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">Daily Review</p>
              <p className="text-sm font-semibold text-[#5A5A5A] dark:text-[#b0b0b0]">SRS review across all lessons</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ml-auto h-5 w-5 text-[#5A5A5A] transition-transform group-hover:translate-x-1 dark:text-[#b0b0b0]">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Minijuegos */}
        <div className="mb-10">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[#5A5A5A] dark:text-[#b0b0b0]">
            Minijuegos
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Verb Rush', sub: 'Fast verb matching', action: onPlayVerbRush },
              { label: 'Stories', sub: 'Comprehensible input', action: onReadStories },
              { label: 'Custom Gym', sub: 'Your saved sections', action: onCustomGym },
              { label: 'Scramble', sub: 'Unscramble sentences', action: onSentenceScramble },
              { label: 'Fill Blank', sub: 'Type the missing word', action: onFillInBlank },
              { label: 'Match Pairs', sub: 'Match words in pairs', action: onMatchPairs },
            ].map(({ label, sub, action }) => (
              <button
                key={label}
                type="button"
                className="group flex items-center gap-4 rounded-2xl border border-[#EDE6D8] bg-white p-5 text-left shadow-sm transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg dark:border-[#333] dark:bg-[#2a2a2a]"
                onClick={() => { playClick(); action() }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE6D8] text-[#8B1A2B] dark:bg-[#333]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-black text-[#3A3A3A] dark:text-[#F5F0E8]">{label}</p>
                  <p className="text-xs font-semibold text-[#5A5A5A] dark:text-[#b0b0b0]">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Más */}
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#EDE6D8] px-5 py-2.5 text-sm font-black text-[#8B1A2B] transition hover:bg-[#C4962A] hover:text-white dark:bg-[#333]"
            onClick={handleShare}
          >
            Share
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#EDE6D8] px-5 py-2.5 text-sm font-black text-[#3A3A3A] transition hover:bg-[#3A3A3A] hover:text-white dark:bg-[#333] dark:text-[#F5F0E8]"
            onClick={() => { playClick(); onBackup() }}
          >
            Backup
          </button>
        </div>

        {/* Achievements */}
        {stats.achievements.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {stats.achievements.map((id) => {
                const a = ACHIEVEMENTS[id]
                return (
                  <div key={id} className="rounded-full bg-[#EDE6D8] px-4 py-2 text-xs font-bold text-[#8B1A2B] dark:bg-[#333]" title={a?.desc}>
                    {a?.title}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Lessons Grid */}
        <h2 className="mb-6 text-2xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">Lessons</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson, index) => {
            const unlocked = isLessonUnlocked(lesson.id)
            const lessonStats = stats.lessons[lesson.id]
            const completed = lessonStats?.completed
            const accuracy = lessonStats?.bestAccuracy ?? 0
            return (
              <button
                key={lesson.id}
                type="button"
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition sm:p-8 ${
                  unlocked
                    ? 'border-[#EDE6D8] bg-white motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl dark:border-[#333] dark:bg-[#2a2a2a]'
                    : 'cursor-not-allowed border-[#EDE6D8] bg-[#F5F0E8] opacity-60 dark:border-[#333] dark:bg-[#1a1a1a]'
                }`}
                onClick={() => unlocked && onSelectLesson(index)}
                disabled={!unlocked}
              >
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE6D8] text-sm font-black text-[#8B1A2B] transition group-hover:bg-[#8B1A2B] group-hover:text-white dark:bg-[#333]">
                  {completed ? '✓' : index + 1}
                </div>
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-[#5A5A5A]">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <h3 className="pr-12 text-2xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">{lesson.title}</h3>
                <p className="mt-3 text-base font-semibold text-[#5A5A5A] dark:text-[#b0b0b0]">{lesson.subtitle}</p>
                {accuracy > 0 && (
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-[#EDE6D8] dark:bg-[#333]">
                      <div className="h-full rounded-full bg-[#8B1A2B]" style={{ width: `${accuracy}%` }} />
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#8B1A2B]">{accuracy}% best accuracy</p>
                  </div>
                )}
                {unlocked && (
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#8B1A2B]">
                    <span>Start lesson</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-1">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

      </div>
    </main>
  )
}