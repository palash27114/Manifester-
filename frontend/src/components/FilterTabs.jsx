const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Manifesting' },
  { key: 'done', label: 'Manifested' },
]

export function FilterTabs({ value, onChange, counts }) {
  return (
    <div className="tabs" role="tablist" aria-label="Filter dreams">
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          type="button"
          role="tab"
          aria-selected={value === filter.key}
          className={`tabs__tab ${value === filter.key ? 'is-active' : ''}`}
          onClick={() => onChange(filter.key)}
        >
          {filter.label}
          <span className="tabs__count">{counts[filter.key]}</span>
        </button>
      ))}
    </div>
  )
}
