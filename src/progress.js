const STORAGE_KEY = 'hanuka-progress'

function now() {
  return Date.now()
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000
  return Math.round((new Date(b) - new Date(a)) / ms)
}

function getDefaultData() {
  return {
    version: 2,
    lastStudyDate: null,
    streak: 0,
    streakBest: 0,
    totalDrills: 0,
    totalCorrect: 0,
    lessons: {},
    drills: {},
    sessions: [],
    achievements: [],
    settings: {
      audioSpeed: 1.0,
      autoPlay: true,
      theme: 'light',
      mode: 'standard',
    },
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultData()
    const data = JSON.parse(raw)
    const migrated = migrateData({ ...getDefaultData(), ...data })
    return migrated
  } catch {
    return getDefaultData()
  }
}

function migrateData(data) {
  if (data.version === 1) {
    // v1 used minute-based SRS intervals; v2 uses day-based.
    // Reset all nextReview times so the new day-based SRS takes over.
    Object.values(data.drills).forEach((drill) => {
      drill.nextReview = 0
    })
    data.version = 2
    saveProgress(data)
  }
  return data
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function ensureLesson(data, lessonId) {
  if (!data.lessons[lessonId]) {
    const index = parseInt(lessonId.split('-')[1], 10) - 1
    data.lessons[lessonId] = {
      unlocked: index === 0,
      completed: false,
      bestAccuracy: 0,
      sessionsCount: 0,
    }
  }
}

export function recordDrillResult(lessonId, drillId, correct, responseTimeMs) {
  const data = loadProgress()
  const key = `${lessonId}-${drillId}`
  const todayStr = today()

  // Update streak
  if (data.lastStudyDate !== todayStr) {
    const diff = data.lastStudyDate ? daysBetween(data.lastStudyDate, todayStr) : 2
    if (diff === 1) {
      data.streak += 1
    } else if (diff > 1) {
      data.streak = 1
    }
    data.streakBest = Math.max(data.streakBest, data.streak)
    data.lastStudyDate = todayStr
  }

  // Update drill stats
  if (!data.drills[key]) {
    data.drills[key] = {
      correct: 0,
      incorrect: 0,
      lastSeen: 0,
      nextReview: 0,
      averageResponseTime: 0,
      level: 0,
    }
  }

  const drill = data.drills[key]
  drill.lastSeen = now()
  data.totalDrills += 1

  if (correct) {
    drill.correct += 1
    data.totalCorrect += 1
    drill.level = Math.min(5, drill.level + 1)
  } else {
    drill.incorrect += 1
    drill.level = Math.max(0, drill.level - 1)
  }

  // SRS intervals in days
  const intervals = [1, 3, 7, 14, 30, 90]
  const days = intervals[drill.level] ?? intervals[intervals.length - 1]
  drill.nextReview = now() + days * 24 * 60 * 60 * 1000

  // Update response time
  const total = drill.correct + drill.incorrect
  drill.averageResponseTime =
    (drill.averageResponseTime * (total - 1) + responseTimeMs) / total

  // Update lesson stats
  ensureLesson(data, lessonId)
  const lesson = data.lessons[lessonId]

  // Check if lesson can be unlocked/completed
  const lessonDrills = Object.entries(data.drills).filter(([k]) =>
    k.startsWith(`${lessonId}-`),
  )
  const lessonTotal = lessonDrills.length
  const lessonCorrect = lessonDrills.filter(([, d]) => d.correct > d.incorrect).length
  const accuracy = lessonTotal > 0 ? Math.round((lessonCorrect / lessonTotal) * 100) : 0
  lesson.bestAccuracy = Math.max(lesson.bestAccuracy, accuracy)

  // Unlock next lesson at 80% accuracy
  if (accuracy >= 80 && !lesson.completed) {
    lesson.completed = true
    const nextIndex = parseInt(lessonId.split('-')[1], 10) + 1
    const nextId = `lesson-${String(nextIndex).padStart(3, '0')}`
    if (!data.lessons[nextId]) {
      data.lessons[nextId] = {
        unlocked: true,
        completed: false,
        bestAccuracy: 0,
        sessionsCount: 0,
      }
    } else {
      data.lessons[nextId].unlocked = true
    }
  }

  // Check achievements
  checkAchievements(data)

  saveProgress(data)
  return data
}

export function recordSession(lessonId, correct, incorrect, durationSec) {
  const data = loadProgress()
  ensureLesson(data, lessonId)
  data.lessons[lessonId].sessionsCount += 1
  data.sessions.push({
    date: now(),
    lessonId,
    correct,
    incorrect,
    duration: durationSec,
  })
  // Keep last 100 sessions
  if (data.sessions.length > 100) {
    data.sessions = data.sessions.slice(-100)
  }
  saveProgress(data)
}

function checkAchievements(data) {
  const unlock = (id) => {
    if (!data.achievements.includes(id)) {
      data.achievements.push(id)
    }
  }

  if (data.totalDrills >= 1) unlock('first-drill')
  if (data.totalDrills >= 50) unlock('fifty-drills')
  if (data.totalDrills >= 200) unlock('two-hundred-drills')
  if (data.streak >= 3) unlock('streak-3')
  if (data.streak >= 7) unlock('streak-7')
  if (data.streak >= 30) unlock('streak-30')
  if (data.streakBest >= 7) unlock('streak-best-7')
  const perfect = Object.values(data.drills).some((d) => d.correct >= 10 && d.incorrect === 0)
  if (perfect) unlock('perfect-drill')
  const completedLessons = Object.values(data.lessons).filter((l) => l.completed).length
  if (completedLessons >= 1) unlock('first-lesson')
  if (completedLessons >= 5) unlock('half-course')
  if (completedLessons >= 10) unlock('course-complete')
}

export function getDrillStats(drillId) {
  const data = loadProgress()
  return data.drills[drillId] ?? null
}

export function getLessonProgress(lessonId) {
  const data = loadProgress()
  ensureLesson(data, lessonId)
  return data.lessons[lessonId]
}

export function getGlobalStats() {
  return loadProgress()
}

export function getReviewDrills(allLessons, generateDrillsFn) {
  const data = loadProgress()
  const nowTime = now()
  const reviewDrills = []

  allLessons.forEach((lesson) => {
    const drills = generateDrillsFn(lesson)
    drills.forEach((drill) => {
      const key = `${lesson.id}-${drill.id}`
      const stats = data.drills[key]
      if (!stats) {
        // Never seen: definitely review
        reviewDrills.push({ ...drill, originalLessonId: lesson.id, srsStatus: 'new' })
      } else if (stats.level < 3 || stats.nextReview <= nowTime) {
        reviewDrills.push({ ...drill, originalLessonId: lesson.id, srsStatus: stats.nextReview <= nowTime ? 'due' : 'learning' })
      }
    })
  })

  // Sort: due first, then learning, then new; shuffle within each bucket
  const buckets = { due: [], learning: [], new: [] }
  reviewDrills.forEach((d) => buckets[d.srsStatus].push(d))
  for (const bucket of Object.values(buckets)) {
    for (let i = bucket.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bucket[i], bucket[j]] = [bucket[j], bucket[i]]
    }
  }
  const sorted = [...buckets.due, ...buckets.learning, ...buckets.new]

  // Cap at 20 for a quick daily session
  return sorted.slice(0, 20)
}

