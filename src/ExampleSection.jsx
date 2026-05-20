import { useState } from 'react'
import { playText } from '../utils/playAudio.js'
import { toggleSavedSection, isSectionSaved } from '../engine/progress.js'

function SpeakerButton({ text }) {
  return (
    <button
      type="button"
      className="ml-2 inline-flex items-center justify-center rounded-full bg-[#EDE6D8] p-1.5 text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white hover:scale-110"
      onClick={(event) => { event.stopPropagation(); playText(text) }}
      title={`Play: ${text}`}
      aria-label={`Play ${text}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.06 0 4.5 4.5 0 010 6.364a.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z" />
      </svg>
    </button>
  )
}

function StarButton({ lessonId, sectionTitle, rows }) {
  const [saved, setSaved] = useState(() => isSectionSaved(lessonId, sectionTitle))
  return (
    <button
      type="button"
      className={`ml-3 inline-flex items-center justify-center rounded-full p-2 transition hover:scale-110 ${
        saved
          ? 'bg-[#C4962A] text-white'
          : 'bg-[#EDE6D8] text-[#5A5A5A] hover:bg-[#C4962A] hover:text-white dark:bg-[#333] dark:text-[#b0b0b0]'
      }`}
      onClick={(e) => { e.stopPropagation(); toggleSavedSection(lessonId, sectionTitle, rows); setSaved(!saved) }}
      title={saved ? 'Remove from gym' : 'Add to gym'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

const accents = {
  orange: 'border-[#EDE6D8] bg-[#F5F0E8] dark:border-[#333] dark:bg-[#2a2a2a]',
  red: 'border-[#8B1A2B]/20 bg-[#8B1A2B]/5 dark:border-[#8B1A2B]/30 dark:bg-[#8B1A2B]/10',
  yellow: 'border-[#C4962A]/20 bg-[#C4962A]/5 dark:border-[#C4962A]/30 dark:bg-[#C4962A]/10',
}

export default function ExampleSection({ section, lessonId }) {
  const accent = accents[section.accent] ?? accents.orange
  const showStar = lessonId && (section.title.includes('Affirmative') || section.title.includes('Negative') || section.title.includes('Questions') || section.title.includes('GRAMMAR ITEM'))
  return (
    <section className={`rounded-3xl border p-6 sm:p-8 ${accent}`}>
      <div className="mb-6 flex items-center">
        <h2 className="text-3xl font-black text-[#3A3A3A] dark:text-[#F5F0E8] sm:text-4xl">{section.title}</h2>
        {showStar && (
          <StarButton lessonId={lessonId} sectionTitle={section.title} rows={section.rows} />
        )}
      </div>
      <div className="grid gap-3 text-lg text-[#3A3A3A] sm:grid-cols-2 sm:text-xl">
        {section.rows.map(([spanish, english]) => (
          <div
            key={`${spanish}-${english}`}
            className="flex items-center rounded-2xl p-3 transition hover:bg-white/60 dark:hover:bg-white/10"
          >
            <span className="font-black text-[#3A3A3A] dark:text-[#F5F0E8]">{spanish}</span>
            <SpeakerButton text={spanish} />
            <span className="mx-2 text-[#C4962A]">—</span>
            <span className="text-[#5A5A5A] dark:text-[#b0b0b0]">{english}</span>
          </div>
        ))}
      </div>
    </section>
  )
}