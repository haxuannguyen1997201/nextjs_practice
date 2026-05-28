'use client';

import Link from 'next/link';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export default function Toolbar({ search, onSearchChange, onReset }: ToolbarProps) {
  return (
    <div className="shopToolbar">
      <label className="shopSearch">
        <span className="shopSearchLabel">Search:</span>
        <input
          className="shopSearchInput"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
        />
      </label>
      <button type="button" className="shopReset" onClick={onReset}>
        Reset
      </button>
      <Link href="/add" className="primaryButton shopAddButton">
        Add product
      </Link>
    </div>
  );
}
