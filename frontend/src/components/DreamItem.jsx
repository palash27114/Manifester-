import { useEffect, useRef, useState } from 'react'
import { CheckIcon, PencilIcon, TrashIcon } from './Icons.jsx'
import { timeAgo } from '../utils/timeAgo.js'

const SPARKS = 10

export function DreamItem({ task, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.dream)
  const [celebrating, setCelebrating] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  useEffect(() => {
    if (!celebrating) return
    const id = setTimeout(() => setCelebrating(false), 900)
    return () => clearTimeout(id)
  }, [celebrating])

  function toggle() {
    const next = !task.is_completed
    if (next) setCelebrating(true)
    onUpdate(task.id, { is_completed: next })
  }

  function startEditing() {
    setDraft(task.dream)
    setEditing(true)
  }

  function save() {
    const value = draft.trim()
    setEditing(false)
    if (value && value !== task.dream) onUpdate(task.id, { dream: value })
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') save()
    if (event.key === 'Escape') setEditing(false)
  }

  return (
    <li className={`dream ${task.is_completed ? 'is-done' : ''} ${celebrating ? 'is-celebrating' : ''}`}>
      <button
        type="button"
        className="dream__check"
        onClick={toggle}
        aria-pressed={task.is_completed}
        aria-label={task.is_completed ? 'Mark as not manifested' : 'Mark as manifested'}
      >
        <CheckIcon width={16} height={16} />
        {celebrating && (
          <span className="sparks" aria-hidden="true">
            {Array.from({ length: SPARKS }, (_, i) => (
              <i key={i} style={{ '--angle': `${(360 / SPARKS) * i}deg` }} />
            ))}
          </span>
        )}
      </button>

      <div className="dream__body">
        {editing ? (
          <input
            ref={inputRef}
            className="dream__edit"
            value={draft}
            maxLength={280}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={save}
            aria-label="Edit dream"
          />
        ) : (
          <p className="dream__text" onDoubleClick={startEditing} title="Double-click to edit">
            {task.dream}
          </p>
        )}
        <time className="dream__meta" dateTime={task.created_at}>
          {timeAgo(task.created_at)}
          {task.task_count > 0 &&
            ` · ${task.task_count} daily task${task.task_count === 1 ? '' : 's'}`}
        </time>
      </div>

      <div className="dream__actions">
        <button type="button" className="icon-button" onClick={startEditing} aria-label="Edit dream">
          <PencilIcon />
        </button>
        <button
          type="button"
          className="icon-button icon-button--danger"
          onClick={() => onRemove(task.id)}
          aria-label="Delete dream"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}
