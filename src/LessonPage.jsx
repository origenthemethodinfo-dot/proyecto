import { useState } from 'react'
import CardGrid from './CardGrid.jsx'
import ExampleSection from './ExampleSection.jsx'
import FinalGym from './FinalGym.jsx'
import VocabularyGrid from './VocabularyGrid.jsx'
import { generateFinalGymRows } from '../engine/generateDrills.js'
import { playText } from '../utils/playAudio.js'

function GrammarSection({ notes }) {
  const [show, setShow] = useState(false)
  if (!notes || notes.length === 0) return null
  return (
    <section>
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">Grammar of this unit</h2>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="rounded-full bg-[#EDE6D8] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white dark:bg-[#333]"
        >
          {show ? 'Hide grammar' : 'Show grammar'}
        </button>
      </div>
      {show && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.title} className="rounded-3xl border border-[#EDE6D8] bg-[#FAFAF8] p-6 shadow-sm dark:border-[#333] dark:bg-[#2a2a2a]">
              <h3 className="text-lg font-black text-[#8B1A2B]">{note.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5A5A5A] dark:text-[#b0b0b0]">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function GrammarItemGroup({ sections, lessonId }) {
  const [show, setShow] = useState(false)
  const mainTitle = sections[0].title.replace('GRAMMAR ITEM — ', '').replace(/\s*\(.*/, '')
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="rounded-full bg-[#C4962A] px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#A07820]"
        >
          {show ? '🔍 Hide label' : '🔍 What is this?'}
        </button>
        {show && (
          <span className="text-lg font-black text-[#C4962A]">{mainTitle}</span>
        )}
      </div>
      {sections.map((section) => {
        const hiddenTitle = section.title.replace(/GRAMMAR ITEM — .*\(([^)]+)\)/, '$1')
        const displayTitle = show ? section.title : hiddenTitle
        return (
          <ExampleSection key={section.title} section={{ ...section, title: displayTitle }} lessonId={lessonId} />
        )
      })}
    </div>
  )
}

function DialogueSection({ dialogues }) {
  if (!dialogues || dialogues.length === 0) return null
  return (
    <section>
      <h2 className="mb-6 text-2xl font-black text-[#3A3A3A] dark:text-[#F5F0E8]">Dialogues</h2>
      <div className="space-y-8">
        {dialogues.map((dialogue) => (
          <div key={dialogue.title} className="rounded-3xl border border-[#EDE6D8] bg-[#FAFAF8] p-6 shadow-sm sm:p-8 dark:border-[#333] dark:bg-[#2a2a2a]">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#5A5A5A] dark:text-[#b0b0b0]">{dialogue.title}</h3>
            <div className="mt-4 space-y-3">
              {dialogue.lines.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 min-w-[4rem] items-center justify-center rounded-full bg-[#EDE6D8] px-2 text-xs font-black text-[#8B1A2B] dark:bg-[#333]">
                    {line.speaker}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-[#3A3A3A] dark:text-[#F5F0E8]">{line.text}</p>
                    <p className="text-sm text-[#5A5A5A] dark:text-[#b0b0b0]">{line.en}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-[#EDE6D8] p-2 text-[#8B1A2B] transition hover:bg-[#8B1A2B] hover:text-white dark:bg-[#333]"
                    onClick={() => playText(line.text)}
                    title="Play"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.06 0 4.5 4.5 0 010 6.364a.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.061z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function LessonPage({ lesson }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] p-4 text-[#3A3A3A] dark:bg-[#1a1a1a] dark:text-[#F5F0E8] sm:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#EDE6D8] bg-white shadow-2xl dark:border-[#333] dark:bg-[#2a2a2a]">
        <header className="border-b border-[#EDE6D8] bg-gradient-to-r from-[#8B1A2B] via-[#A82035] to-[#C4962A] p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/80">
            Método Origen
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
                {lesson.title}
              </h1>
              <p className="mt-4 max-w-3xl text-xl font-semibold text-white/90">
                {lesson.subtitle}
              </p>
            </div>

            <div className="rounded-3xl border border-white/30 bg-white/20 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                Objective
              </p>
              <p className="mt-3 text-lg font-bold text-white">{lesson.objective}</p>
            </div>
          </div>
        </header>

        <main className="space-y-12 p-6 sm:p-8">
          <VocabularyGrid words={lesson.vocabulary} />
          <GrammarSection notes={lesson.grammarNotes} />
          <CardGrid title="Verbs" items={lesson.verbs} />

          {(() => {
            const result = []
            let i = 0
            while (i < lesson.examples.length) {
              const section = lesson.examples[i]
              if (section.title.startsWith('GRAMMAR ITEM')) {
                const group = []
                while (i < lesson.examples.length && lesson.examples[i].title.startsWith('GRAMMAR ITEM')) {
                  group.push(lesson.examples[i])
                  i++
                }
                result.push(<GrammarItemGroup key={group[0].title} sections={group} lessonId={lesson.id} />)
              } else {
                result.push(<ExampleSection key={section.title} section={section} lessonId={lesson.id} />)
                i++
              }
            }
            return result
          })()}

          <DialogueSection dialogues={lesson.dialogues} />
          <FinalGym rows={generateFinalGymRows(lesson)} />
        </main>
      </div>
    </div>
  )
}