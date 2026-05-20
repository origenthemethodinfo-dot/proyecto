import { loadProgress } from './progress.js'
import { lessons as allLessons } from '../data/lessons.js'

function renderTemplate(template, values) {
  return template.replaceAll(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

function uniqueDrills(drills) {
  const seen = new Set()
  return drills.filter((drill) => {
    const key = `${drill.prompt}::${drill.answer}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function getCompletedLessonIds(currentLessonId) {
  const data = loadProgress()
  return Object.entries(data.lessons)
    .filter(([, l]) => l.completed && l.unlocked)
    .map(([id]) => id)
    .filter(id => id !== currentLessonId)
}

export function generateReviewRows(currentLessonId, count = 20) {
  const completedIds = getCompletedLessonIds(currentLessonId)
  if (completedIds.length === 0) return []

  const pool = []
  allLessons.forEach(lesson => {
    if (completedIds.includes(lesson.id)) {
      lesson.finalGym.forEach(([english, spanish]) => {
        pool.push([english, spanish])
      })
    }
  })

  if (pool.length === 0) return []
  return shuffleArray(pool).slice(0, count)
}

export function generateFinalGymRows(lesson) {
  const currentRows = lesson.finalGym.slice(0, 60)
  const reviewRows = generateReviewRows(lesson.id, 20)
  return shuffleArray([...currentRows, ...reviewRows])
}

export function generateLessonDrills(lesson) {
  const patternDrills = lesson.drillPatterns.flatMap((pattern) =>
    lesson.vocabulary.map((word) => ({
      id: `${pattern.id}-${word.id}`,
      prompt: renderTemplate(pattern.prompt, word),
      answer: renderTemplate(pattern.answer, word),
      source: 'generated',
    })),
  )

  const possessionDrills = (lesson.possessives || []).flatMap((item, index) => [
    {
      id: `possessive-${index}`,
      prompt: `${item.english[0].toUpperCase()}${item.english.slice(1)}.`,
      answer: `${item.spanish[0].toUpperCase()}${item.spanish.slice(1)}.`,
      source: 'possessive',
    },
    {
      id: `possessive-question-${index}`,
      prompt: `Is that ${item.english}?`,
      answer: `¿Eso es ${item.spanish}?`,
      source: 'possessive',
    },
  ])

  // Current lesson drills: up to 60 from finalGym
  const currentDrills = lesson.finalGym.slice(0, 60).map(([english, spanish], index) => ({
    id: `final-gym-${index}`,
    prompt: english,
    answer: spanish,
    source: 'curated',
  }))

  // Review drills: 20 from previous completed lessons
  const reviewDrills = generateReviewRows(lesson.id, 20).map(([english, spanish], index) => ({
    id: `review-${index}`,
    prompt: english,
    answer: spanish,
    source: 'review',
  }))

  return shuffleArray(uniqueDrills([...patternDrills, ...possessionDrills, ...currentDrills, ...reviewDrills]))
}
