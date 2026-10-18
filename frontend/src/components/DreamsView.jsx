import { useMemo, useState } from 'react'
import { DreamForm } from './DreamForm.jsx'
import { DreamItem } from './DreamItem.jsx'
import { FilterTabs } from './FilterTabs.jsx'
import { SparkleIcon } from './Icons.jsx'

const EMPTY_COPY = {
  all: ['Your sky is clear', 'Write your first dream above. Say it like it is already yours.'],
  active: ['Everything has manifested', 'Every dream you wrote down is complete. Time to dream bigger.'],
  done: ['Nothing manifested yet', 'Tick a dream when it comes true and it will shine here.'],
}

export function DreamsView({ dreams, counts }) {
  const [filter, setFilter] = useState('all')
  const { tasks, status, loadError, reload, addTask, updateTask, removeTask } = dreams

  const visible = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.is_completed)
    if (filter === 'done') return tasks.filter((t) => t.is_completed)
    return tasks
  }, [tasks, filter])

  return (
    <>
      <DreamForm onAdd={addTask} />

      <section className="panel" aria-labelledby="dreams-heading">
        <div className="panel__head">
          <h2 id="dreams-heading">Your dreams</h2>
          <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        </div>

        {status === 'loading' && (
          <ul className="dreams" aria-busy="true" aria-label="Loading dreams">
            {[0, 1, 2].map((i) => (
              <li key={i} className="dream dream--skeleton">
                <span className="skeleton skeleton--circle" />
                <span className="skeleton skeleton--line" style={{ width: `${70 - i * 15}%` }} />
              </li>
            ))}
          </ul>
        )}

        {status === 'error' && (
          <div className="state">
            <h3>The universe isn't answering</h3>
            <p>{loadError}</p>
            <button type="button" className="button button--primary" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && visible.length === 0 && (
          <div className="state">
            <SparkleIcon width={32} height={32} className="state__icon" />
            <h3>{EMPTY_COPY[filter][0]}</h3>
            <p>{EMPTY_COPY[filter][1]}</p>
          </div>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="dreams">
            {visible.map((task) => (
              <DreamItem key={task.id} task={task} onUpdate={updateTask} onRemove={removeTask} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
