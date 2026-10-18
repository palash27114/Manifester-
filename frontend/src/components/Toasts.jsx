import { XIcon } from './Icons.jsx'

export function Toasts({ errors, onDismissError, pendingDelete, onUndo, undoWindowMs }) {
  return (
    <div className="toasts" aria-live="polite">
      {pendingDelete && (
        <div className="toast" key={pendingDelete.task.id}>
          <span>Dream released</span>
          <button type="button" className="toast__action" onClick={onUndo}>
            Undo
          </button>
          <span className="toast__timer" style={{ animationDuration: `${undoWindowMs}ms` }} />
        </div>
      )}
      {errors.map((error) => (
        <div className="toast toast--error" key={error.id} role="alert">
          <span>{error.message}</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => onDismissError(error.id)}
            aria-label="Dismiss"
          >
            <XIcon width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
