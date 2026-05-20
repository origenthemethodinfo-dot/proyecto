import { useState, useEffect } from 'react'
import LessonIndex from './components/LessonIndex.jsx'
import LessonPage from './components/LessonPage.jsx'
import StoriesPage from './components/StoriesPage.jsx'
import BackupRestore from './components/BackupRestore.jsx'
import DailyReview from './components/DailyReview.jsx'
import FillInBlank from './components/FillInBlank.jsx'
import MatchPairs from './components/MatchPairs.jsx'
import SentenceScramble from './components/SentenceScramble.jsx'
import VerbRush from './components/VerbRush.jsx'
import CustomGym from './components/CustomGym.jsx'
import WelcomePage from './components/WelcomePage.jsx'
import { getSettings } from './engine/progress.js'
import { lessons } from './data/lessons.js'

export default function App() {
  const [view, setView] = useState('welcome')
  const [index, setIndex] = useState(0)
  const [isDark, setIsDark] = useState(() => {
    const saved = getSettings().theme
    return saved === 'dark'
  })
  const lesson = lessons[index]

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('origin-theme', next ? 'dark' : 'light')
  }

  function goToLesson(selectedIndex) {
    setIndex(selectedIndex)
    setView('lesson')
  }

  function goToWelcome() {
    setView('welcome')
  }

  if (view === 'welcome') {
    return (
      <div>
        <WelcomePage
          onSelectLesson={goToLesson}
          onPlayVerbRush={() => setView('verb-rush')}
          onReadStories={() => setView('stories')}
          onDailyReview={() => setView('daily-review')}
          onSentenceScramble={() => setView('sentence-scramble')}
          onFillInBlank={() => setView('fill-in-blank')}
          onMatchPairs={() => setView('match-pairs')}
          onBackup={() => setView('backup')}
          onCustomGym={() => setView('custom-gym')}
        />
      </div>
    )
  }

  if (view === 'verb-rush') return <VerbRush onBack={goToWelcome} />
  if (view === 'stories') return <StoriesPage onBack={goToWelcome} />
  if (view === 'daily-review') return <DailyReview onBack={goToWelcome} />
  if (view === 'sentence-scramble') return <SentenceScramble onBack={goToWelcome} />
  if (view === 'fill-in-blank') return <FillInBlank onBack={goToWelcome} />
  if (view === 'match-pairs') return <MatchPairs onBack={goToWelcome} />
  if (view === 'backup') return <BackupRestore onBack={goToWelcome} />
  if (view === 'custom-gym') return <CustomGym onBack={goToWelcome} />

  return (
    <div>
      <nav className="sticky top-0 z-50 border-b border-[#EDE6D8] bg-[#FAFAF8]/90 backdrop-blur dark:border-[#333] dark:bg-[#1a1a1a]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <button
            type="button"
            className="font-display text-sm uppercase tracking-[0.2em] text-[#8B1A2B] transition hover:text-[#6B1221]"
            onClick={goToWelcome}
          >
            Método Origen
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-[#EDE6D8] p-2 text-[#3A3A3A] transition hover:bg-[#8B1A2B] hover:text-white dark:bg-[#333] dark:text-[#F5F0E8]"
              onClick={toggleTheme}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/></svg>
              )}
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#EDE6D8] px-3 py-2 text-sm font-semibold text-[#3A3A3A] transition hover:bg-[#8B1A2B] hover:text-white disabled:opacity-40"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              Previous
            </button>
            <LessonIndex
              lessons={lessons}
              currentIndex={index}
              onSelect={setIndex}
            />
            <button
              type="button"
              className="rounded-xl bg-[#EDE6D8] px-3 py-2 text-sm font-semibold text-[#3A3A3A] transition hover:bg-[#8B1A2B] hover:text-white disabled:opacity-40"
              onClick={() => setIndex((i) => Math.min(lessons.length - 1, i + 1))}
              disabled={index === lessons.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </nav>
      <LessonPage lesson={lesson} />
    </div>
  )
}