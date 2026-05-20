import { useState } from 'react'
import { exportProgress, importProgress } from '../engine/progress.js'

export default function BackupRestore({ onBack }) {
  const [data, setData] = useState('')
  const [status, setStatus] = useState(null)

  function handleExport() {
    const json = exportProgress()
    setData(json)
    navigator.clipboard?.writeText(json).then(() => {
      setStatus('Copied to clipboard!')
      setTimeout(() => setStatus(null), 2000)
    })
  }

  function handleImport() {
    try {
      importProgress(data)
      setStatus('Progress restored! Refresh the page to see changes.')
    } catch (e) {
      setStatus('Invalid data. Please paste valid JSON.')
    }
  }

  return (
    <div className="min-h-screen bg-origen-cream p-4 text-origen-carbon dark:bg-slate-950 dark:text-slate-200 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 rounded-xl bg-origen-white px-4 py-2 text-sm font-bold text-origen-carbon shadow-sm transition hover:bg-origen-cream dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-origen-mostaza/20 bg-origen-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-origen-mostaza/20 to-origen-granate/10 p-8 text-center">
            <h1 className="font-display text-4xl text-origen-granate dark:text-origen-mostaza">Backup & Restore</h1>
            <p className="mt-2 font-bold text-origen-carbon/70 dark:text-slate-400">Save or transfer your progress</p>
          </div>

          <div className="space-y-6 p-8">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-origen-carbon dark:text-white">Your Data</h2>
                <button
                  type="button"
                  onClick={handleExport}
                  className="rounded-xl bg-origen-granate px-4 py-2 text-sm font-black text-white transition hover:bg-origen-granate/90"
                >
                  Export & Copy
                </button>
              </div>
              <textarea
                className="mt-3 h-48 w-full rounded-2xl border-2 border-origen-cream bg-origen-cream/50 p-4 font-mono text-xs text-origen-carbon outline-none transition focus:border-origen-mostaza dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Click Export to generate your backup code, or paste one here to restore..."
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleImport}
                disabled={!data.trim()}
                className="rounded-2xl bg-origen-carbon px-8 py-4 font-black text-white transition hover:bg-origen-carbon/90 disabled:opacity-40"
              >
                Restore Progress
              </button>
              {status && (
                <p className={`text-sm font-bold ${status.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
