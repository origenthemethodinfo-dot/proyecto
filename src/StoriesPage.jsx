import { useState, useEffect } from 'react'
import { stories } from '../data/stories.js'
import { getGlobalStats } from '../engine/progress.js'
import { playText } from '../utils/playAudio.js'

export default function StoriesPage({ onBack }) {
  const [stats, setStats] = useState(() => getGlobalStats())
  const [selectedStory, setSelectedStory] = useState(null)
  const [showEnglish, setShowEnglish] = useState(false)

  const completedLessons = Object.values(stats.lessons).filter((l) => l.completed).length

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-origen-cream p-4 text-origen-carbon dark:bg-slate-950 dark:text-slate-200 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => setSelectedStory(null)}
            className="mb-8 inline-flex items-center gap-2 rounded-xl bg-origen-white px-4 py-2 text-sm font-bold text-origen-carbon shadow-sm transition hover:bg-origen-cream dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Stories
          </button>

          <div className="overflow-hidden rounded-[2rem] border border-origen-mostaza/20 bg-origen-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-origen-mostaza/10 p-8 text-center">
              <h1 className="font-display text-4xl text-origen-granate dark:text-origen-mostaza">{selectedStory.title}</h1>
            </div>

            <div className="p-6 sm:p-10">
              <div className="mb-8 flex justify-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-origen-cream px-4 py-2 text-sm font-bold text-origen-carbon dark:bg-slate-800 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-origen-granate"
                    checked={showEnglish}
                    onChange={(e) => setShowEnglish(e.target.checked)}
                  />
                  Show English translation
                </label>
              </div>

              <div className="space-y-6">
                {selectedStory.paragraphs.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => playText(p.spanish)}
                    className="group w-full rounded-2xl border border-transparent p-4 text-left transition hover:border-origen-mostaza/30 hover:bg-origen-mostaza/5 dark:hover:border-origen-mostaza/20 dark:hover:bg-origen-mostaza/10"
                    title="Click to play audio"
                  >
                    <p className="text-2xl font-black leading-relaxed text-origen-carbon dark:text-white">
                      {p.spanish}
                    </p>
                    {showEnglish && (
                      <p className="mt-2 text-lg text-origen-carbon/60 dark:text-slate-400">
                        {p.english}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-origen-cream p-4 text-origen-carbon dark:bg-slate-950 dark:text-slate-200 sm:p-8">
      <div className="mx-auto max-w-4xl">
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

        <h1 className="mb-2 font-display text-4xl text-origen-carbon dark:text-white">Stories</h1>
        <p className="mb-8 text-lg font-medium text-origen-carbon/60 dark:text-slate-400">
          Read and listen to comprehensible input using vocabulary you've already learned.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {stories.map((story) => {
            const unlocked = completedLessons >= story.requiredLessons
            return (
              <button
                key={story.id}
                onClick={() => unlocked && setSelectedStory(story)}
                disabled={!unlocked}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition sm:p-8 ${
                  unlocked
                    ? 'border-origen-mostaza/20 bg-origen-white motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl dark:border-slate-800 dark:bg-slate-900'
                    : 'cursor-not-allowed border-origen-cream bg-origen-cream/50 opacity-60 dark:border-slate-900 dark:bg-slate-950'
                }`}
              >
                {!unlocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-origen-white/50 dark:bg-slate-950/50">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto h-8 w-8 text-origen-carbon/40">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                      </svg>
                      <p className="mt-2 text-sm font-bold text-origen-carbon/50">Requires Lesson {story.requiredLessons}</p>
                    </div>
                  </div>
                )}
                
                <h3 className="text-2xl font-black text-origen-granate dark:text-origen-mostaza">{story.title}</h3>
                <p className="mt-3 text-sm text-origen-carbon/60 dark:text-slate-400">{story.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
