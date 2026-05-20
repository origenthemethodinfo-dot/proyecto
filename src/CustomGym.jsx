import { useState, useCallback } from 'react'
import PracticeMode from './PracticeMode.jsx'
import { getSavedSections, getCompletedLessonIds } from '../engine/progress.js'

function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function generateDrills() {
  const saved = getSavedSections()
  const completed = getCompletedLessonIds()
  const eligible = saved.filter((s) => completed.includes(s.lessonId))

  if (eligible.length === 0) return []

  let allRows = []
  eligible.forEach((section) => {
    section.rows.forEach(([spanish, english]) => {
      allRows.push({ prompt: english, answer: spanish })
    })
  })

  allRows = shuffleArray(allRows)
  // Limit to 80 per batch
  return allRows.slice(0, 80).map((item, index) => ({
    id: `custom-${index}`,
    prompt: item.prompt,
    answer: item.answer,
  }))
}

export default function CustomGym({ onBack }) {
  const [batchNumber, setBatchNumber] = useState(0)

  const handleNextBatch = useCallback(() => {
    setBatchNumber((n) => n + 1)
  }, [])

  const drills = generateDrills()
  const savedCount = getSavedSections().length
  const completedCount = getCompletedLessonIds().length

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-4 text-[#3A3A3A] dark:bg-[#1a1a1a] dark:text-[#F5F0E8] sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-[#EDE6D8] px-4 py-2 text-sm font-black text-[#3A3A3A] transition hover:bg-[#8B1A2B] hover:text-white dark:bg-[#333] dark:text-[#F5F0E8]"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#EDE6D8] px-3 py-1 text-xs font-black text-[#8B1A2B] dark:bg-[#333]">
              {savedCount} saved sections
            </span>
            <span className="rounded-full bg-[#EDE6D8] px-3 py-1 text-xs font-black text-[#C4962A] dark:bg-[#333]">
              {completedCount} lessons completed
            </span>
          </div>
        </div>

        {drills.length === 0 ? (
          <div className="rounded-3xl border border-[#EDE6D8] bg-white p-12 text-center dark:border-[#333] dark:bg-[#2a2a2a]">
            <p className="text-2xl font-black text-[#8B1A2B]">No sentences yet</p>
            <p className="mx-auto mt-4 max-w-lg text-[#5A5A5A] dark:text-[#b0b0b0]">
              Complete lessons and click the ⭐ star button on verb or grammar sections to add them to your custom gym.
            </p>
          </div>
        ) : (
          <PracticeMode
            key={batchNumber}
            drills={drills}
            lessonId="custom-gym"
            onRestart={handleNextBatch}
          />
        )}
      </div>
    </div>
  )
}
