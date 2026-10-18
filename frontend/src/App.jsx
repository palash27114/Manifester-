import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTasks } from './hooks/useTasks.js'
import { useDailyTasks } from './hooks/useDailyTasks.js'
import { DreamsView } from './components/DreamsView.jsx'
import { TodayView } from './components/TodayView.jsx'
import { ProgressRing } from './components/ProgressRing.jsx'
import { Toasts } from './components/Toasts.jsx'
import { startOfMonth, todayISO } from './utils/dates.js'
import './App.css'
import './Today.css'

const VIEWS = [
  { key: 'today', label: 'Today' },
  { key: 'dreams', label: 'Dreams' },
]

// The open tab lives in the URL hash so a refresh keeps you where you were.
function viewFromHash() {
  const hash = window.location.hash.slice(1)
  return VIEWS.some((v) => v.key === hash) ? hash : 'today'
}

let errorId = 0

function App() {
  const [view, setView] = useState(viewFromHash)
  const [errors, setErrors] = useState([])

  const [today, setToday] = useState(todayISO)
  const [date, setDate] = useState(today)
  const [month, setMonth] = useState(() => startOfMonth(today))

  useEffect(() => {
    const onHash = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Roll "today" over at midnight if the app is left open.
  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60_000)
    return () => clearInterval(id)
  }, [])

  const pushError = useCallback((message) => {
    const id = ++errorId
    setErrors((current) => [...current, { id, message }])
    setTimeout(() => setErrors((current) => current.filter((e) => e.id !== id)), 6000)
  }, [])

  const dismissError = useCallback((id) => {
    setErrors((current) => current.filter((e) => e.id !== id))
  }, [])

  const dreams = useTasks({ onError: pushError })
  const daily = useDailyTasks({ date, month, onError: pushError })

  const dreamCounts = useMemo(() => {
    const done = dreams.tasks.filter((t) => t.is_completed).length
    return { all: dreams.tasks.length, active: dreams.tasks.length - done, done }
  }, [dreams.tasks])

  const dayDone = daily.tasks.filter((t) => t.done).length

  const { reload: reloadDreams } = dreams
  function switchView(key) {
    window.history.pushState(null, '', `#${key}`)
    setView(key)
    // Linked-task counts may have changed while on the other tab.
    if (key === 'dreams') reloadDreams({ silent: true })
  }

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="page">
      <div className="sky" aria-hidden="true" />

      <main className={`shell ${view === 'today' ? 'shell--wide' : ''}`}>
        <header className="hero">
          <div className="hero__text">
            <p className="eyebrow">{todayLabel}</p>
            <h1>
              Manifester<span className="hero__dot">.</span>
            </h1>
            <p className="hero__tagline">Write it down. Show up daily. Watch it arrive.</p>
          </div>
          {view === 'dreams' ? (
            <ProgressRing done={dreamCounts.done} total={dreamCounts.all} label="manifested" />
          ) : (
            <ProgressRing done={dayDone} total={daily.tasks.length} label={date === today ? 'today' : 'done'} />
          )}
        </header>

        <nav className="view-tabs" role="tablist" aria-label="Sections">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={view === v.key}
              className={view === v.key ? 'is-active' : ''}
              onClick={() => switchView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </nav>

        {view === 'today' ? (
          <TodayView
            date={date}
            month={month}
            today={today}
            onSelectDate={setDate}
            onMonthChange={setMonth}
            daily={daily}
            dreams={dreams.tasks}
          />
        ) : (
          <DreamsView dreams={dreams} counts={dreamCounts} />
        )}

        <footer className="footer">
          Double-click anything to edit · Arrow keys move around the calendar
        </footer>
      </main>

      <Toasts
        errors={errors}
        onDismissError={dismissError}
        pendingDelete={dreams.pendingDelete}
        onUndo={dreams.undoDelete}
        undoWindowMs={dreams.undoWindowMs}
      />
    </div>
  )
}

export default App
