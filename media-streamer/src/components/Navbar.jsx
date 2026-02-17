import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Media Streamer
        </Link>

        <div className="relative flex-1">
          <input
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            type="text"
            placeholder="Search videos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
          <Link
            to="/upload"
            className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-slate-400"
          >
            Upload
          </Link>
          <Link
            to="/profile"
            className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-slate-400"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}