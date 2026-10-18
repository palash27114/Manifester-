import { useCallback, useEffect, useRef, useState } from 'react'
import { dailyTasksApi } from '../api/dailyTasks.js'
import { monthGrid } from '../utils/dates.js'

// Loads the selected day's tasks plus a done/total summary for every cell of the visible month.
export function useDailyTasks({ date, month, onError }) {
  const [tasks, setTasks] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [loadError, setLoadError] = useState('')
  const [summary, setSummary] = useState({}) // { 'YYYY-MM-DD': { total, done } }

  const onErrorRef = useRef(onError)
  const tasksRef = useRef(tasks)
  // The day currently on screen. Replies for any other day are dropped, otherwise a slow
  // response could overwrite the list after the user has already moved on.
  const dateRef = useRef(date)
  const monthRef = useRef(month)
  useEffect(() => {
    onErrorRef.current = onError
    tasksRef.current = tasks
  })

  const reportError = useCallback((error) => onErrorRef.current?.(error.message), [])

  const loadDay = useCallback(async (day) => {
    setStatus('loading')
    try {
      const result = await dailyTasksApi.forDate(day)
      if (dateRef.current !== day) return
      tasksRef.current = result
      setTasks(result)
      setStatus('ready')
    } catch (error) {
      if (dateRef.current !== day) return
      setLoadError(error.message)
      setStatus('error')
    }
  }, [])

  const loadSummary = useCallback(
    async (monthIso) => {
      const grid = monthGrid(monthIso)
      try {
        const rows = await dailyTasksApi.summary(grid[0], grid[grid.length - 1])
        if (monthRef.current !== monthIso) return
        setSummary(Object.fromEntries(rows.map((r) => [r.date, r])))
      } catch (error) {
        reportError(error)
      }
    },
    [reportError],
  )

  useEffect(() => {
    dateRef.current = date
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDay(date)
  }, [date, loadDay])

  useEffect(() => {
    monthRef.current = month
    // Fetch on month change; state is only set once the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSummary(month)
  }, [month, loadSummary])

  // Apply a change to the list for `day` (ignored if the user has switched days)
  // and keep that day's calendar cell in step without a refetch.
  const replaceTasks = useCallback((day, updater) => {
    if (dateRef.current !== day) return
    const next = updater(tasksRef.current)
    tasksRef.current = next
    setTasks(next)
    setSummary((current) => ({
      ...current,
      [day]: { date: day, total: next.length, done: next.filter((t) => t.done).length },
    }))
  }, [])

  const addTask = useCallback(
    async ({ title, kind, dreamId }) => {
      try {
        const task = await dailyTasksApi.create({ title, kind, date, dreamId })
        replaceTasks(date, (current) =>
          kind === 'daily'
            ? [...current.filter((t) => t.kind === 'daily'), task, ...current.filter((t) => t.kind !== 'daily')]
            : [...current, task],
        )
        // A new habit also shows up on every later day of the month.
        if (kind === 'daily') loadSummary(monthRef.current)
        return true
      } catch (error) {
        reportError(error)
        return false
      }
    },
    [date, replaceTasks, loadSummary, reportError],
  )

  // Optimistic tick; the server reply carries the recalculated streak.
  const toggleDone = useCallback(
    async (id) => {
      const task = tasksRef.current.find((t) => t.id === id)
      if (!task) return
      const done = !task.done
      replaceTasks(date, (current) => current.map((t) => (t.id === id ? { ...t, done } : t)))

      try {
        const saved = await dailyTasksApi.setDone(id, date, done)
        replaceTasks(date, (current) => current.map((t) => (t.id === id ? saved : t)))
      } catch (error) {
        replaceTasks(date, (current) => current.map((t) => (t.id === id ? task : t)))
        reportError(error)
      }
    },
    [date, replaceTasks, reportError],
  )

  const renameTask = useCallback(
    async (id, title) => {
      const task = tasksRef.current.find((t) => t.id === id)
      if (!task) return
      replaceTasks(date, (current) => current.map((t) => (t.id === id ? { ...t, title } : t)))

      try {
        const saved = await dailyTasksApi.update(id, { title }, date)
        replaceTasks(date, (current) => current.map((t) => (t.id === id ? saved : t)))
      } catch (error) {
        replaceTasks(date, (current) => current.map((t) => (t.id === id ? task : t)))
        reportError(error)
      }
    },
    [date, replaceTasks, reportError],
  )

  const removeTask = useCallback(
    async (id) => {
      const task = tasksRef.current.find((t) => t.id === id)
      if (!task) return
      replaceTasks(date, (current) => current.filter((t) => t.id !== id))

      try {
        await dailyTasksApi.remove(id)
        // A removed habit disappears from other days too.
        if (task.kind === 'daily') loadSummary(monthRef.current)
      } catch (error) {
        replaceTasks(date, (current) => [...current, task])
        reportError(error)
      }
    },
    [date, replaceTasks, loadSummary, reportError],
  )

  const reload = useCallback(() => loadDay(date), [date, loadDay])

  return {
    tasks,
    status,
    loadError,
    summary,
    reload,
    addTask,
    toggleDone,
    renameTask,
    removeTask,
  }
}
