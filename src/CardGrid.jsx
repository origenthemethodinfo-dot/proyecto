import { playText } from '../utils/playAudio.js'

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

export default function CardGrid({ title, items }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-3xl font-black text-[#3A3A3A] dark:text-[#F5F0E8] sm:text-4xl">{title}</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={`${item.spanish}-${item.english}`}
            className="rounded-3xl border border-[#EDE6D8] bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#333] dark:bg-[#2a2a2a]"
          >
            <div className="flex items-center justify-center">
              <p className="text-2xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">{item.spanish}</p>
              <SpeakerButton text={item.spanish} />
            </div>
            <p className="mt-2 text-[#5A5A5A] dark:text-[#b0b0b0]">{item.english}</p>
          </article>
        ))}
      </div>
    </section>
  )
}