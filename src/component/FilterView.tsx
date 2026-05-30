'use client'

import { memo } from 'react'

interface ColorOption {
  color: string
  count: number
}

interface FilterViewProps {
  colorOptions: ColorOption[]
  selectedColors: Set<string>
  onToggleColor: (color: string) => void
}

export default memo(function FilterView({ colorOptions, selectedColors, onToggleColor }: FilterViewProps) {
  return (
    <aside className="shopSidebar" aria-label="Filters">
      <div className="filterCard">
        <h2 className="filterTitle">Filter by</h2>
        <div className="filterList" role="group" aria-label="Filter by color">
          {colorOptions.map(({ color, count }) => (
            <label key={color} className="filterItem">
              <input
                type="checkbox"
                checked={selectedColors.has(color)}
                onChange={() => onToggleColor(color)}
              />
              <span className="filterColor">{color}</span>
              <span className="filterCount">({count})</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
})
