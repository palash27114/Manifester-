import { Calendar } from './Calendar.jsx'
import { DayTaskForm } from './DayTaskForm.jsx'
import { DayTaskItem } from './DayTaskItem.jsx'
import { SparkleIcon } from './Icons.jsx'
import { addDays, formatDay } from '../utils/dates.js'

function relativeDayLabel(date, today) {
  if (date === today) return 'Today'
  if (date === addDays(today, -1)) return 'Yesterday'
  if (date === addDays(today, 1)) return 'Tomorrow'
  return formatDay(date, { weekday: 'long', month: 'short', day: 'numeric' })
}

export function TodayView({ date, month, today, onSelectDate, onMonthChange, daily, dreams }) {
  const { tasks, status, loadError, summary, reload, addTask, toggleDone, renameTask, removeTask } = daily

  const done = tasks.filter((t) => t.done).length
  const dayLabel = relativeDayLabel(date, today)
  const allDone = status === 'ready' && tasks.length > 0 && done === tasks.length

  return (
    <div className="today">
      <section className="panel panel--calendar" aria-label="Calendar">
        <Calendar
          month={month}
          selected={date}
          today={today}
          summary={summary}
          onSelect={onSelectDate}
          onMonthChange={onMonthChange}
        />
      </section>

      <section className="panel" aria-labelledby="day-heading">
        <div className="panel__head">
          <div>
            <h2 id="day-heading">{dayLabel}</h2>
            {date !== today && (
              <p className="panel__sub">{formatDay(date, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            )}
          </div>
          {tasks.length > 0 && (
            <div className="day-progress" aria-label={`${done} of ${tasks.length} done`}>
              <span>
                {done}/{tasks.length}
              </span>
              <div className="day-progress__bar">
                <i style={{ width: `${(done / tasks.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        <DayTaskForm dreams={dreams} onAdd={addTask} dayLabel={date === today ? 'today' : `on ${dayLabel}`} />

        {status === 'loading' && (
          <ul className="dreams" aria-busy="true" aria-label="Loading tasks">
            {[0, 1].map((i) => (
              <li key={i} className="dream dream--skeleton">
                <span className="skeleton skeleton--circle" />
                <span className="skeleton skeleton--line" style={{ width: `${60 - i * 20}%` }} />
              </li>
            ))}
          </ul>
        )}

        {status === 'error' && (
          <div className="state">
            <h3>Couldn't load this day</h3>
            <p>{loadError}</p>
            <button type="button" className="button button--primary" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && tasks.length === 0 && (
          <div className="state">
            <SparkleIcon width={32} height={32} className="state__icon" />
            <h3>A blank page</h3>
            <p>Add a task for this day, or a habit you want to repeat every day.</p>
          </div>
        )}

        {status === 'ready' && tasks.length > 0 && (
          <>
            {allDone && (
              <p className="all-done">
                <SparkleIcon width={16} height={16} /> Everything done{date === today ? ' for today' : ''}. Beautiful.
              </p>
            )}
            <ul className="dreams">
              {tasks.map((task) => (
                <DayTaskItem
                  key={task.id}
                  task={task}
                  isFuture={date > today}
                  onToggle={toggleDone}
                  onRename={renameTask}
                  onRemove={removeTask}
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
