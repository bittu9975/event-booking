import { useState, useEffect, useCallback } from 'react'
import { eventService } from '../services'
import EventCard from '../components/EventCard'
import { Search, SlidersHorizontal, Loader2, CalendarX } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Sports', 'Entertainment']

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        size: 9,
        ...(search && { search }),
        ...(category !== 'All' && { category }),
      }
      const { data } = await eventService.getAll(params)
      setEvents(data.content)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [search, category, page])

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300)
    return () => clearTimeout(timer)
  }, [fetchEvents])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(0)
  }

  const handleCategory = (cat) => {
    setCategory(cat)
    setPage(0)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Discover & Book Amazing Events
          </h1>
          <p className="text-indigo-100 text-lg mb-8">
            Concerts, conferences, workshops, and more — all in one place.
          </p>
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search events, cities…"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <CalendarX className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No events found</h3>
            <p className="text-gray-400 mt-1">Try different keywords or categories</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{events.length} events found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
