import { useEffect, useRef, useState } from 'react'
import { playText } from '../utils/playAudio.js'
import { playCorrect, playIncorrect, playAchievement } from '../utils/sounds.js'
import { burstConfetti } from '../utils/confetti.js'
import { recordDrillResult, recordSession, getSettings, saveSettings } from '../engine/progress.js'
import { evaluateSpanishAnswer } from '../utils/levenshtein.js'
import WritingFeedback from './WritingFeedback.jsx'

function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function PracticeMode({ drills, lessonId, onRestart }) {
  const settings = getSettings()
  const [queue, setQueue] = useState(() => shuffleArray(drills))
  const [position, setPosition] = useState(0)
  const [phase, setPhase] = useState('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [repeatCount, setRepeatCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [failedDrills, setFailedDrills] = useState([])
  const [autoPlay, setAutoPlay] = useState(settings.autoPlay)
  const [audioSpeed, setAudioSpeed] = useState(settings.audioSpeed)
  const [audioLoading, setAudioLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [writingResult, setWritingResult] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mode, setMode] = useState(settings.mode)
  const [shake, setShake] = useState(false)
  const [cardAnim, setCardAnim] = useState('')
  const questionStartRef = useRef(0)
  const timerRef = useRef(null)
  const sectionRef = useRef(null)
  const current = queue[position] ?? null
  const total = queue.length
  const finished = position >= total

  useEffect(() => {
    if (finished) {
      clearInterval(timerRef.current)
      recordSession(lessonId, correctCount, repeatCount, elapsed)
      if (accuracy >= 80) {
        playAchievement()
        setTimeout(() => {
          if (sectionRef.current) burstConfetti(sectionRef.current)
        }, 300)
      }
      return
    }
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [finished])

  useEffect(() => {
    function handleKeyDown(event) {
      if (document.activeElement.tagName === 'INPUT') return
      if (finished) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleRestart()
        }
        return
      }
      if (phase === 'question') {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          revealAnswer()
        }
        return
      }
      if (phase === 'answer') {
        const key = event.key.toLowerCase()
        if (key === 'c' || key === 'arrowright') { event.preventDefault(); handleCorrect() }
        else if (key === 'x' || key === 'arrowleft') { event.preventDefault(); handleRepeat() }
        else if (key === 'p') { event.preventDefault(); playCurrentAudio() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, finished, current])

  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0
    function handleTouchStart(e) {
      touchStartX = e.changedTouches[0].screenX
      touchStartY = e.changedTouches[0].screenY
    }
    function handleTouchEnd(e) {
      const touchEndX = e.changedTouches[0].screenX
      const touchEndY = e.changedTouches[0].screenY
      const diffX = touchStartX - touchEndX
      const diffY = touchStartY - touchEndY
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (phase === 'answer') {
          if (diffX > 0) handleCorrect()
          else handleRepeat()
        }
      }
    }
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [phase, current])

  async function playCurrentAudio() {
    if (!current) return
    setAudioLoading(true)
    try {
      const response = await fetch(`/api/tts?text=${encodeURIComponent(current.answer)}`)
      if (!response.ok) throw new Error('TTS failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.playbackRate = audioSpeed
      await new Promise((resolve, reject) => {
        audio.addEventListener('ended', () => { URL.revokeObjectURL(url); resolve() })
        audio.addEventListener('error', reject)
        audio.play().catch(reject)
      })
    } finally {
      setAudioLoading(false)
    }
  }

  function revealAnswer() {
    if (phase !== 'question' || !current) return
    if (mode === 'writing' || mode === 'speaking') return
    setPhase('answer')
    if (autoPlay) playCurrentAudio()
  }

  function advance() {
    setPhase('question')
    setPosition((p) => p + 1)
    setUserAnswer('')
    setWritingResult(null)
  }

  function handleCorrect() {
    if (phase !== 'answer' || !current) return
    const responseTime = Date.now() - questionStartRef.current
    const targetLessonId = current.originalLessonId || lessonId
    recordDrillResult(targetLessonId, current.id, true, responseTime)
    playCorrect()
    setCardAnim('animate-pop')
    setCorrectCount((v) => v + 1)
    setStreak((v) => { const next = v + 1; setMaxStreak((m) => Math.max(m, next)); return next })
    advance()
  }

  function handleRepeat() {
    if (phase !== 'answer' || !current) return
    const responseTime = Date.now() - questionStartRef.current
    const targetLessonId = current.originalLessonId || lessonId
    recordDrillResult(targetLessonId, current.id, false, responseTime)
    playIncorrect()
    setShake(true)
    setTimeout(() => setShake(false), 500)
    setRepeatCount((v) => v + 1)
    setStreak(0)
    setFailedDrills((prev) => {
      if (prev.some((d) => d.id === current.id)) return prev
      return [...prev, current]
    })
    const offset = 2 + Math.floor(Math.random() * 2)
    const insertAt = Math.min(position + 1 + offset, queue.length)
    setQueue((prev) => { const next = [...prev]; next.splice(insertAt, 0, current); return next })
    advance()
  }

  function handleWritingSubmit() {
    if (!current || !userAnswer.trim()) return
    const evalResult = evaluateSpanishAnswer(userAnswer, current.answer)
    setWritingResult(evalResult.status)
    setPhase('answer')
    if (autoPlay) playCurrentAudio()
    if (evalResult.status === 'correct') setTimeout(() => handleCorrect(), 700)
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let hasSpoken = false
      let silenceStart = 0
      const VAD_THRESHOLD = 18
      const SILENCE_MS = 900
      const MAX_MS = 6000
      let vadFrameId = null
      let maxTimeoutId = null
      function checkVAD() {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        if (avg > VAD_THRESHOLD) { hasSpoken = true; silenceStart = 0 }
        else if (hasSpoken) {
          if (silenceStart === 0) silenceStart = performance.now()
          else if (performance.now() - silenceStart > SILENCE_MS) {
            if (recorder.state === 'recording') { recorder.stop(); return }
          }
        }
        vadFrameId = requestAnimationFrame(checkVAD)
      }
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = async () => {
        if (vadFrameId) cancelAnimationFrame(vadFrameId)
        if (maxTimeoutId) clearTimeout(maxTimeoutId)
        try { await audioCtx.close() } catch {}
        setIsRecording(false)
        stream.getTracks().forEach((t) => t.stop())
        await new Promise((r) => setTimeout(r, 200))
        const blob = new Blob(chunks, { type: recorder.mimeType })
        if (blob.size === 0 || !hasSpoken) { setPhase('answer'); setWritingResult(null); return }
        const buffer = await blob.arrayBuffer()
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
        try {
          const res = await fetch('/api/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64 }),
          })
          if (!res.ok) { setPhase('answer'); setWritingResult(null); return }
          const { transcript } = await res.json()
          setUserAnswer(transcript)
          handleSpeechSubmit(transcript)
        } catch { setPhase('answer'); setWritingResult(null) }
      }
      setIsRecording(true)
      setWritingResult(null)
      recorder.start()
      vadFrameId = requestAnimationFrame(checkVAD)
      maxTimeoutId = setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, MAX_MS)
    } catch { setIsRecording(false); setPhase('answer'); setWritingResult(null) }
  }

  function handleSpeechSubmit(transcript) {
    if (!current || !transcript.trim()) return
    const evalResult = evaluateSpanishAnswer(transcript, current.answer)
    const isPass = evalResult.status === 'correct' || evalResult.status === 'close'
    setWritingResult(isPass ? 'correct' : 'incorrect')
    setPhase('answer')
    if (autoPlay) playCurrentAudio()
    if (isPass) setTimeout(() => handleCorrect(), 700)
  }

  async function handleShadow() {
    if (!current) return
    await playCurrentAudio()
    await new Promise((r) => setTimeout(r, 1500))
    startRecording()
  }

  function handleRestart() {
    if (onRestart) {
      onRestart()
      return
    }
    setQueue(shuffleArray(drills))
    setPosition(0)
    setPhase('question')
    setCorrectCount(0)
    setRepeatCount(0)
    setStreak(0)
    setMaxStreak(0)
    setFailedDrills([])
    setElapsed(0)
    setUserAnswer('')
    setWritingResult(null)
    setShake(false)
    setCardAnim('')
    questionStartRef.current = Date.now()
  }

  useEffect(() => {
    if (phase === 'question' && current) questionStartRef.current = Date.now()
  }, [phase, current, position])

  const accuracy = correctCount + repeatCount > 0
    ? Math.round((correctCount / (correctCount + repeatCount)) * 100)
    : 0
  const repeatsQueued = Math.max(0, total - drills.length)

  if (finished) {
    return (
      <section className="rounded-[2rem] bg-[#3A3A3A] p-6 text-white shadow-2xl sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#C4962A]">Session complete</p>
          <h2 className="mt-4 text-4xl font-black sm:text-6xl">Great job!</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-3xl font-black text-[#C4962A]">{correctCount}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">Correct</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-3xl font-black text-[#8B1A2B]">{repeatCount}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">Repeated</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-3xl font-black text-[#C4962A]">{accuracy}%</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">Accuracy</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-3xl font-black text-[#C4962A]">{maxStreak}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">Best streak</p>
            </div>
          </div>
          {failedDrills.length > 0 && (
            <div className="mt-8 rounded-3xl bg-white/5 p-6 text-left">
              <p className="text-sm font-black uppercase tracking-wider text-[#8B1A2B]">Review these</p>
              <div className="mt-4 space-y-3">
                {failedDrills.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <div>
                      <p className="font-bold text-white/80">{d.prompt}</p>
                      <p className="mt-1 text-lg font-black text-white">{d.answer}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-[#EDE6D8] p-2 text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white"
                      onClick={() => playText(d.answer)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.06 0 4.5 4.5 0 010 6.364a.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            className="mt-8 rounded-2xl bg-[#8B1A2B] px-8 py-4 font-black text-white transition hover:bg-[#6B1221]"
            onClick={handleRestart}
            autoFocus
          >
            {onRestart ? 'Next batch (Enter)' : 'Start again (Enter)'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="rounded-[2rem] bg-[#3A3A3A] p-6 text-white shadow-2xl sm:p-8" aria-live="polite" aria-atomic="false">
      {/* Header stats */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#EDE6D8] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#8B1A2B]">
            Fast practice
          </span>
          <span className="text-xs font-bold text-white/50">{position + 1} / {total}</span>
          {repeatsQueued > 0 && (
            <span className="text-xs font-bold text-[#C4962A]">+{repeatsQueued} repeat</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-white/50">
          <span className="text-[#C4962A]">{correctCount} correct</span>
          <span className="text-[#8B1A2B]">{repeatCount} repeat</span>
          <span className="text-white/70">streak {streak}</span>
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#C4962A] transition-all" style={{ width: `${total > 0 ? Math.round((position / total) * 100) : 0}%` }} />
      </div>

      {/* Mode selector */}
      <div className="mb-4 flex gap-2">
        {[
          { key: 'standard', label: 'Standard' },
          { key: 'writing', label: 'Writing' },
          { key: 'speaking', label: 'Speaking' },
          { key: 'audio', label: 'Audio only' },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              mode === m.key
                ? 'bg-[#C4962A] text-white'
                : 'bg-white/10 text-white/50 hover:bg-white/20'
            }`}
            onClick={() => { setMode(m.key); saveSettings({ mode: m.key }); handleRestart() }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div className={`rounded-3xl bg-white p-6 text-[#3A3A3A] transition-all sm:p-10 dark:bg-[#2a2a2a] dark:text-[#F5F0E8] ${shake ? 'motion-safe:animate-shake' : ''} ${cardAnim}`}>
        {phase === 'question' ? (
          <div className="text-center motion-safe:animate-fade-in">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#5A5A5A] dark:text-[#b0b0b0]">
              {mode === 'audio' ? 'Listen and translate to English' : 'Translate to Spanish'}
            </p>
            {mode === 'audio' ? (
              <div className="mt-6 flex flex-col items-center gap-3">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 animate-pulse rounded-full bg-[#EDE6D8] flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-[#8B1A2B]" />
                    </div>
                    <p className="text-sm font-black text-[#8B1A2B] uppercase tracking-wider">Listening...</p>
                    <p className="text-xs font-semibold text-[#5A5A5A]">Repeat what you heard</p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full bg-[#EDE6D8] p-6 text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white"
                      onClick={playCurrentAudio}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.06 0 4.5 4.5 0 010 6.364a.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-[#3A3A3A] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#8B1A2B]"
                      onClick={handleShadow}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.042h1.5a.75.75 0 010 1.5h-4.5a.75.75 0 010-1.5h1.5v-2.042a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                      </svg>
                      Shadow it
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="mt-6 text-4xl font-black leading-tight sm:text-6xl">{current.prompt}</p>
            )}
            {mode === 'writing' ? (
              <div className="mt-8">
                <input
                  type="text"
                  className="w-full max-w-lg rounded-2xl border-2 border-[#EDE6D8] bg-white p-4 text-center text-xl font-bold text-[#3A3A3A] outline-none transition focus:border-[#8B1A2B] dark:border-[#555] dark:bg-[#1a1a1a] dark:text-[#F5F0E8]"
                  placeholder="Type the Spanish..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleWritingSubmit() } }}
                  autoFocus
                />
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#3A3A3A] px-8 py-4 font-black text-white transition hover:bg-[#8B1A2B] disabled:opacity-40"
                  onClick={handleWritingSubmit}
                  disabled={!userAnswer.trim()}
                >
                  <span>Check</span>
                  <span className="rounded bg-white/20 px-2 py-0.5 text-xs">Enter</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-[#3A3A3A] px-8 py-4 font-black text-white transition hover:bg-[#8B1A2B]"
                onClick={revealAnswer}
              >
                <span>Reveal answer</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-xs">Space</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center motion-safe:animate-fade-in">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#5A5A5A] dark:text-[#b0b0b0]">Answer</p>
            {mode !== 'audio' && (
              <p className="mt-4 text-2xl font-bold text-[#5A5A5A] dark:text-[#b0b0b0]">{current.prompt}</p>
            )}
            {mode === 'writing' && (
              <div className="my-4">
                {writingResult === 'correct' ? (
                  <p className="text-lg font-black text-[#C4962A]">Correct!</p>
                ) : writingResult === 'close' ? (
                  <div>
                    <p className="text-lg font-black text-[#C4962A]">Almost!</p>
                    <WritingFeedback userAnswer={userAnswer} expectedAnswer={current.answer} />
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-black text-[#8B1A2B]">Not quite.</p>
                    <WritingFeedback userAnswer={userAnswer} expectedAnswer={current.answer} />
                  </div>
                )}
              </div>
            )}
            {mode === 'audio' && userAnswer && (
              <div className="my-4">
                {writingResult === 'correct' ? (
                  <p className="text-lg font-black text-[#C4962A]">Perfect shadow!</p>
                ) : (
                  <div>
                    <p className="text-lg font-black text-[#8B1A2B]">Not quite.</p>
                    <WritingFeedback userAnswer={userAnswer} expectedAnswer={current.answer} />
                  </div>
                )}
              </div>
            )}
            <p className="mt-2 text-5xl font-black leading-tight text-[#3A3A3A] sm:text-7xl">
              {current.answer}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                className="rounded-full bg-[#EDE6D8] p-3 text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white disabled:opacity-50"
                onClick={playCurrentAudio}
                disabled={audioLoading}
                title="Play audio (P)"
              >
                {audioLoading ? (
                  <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.06 0 4.5 4.5 0 010 6.364a.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z" />
                  </svg>
                )}
              </button>
              <div className="flex items-center gap-1 rounded-full bg-[#F5F0E8] px-3 py-2">
                {[0.5, 0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    className={`flex h-11 min-w-[44px] items-center justify-center rounded-full px-2 py-1 text-xs font-black transition ${
                      audioSpeed === speed
                        ? 'bg-[#8B1A2B] text-white'
                        : 'text-[#5A5A5A] hover:bg-[#EDE6D8]'
                    }`}
                    onClick={() => { setAudioSpeed(speed); saveSettings({ audioSpeed: speed }) }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-[#F5F0E8] px-4 py-2 text-xs font-bold text-[#5A5A5A]">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#8B1A2B]"
                  checked={autoPlay}
                  onChange={(e) => { setAutoPlay(e.target.checked); saveSettings({ autoPlay: e.target.checked }) }}
                />
                Auto-play
              </label>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-2xl bg-[#EDE6D8] px-6 py-4 font-black text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white"
                onClick={handleCorrect}
              >
                <span>I got it</span>
                <span className="ml-2 rounded bg-[#8B1A2B]/20 px-2 py-0.5 text-xs">C</span>
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#3A3A3A] px-6 py-4 font-black text-white transition hover:bg-[#8B1A2B]"
                onClick={handleRepeat}
              >
                <span>Repeat</span>
                <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs">X</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-white/40">
        {phase === 'question' ? (
          <span className="rounded-lg bg-white/10 px-3 py-2">Space to reveal</span>
        ) : (
          <>
            <span className="rounded-lg bg-white/10 px-3 py-2">C correct</span>
            <span className="rounded-lg bg-white/10 px-3 py-2">X repeat</span>
            <span className="rounded-lg bg-white/10 px-3 py-2">P play audio</span>
            <span className="rounded-lg bg-white/10 px-3 py-2">Swipe left/right</span>
          </>
        )}
      </div>
    </section>
  )
}