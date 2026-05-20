import { useState } from 'react'

export default function LessonIndex({ lessons, currentIndex, onSelect }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-xl bg-[#EDE6D8] px-4 py-2 text-sm font-bold text-[#3A3A3A] transition hover:bg-[#8B1A2B] hover:text-white"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Index'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-3xl border border-[#EDE6D8] bg-white shadow-2xl sm:w-96">
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {lessons.map((lesson, index) => {
                const isCurrent = index === currentIndex
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition ${
                      isCurrent
                        ? 'bg-[#F5F0E8]'
                        : 'hover:bg-[#FAFAF8]'
                    }`}
                    onClick={() => {
                      onSelect(index)
                      setOpen(false)
                    }}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        isCurrent
                          ? 'bg-[#8B1A2B] text-white'
                          : 'bg-[#EDE6D8] text-[#3A3A3A]'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-black ${isCurrent ? 'text-[#8B1A2B]' : 'text-[#3A3A3A]'}`}>
                        {lesson.title}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-[#5A5A5A]">
                        {lesson.subtitle}
                      </p>
                      <p className="mt-1 text-xs text-[#5A5A5A]">
                        {lesson.objective}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}