import { useEffect, useRef, useState } from 'react'
import { SparkleIcon } from './Icons.jsx'

const MAX_LENGTH = 280
const PROMPTS = [
  'I am becoming…',
  'I attract…',
  'I am grateful for…',
  'By next year I will…',
  'I deserve…',
]

export function DreamForm({ onAdd }) {
  const [dream, setDream] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const inputRef = useRef(null)

  // Rotate the placeholder while the field is empty.
  useEffect(() => {
    if (dream) return
    const id = setInterval(() => setPromptIndex((i) => (i + 1) % PROMPTS.length), 3500)
    return () => clearInterval(id)
  }, [dream])

  // Press "/" anywhere to jump to the input.
  useEffect(() => {
    const onKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (event.key === '/' && !typing) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const trimmed = dream.trim()
  const remaining = MAX_LENGTH - dream.length

  async function handleSubmit(event) {
    event.preventDefault()
    if (!trimmed || submitting) return

    setSubmitting(true)
    const ok = await onAdd(trimmed)
    setSubmitting(false)

    if (ok) setDream('')
    inputRef.current?.focus()
  }

  return (
    <form className="dream-form" onSubmit={handleSubmit}>
      <label htmlFor="dream-input" className="visually-hidden">
        New dream
      </label>
      <input
        id="dream-input"
        ref={inputRef}
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        placeholder={PROMPTS[promptIndex]}
        maxLength={MAX_LENGTH}
        autoComplete="off"
        autoFocus
      />
      {remaining <= 40 && (
        <span className={`dream-form__count ${remaining <= 10 ? 'is-low' : ''}`}>
          {remaining}
        </span>
      )}
      <kbd className="dream-form__hint" aria-hidden="true">/</kbd>
      <button type="submit" className="button button--primary" disabled={!trimmed || submitting}>
        <SparkleIcon />
        {submitting ? 'Manifesting…' : 'Manifest'}
      </button>
    </form>
  )
}
