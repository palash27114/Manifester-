import { useState } from 'react'

const MAX_LENGTH = 280

export function DayTaskForm({ dreams, onAdd, dayLabel }) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('once')
  const [dreamId, setDreamId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const trimmed = title.trim()
  const openDreams = dreams.filter((d) => !d.is_completed)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!trimmed || submitting) return

    setSubmitting(true)
    const ok = await onAdd({ title: trimmed, kind, dreamId: dreamId ? Number(dreamId) : null })
    setSubmitting(false)
    if (ok) setTitle('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <label htmlFor="task-input" className="visually-hidden">
          New task
        </label>
        <input
          id="task-input"
          className="task-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === 'daily' ? 'A habit to do every day…' : `Something to do ${dayLabel.toLowerCase()}…`}
          maxLength={MAX_LENGTH}
          autoComplete="off"
        />
        <button type="submit" className="button button--primary" disabled={!trimmed || submitting}>
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </div>

      <div className="task-form__options">
        <div className="segmented" role="radiogroup" aria-label="Repeat">
          <button
            type="button"
            role="radio"
            aria-checked={kind === 'once'}
            className={kind === 'once' ? 'is-active' : ''}
            onClick={() => setKind('once')}
          >
            Just this day
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={kind === 'daily'}
            className={kind === 'daily' ? 'is-active' : ''}
            onClick={() => setKind('daily')}
          >
            ↻ Every day
          </button>
        </div>

        {openDreams.length > 0 && (
          <label className="task-form__dream">
            <span>Toward</span>
            <select value={dreamId} onChange={(e) => setDreamId(e.target.value)}>
              <option value="">No dream</option>
              {openDreams.map((dream) => (
                <option key={dream.id} value={dream.id}>
                  {dream.dream.length > 40 ? `${dream.dream.slice(0, 40)}…` : dream.dream}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </form>
  )
}
