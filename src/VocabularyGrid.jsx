import { useState } from 'react'
import { playText } from '../utils/playAudio.js'
import { toggleSavedWord, isWordSaved } from '../engine/progress.js'

function SpeakerButton({ text, label }) {
  return (
    <button
      type="button"
      className="ml-2 inline-flex items-center justify-center rounded-full bg-[#EDE6D8] p-1.5 text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white hover:scale-110"
      onClick={(event) => { event.stopPropagation(); playText(text) }}
      title={label ? `Play: ${label}` : `Play: ${text}`}
      aria-label={label ? `Play ${label}` : `Play ${text}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.06 0 4.5 4.5 0 010 6.364a.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z" />
      </svg>
    </button>
  )
}

function StarButton({ word }) {
  const [saved, setSaved] = useState(() => isWordSaved(word.id))
  return (
    <button
      type="button"
      className={`ml-2 inline-flex items-center justify-center rounded-full p-1.5 transition hover:scale-110 ${
        saved
          ? 'bg-[#C4962A] text-white'
          : 'bg-[#EDE6D8] text-[#5A5A5A] hover:bg-[#C4962A] hover:text-white'
      }`}
      onClick={(e) => { e.stopPropagation(); toggleSavedWord(word); setSaved(!saved) }}
      title={saved ? 'Remove from saved' : 'Save word'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

export default function VocabularyGrid({ words }) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#3A3A3A] dark:text-[#F5F0E8] sm:text-4xl">Key Words</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {words.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-[#EDE6D8] bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#333] dark:bg-[#2a2a2a]"
          >
            <div className="mb-4 text-5xl" aria-hidden="true">{item.emoji}</div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-center">
                  <p className="text-xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">{item.definite}</p>
                  <SpeakerButton text={item.definite} />
                  <StarButton word={item} />
                </div>
                <p className="text-sm text-[#5A5A5A] dark:text-[#b0b0b0]">{item.enDefinite}</p>
              </div>
              {item.indefinite && (
                <div>
                  <div className="flex items-center justify-center">
                    <p className="text-xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">{item.indefinite}</p>
                    <SpeakerButton text={item.indefinite} />
                  </div>
                  <p className="text-sm text-[#5A5A5A] dark:text-[#b0b0b0]">{item.enIndefinite}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}