export function getSrsStats(allLessons, generateDrillsFn) {
  const data = loadProgress()
  const nowTime = now()
  let newCount = 0
  let dueCount = 0
  let learningCount = 0
  let matureCount = 0

  allLessons.forEach((lesson) => {
    const drills = generateDrillsFn(lesson)
    drills.forEach((drill) => {
      const key = `${lesson.id}-${drill.id}`
      const stats = data.drills[key]
      if (!stats) {
        newCount += 1
      } else if (stats.nextReview <= nowTime) {
        dueCount += 1
      } else if (stats.level < 3) {
        learningCount += 1
      } else {
        matureCount += 1
      }
    })
  })

  return { new: newCount, due: dueCount, learning: learningCount, mature: matureCount }
}

export function isLessonUnlocked(lessonId) {
  const data = loadProgress()
  ensureLesson(data, lessonId)
  return data.lessons[lessonId].unlocked
}

export function getSettings() {
  return loadProgress().settings
}

export function saveSettings(settings) {
  const data = loadProgress()
  data.settings = { ...data.settings, ...settings }
  saveProgress(data)
}

export function exportProgress() {
  return JSON.stringify(loadProgress(), null, 2)
}

export function importProgress(json) {
  const data = JSON.parse(json)
  saveProgress({ ...getDefaultData(), ...data })
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY)
}

// Saved words
const SAVED_KEY = 'hanuka-saved-words'

export function getSavedWords() {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleSavedWord(word) {
  const saved = getSavedWords()
  const index = saved.findIndex((w) => w.id === word.id)
  if (index >= 0) {
    saved.splice(index, 1)
  } else {
    saved.push(word)
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
  return saved
}

export function isWordSaved(wordId) {
  return getSavedWords().some((w) => w.id === wordId)
}

// Saved sections (verb conjugations + grammar items)
const SAVED_SECTIONS_KEY = 'hanuka-saved-sections'

export function getSavedSections() {
  try {
    const raw = localStorage.getItem(SAVED_SECTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleSavedSection(lessonId, sectionTitle, rows) {
  const saved = getSavedSections()
  const key = `${lessonId}::${sectionTitle}`
  const index = saved.findIndex((s) => s.key === key)
  if (index >= 0) {
    saved.splice(index, 1)
  } else {
    saved.push({ key, lessonId, sectionTitle, rows })
  }
  localStorage.setItem(SAVED_SECTIONS_KEY, JSON.stringify(saved))
  return saved
}

export function isSectionSaved(lessonId, sectionTitle) {
  return getSavedSections().some((s) => s.key === `${lessonId}::${sectionTitle}`)
}

export function getCompletedLessonIds() {
  const data = loadProgress()
  return Object.entries(data.lessons)
    .filter(([, l]) => l.completed)
    .map(([id]) => id)
}

export const ACHIEVEMENTS = {
  'first-drill': { title: 'First Step', desc: 'Complete your first drill' },
  'fifty-drills': { title: 'Getting Warm', desc: 'Complete 50 drills' },
  'two-hundred-drills': { title: 'Drill Master', desc: 'Complete 200 drills' },
  'streak-3': { title: 'On Fire', desc: '3-day study streak' },
  'streak-7': { title: 'Week Warrior', desc: '7-day study streak' },
  'streak-30': { title: 'Month Master', desc: '30-day study streak' },
  'streak-best-7': { title: 'Persistent', desc: 'Best streak of 7 days' },
  'perfect-drill': { title: 'Perfect', desc: '10 correct on one drill with zero errors' },
  'first-lesson': { title: 'Graduate', desc: 'Complete your first lesson' },
  'half-course': { title: 'Halfway There', desc: 'Complete 5 lessons' },
  'course-complete': { title: 'Polyglot', desc: 'Complete all 10 lessons' },
}
