import { useEffect, useRef, useState } from 'react'
import { CheckIcon, PencilIcon, SparkleIcon, TrashIcon } from './Icons.jsx'

export function DayTaskItem({ task, isFuture, onToggle, onRename, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef(null)

  const isHabit = task.kind === 'daily'
  // Habits can't be ticked ahead of time; one-off tasks can be finished early.
  const canToggle = !(isHabit && isFuture)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  // The delete confirmation quietly resets if not used.
  useEffect(() => {
    if (!confirming) return
    const id = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(id)
  }, [confirming])

  function startEditing() {
    setDraft(task.title)
    setEditing(true)
  }

  function save() {
    const value = draft.trim()
    setEditing(false)
    if (value && value !== task.title) onRename(task.id, value)
  }

  return (
    <li className={`dream day-task ${task.done ? 'is-done' : ''}`}>
      <button
        type="button"
        className="dream__check"
        onClick={() => onToggle(task.id)}
        disabled={!canToggle}
        aria-pressed={task.done}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
        title={canToggle ? undefined : "Habits can be ticked on the day itself"}
      >
        <CheckIcon width={16} height={16} />
      </button>

      <div className="dream__body">
        {editing ? (
          <input
            ref={inputRef}
            className="dream__edit"
            value={draft}
            maxLength={280}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') setEditing(false)
            }}
            onBlur={save}
            aria-label="Edit task"
          />
        ) : (
          <p className="dream__text" onDoubleClick={startEditing} title="Double-click to edit">
            {task.title}
          </p>
        )}

        <div className="chips">
          {isHabit && <span className="chip chip--habit">↻ Every day</span>}
          {isHabit && task.streak > 0 && (
            <span className="chip chip--streak" title="Days in a row">
              🔥 {task.streak} day{task.streak === 1 ? '' : 's'}
            </span>
          )}
          {task.dream_title && (
            <span className="chip chip--dream" title={task.dream_title}>
              <SparkleIcon width={12} height={12} />
              {task.dream_title}
            </span>
          )}
        </div>
      </div>

      <div className="dream__actions">
        {confirming ? (
          <button
            type="button"
            className="confirm-delete"
            onClick={() => onRemove(task.id)}
          >
            {isHabit ? 'Delete habit & history?' : 'Delete?'}
          </button>
        ) : (
          <>
            <button type="button" className="icon-button" onClick={startEditing} aria-label="Edit task">
              <PencilIcon />
            </button>
            <button
              type="button"
              className="icon-button icon-button--danger"
              onClick={() => setConfirming(true)}
              aria-label="Delete task"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
