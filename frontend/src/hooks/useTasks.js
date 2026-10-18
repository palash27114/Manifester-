import { useCallback, useEffect, useRef, useState } from 'react'
import { tasksApi } from '../api/tasks.js'
import { API_URL } from '../api/client.js'

const UNDO_WINDOW_MS = 5000

export function useTasks({ onError }) {
  const [tasks, setTasks] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [loadError, setLoadError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null) // { task, index }

  const deleteTimer = useRef(null)
  const onErrorRef = useRef(onError)
  const tasksRef = useRef(tasks)
  useEffect(() => {
    onErrorRef.current = onError
    tasksRef.current = tasks
  })

  const reportError = useCallback((error) => {
    onErrorRef.current?.(error.message)
  }, [])

  // A silent load refreshes in the background without showing the skeleton or error screen.
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setStatus('loading')
    try {
      setTasks(await tasksApi.list())
      setStatus('ready')
    } catch (error) {
      if (silent) return
      setLoadError(error.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    // Initial fetch on mount; load() updates state once the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const addTask = useCallback(
    async (dream) => {
      try {
        const task = await tasksApi.create(dream)
        setTasks((current) => [task, ...current])
        return true
      } catch (error) {
        reportError(error)
        return false
      }
    },
    [reportError],
  )

  // Optimistic: apply locally, roll back if the server rejects it.
  const updateTask = useCallback(
    async (id, changes) => {
      const previous = tasksRef.current.find((t) => t.id === id)
      setTasks((current) =>
        current.map((t) => (t.id === id ? { ...t, ...changes } : t)),
      )

      try {
        const saved = await tasksApi.update(id, changes)
        setTasks((current) => current.map((t) => (t.id === id ? { ...t, ...saved } : t)))
        return true
      } catch (error) {
        if (previous) {
          setTasks((current) => current.map((t) => (t.id === id ? previous : t)))
        }
        reportError(error)
        return false
      }
    },
    [reportError],
  )

  const commitDelete = useCallback(
    async (entry) => {
      try {
        await tasksApi.remove(entry.task.id)
      } catch (error) {
        // Put it back where it was so nothing silently disappears.
        setTasks((current) => {
          const next = [...current]
          next.splice(Math.min(entry.index, next.length), 0, entry.task)
          return next
        })
        reportError(error)
      }
    },
    [reportError],
  )

  // Hide immediately, delete on the server after the undo window closes.
  const removeTask = useCallback(
    (id) => {
      const index = tasks.findIndex((t) => t.id === id)
      if (index === -1) return

      // Only one undo at a time: finalise any earlier pending delete now.
      if (pendingDelete) {
        clearTimeout(deleteTimer.current)
        commitDelete(pendingDelete)
      }

      const entry = { task: tasks[index], index }
      setTasks((current) => current.filter((t) => t.id !== id))
      setPendingDelete(entry)

      deleteTimer.current = setTimeout(() => {
        setPendingDelete(null)
        commitDelete(entry)
      }, UNDO_WINDOW_MS)
    },
    [tasks, pendingDelete, commitDelete],
  )

  const undoDelete = useCallback(() => {
    if (!pendingDelete) return
    clearTimeout(deleteTimer.current)
    const { task, index } = pendingDelete
    setTasks((current) => {
      const next = [...current]
      next.splice(Math.min(index, next.length), 0, task)
      return next
    })
    setPendingDelete(null)
  }, [pendingDelete])

  // If the tab closes mid-undo, still send the delete.
  useEffect(() => {
    if (!pendingDelete) return
    const flush = () => {
      fetch(`${API_URL}/tasks/${pendingDelete.task.id}`, {
        method: 'DELETE',
        keepalive: true,
      })
    }
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [pendingDelete])

  return {
    tasks,
    status,
    loadError,
    reload: load,
    addTask,
    updateTask,
    removeTask,
    pendingDelete,
    undoDelete,
    undoWindowMs: UNDO_WINDOW_MS,
  }
}
