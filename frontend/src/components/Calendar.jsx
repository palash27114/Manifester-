import { useEffect, useRef } from 'react'
import {
  WEEKDAYS,
  addDays,
  addMonths,
  formatDay,
  formatMonth,
  monthGrid,
  startOfMonth,
} from '../utils/dates.js'

const ARROW_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

export function Calendar({ month, selected, today, summary, onSelect, onMonthChange }) {
  const gridRef = useRef(null)
  const days = monthGrid(month)
  const focusAfterKey = useRef(false)

  // After arrow-key navigation, move keyboard focus to the newly selected day.
  useEffect(() => {
    if (!focusAfterKey.current) return
    focusAfterKey.current = false
    gridRef.current?.querySelector(`[data-date="${selected}"]`)?.focus()
  }, [selected, month])

  function select(day) {
    onSelect(day)
    if (startOfMonth(day) !== month) onMonthChange(startOfMonth(day))
  }

  function onKeyDown(event) {
    const step = ARROW_STEPS[event.key]
    if (!step) return
    event.preventDefault()
    focusAfterKey.current = true
    select(addDays(selected, step))
  }

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button
          type="button"
          className="icon-button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 aria-live="polite">{formatMonth(month)}</h3>
        <button
          type="button"
          className="icon-button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
        >
          ›
        </button>
        <button
          type="button"
          className="calendar__today"
          onClick={() => select(today)}
          disabled={selected === today && startOfMonth(today) === month}
        >
          Today
        </button>
      </div>

      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>

      <div className="calendar__grid" ref={gridRef} role="grid" onKeyDown={onKeyDown}>
        {days.map((day) => {
          const info = summary[day]
          const total = info?.total ?? 0
          const done = info?.done ?? 0
          const isPast = day <= today
          const progress = total ? done / total : 0

          const classes = ['day']
          if (startOfMonth(day) !== month) classes.push('is-outside')
          if (day === today) classes.push('is-today')
          if (day === selected) classes.push('is-selected')
          if (total && isPast) classes.push('has-ring')
          if (total && isPast && done === total) classes.push('is-complete')
          if (total && !isPast) classes.push('has-plan')

          const label = `${formatDay(day)}${total ? `, ${done} of ${total} done` : ''}`

          return (
            <button
              key={day}
              type="button"
              data-date={day}
              className={classes.join(' ')}
              style={{ '--progress': progress }}
              onClick={() => select(day)}
              tabIndex={day === selected ? 0 : -1}
              aria-label={label}
              aria-pressed={day === selected}
            >
              <span>{Number(day.slice(8))}</span>
            </button>
          )
        })}
      </div>

      <div className="calendar__legend" aria-hidden="true">
        <span><i className="legend legend--ring" /> progress</span>
        <span><i className="legend legend--done" /> all done</span>
        <span><i className="legend legend--plan" /> planned</span>
      </div>
    </div>
  )
}
