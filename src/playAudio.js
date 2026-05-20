const DB_NAME = 'hanuka-tts-cache'
const STORE_NAME = 'audio'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

async function getCachedAudio(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

async function setCachedAudio(key, blob) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(blob, key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch {
    // noop
  }
}

function hashText(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return String(hash)
}

export async function playText(text, speed = 1) {
  const key = hashText(text)

  // Try cache first
  let blob = await getCachedAudio(key)

  if (!blob) {
    try {
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
      if (!response.ok) {
        const details = await response.json().catch(() => ({ error: 'Unknown TTS error.' }))
        throw new Error(details.error)
      }
      blob = await response.blob()
      await setCachedAudio(key, blob)
    } catch (error) {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'es-ES'
        utterance.rate = speed
        window.speechSynthesis.speak(utterance)
        return
      }
      console.error('TTS failed:', error.message)
      return
    }
  }

  const audioUrl = URL.createObjectURL(blob)
  const audio = new Audio(audioUrl)
  audio.playbackRate = speed

  try {
    await audio.play()
  } finally {
    audio.addEventListener('ended', () => URL.revokeObjectURL(audioUrl), { once: true })
  }
}

export async function prefetchAudio(text) {
  const key = hashText(text)
  const cached = await getCachedAudio(key)
  if (cached) return
  try {
    const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
    if (!response.ok) return
    const blob = await response.blob()
    await setCachedAudio(key, blob)
  } catch {
    // noop
  }
}
