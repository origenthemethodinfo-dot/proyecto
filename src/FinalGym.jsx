import { playText } from '../utils/playAudio.js'

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

export default function FinalGym({ rows }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="flex items-center gap-3 text-3xl font-black text-[#3A3A3A] dark:text-[#F5F0E8] sm:text-4xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-[#8B1A2B]">
            <path fillRule="evenodd" d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.101-8.467 6.003 6.003 0 00-9.525-7.783A5.25 5.25 0 0010.5 3.75zM3.53 11.836a.75.75 0 01.868-1.226 7.5 7.5 0 0112.154 3.131.75.75 0 11-1.402.499 6 6 0 00-9.72-2.505.75.75 0 01-1.9.101z" clipRule="evenodd"/>
          </svg>
          FINAL GYM
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map(([english, spanish]) => (
          <div
            key={`${english}-${spanish}`}
            className="flex items-center gap-3 rounded-2xl border border-[#EDE6D8] bg-[#FAFAF8] p-4 text-lg transition hover:bg-[#F5F0E8] dark:border-[#333] dark:bg-[#2a2a2a] dark:hover:bg-[#333]"
          >
            <span className="font-semibold text-[#3A3A3A] dark:text-[#F5F0E8]">{spanish}</span>
            <SpeakerButton text={spanish} />
            <span className="mx-2 text-[#C4962A]">—</span>
            <span className="text-[#5A5A5A] dark:text-[#b0b0b0]">{english}</span>
          </div>
        ))}
      </div>
    </section>
  )
}