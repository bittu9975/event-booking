import { useState, useEffect } from 'react'
import { adminService, eventService } from '../services'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import {
  Users, CalendarDays, Ticket, TrendingUp, Plus, Pencil, Trash2,
  Loader2, X, ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

const EMPTY_EVENT = {
  title: '', description: '', date: '', location: '',
  price: '', totalSeats: '', imageUrl: '', category: 'Technology'
}

const CATEGORIES = ['Technology', 'Music', 'Business', 'Sports', 'Entertainment']

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({
  totalUsers: 0,
  totalEvents: 0,
  totalBookings: 0,
  activeBookings: 0,
  totalRevenue: 0,
  bookingsByMonth: [],
  topEvents: [],
  revenueByCategory: []
})
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [formData, setFormData] = useState(EMPTY_EVENT)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      eventService.getAll({ size: 100 }),
      adminService.getAllBookings(),
    ]).then(([statsRes, eventsRes, bookingsRes]) => {
      setStats(prev => ({ ...prev, ...statsRes.data }))
      setEvents(eventsRes.data.content)
      setBookings(bookingsRes.data)
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setFormData(EMPTY_EVENT); setEditId(null); setModal('event') }
  const openEdit = (ev) => {
    setFormData({
      title: ev.title, description: ev.description,
      date: ev.date?.slice(0, 16), location: ev.location,
      price: ev.price, totalSeats: ev.totalSeats,
      imageUrl: ev.imageUrl || '', category: ev.category
    })
    setEditId(ev.id)
    setModal('event')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...formData, price: Number(formData.price), totalSeats: Number(formData.totalSeats) }
      if (editId) {
        const { data } = await eventService.update(editId, payload)
        setEvents(events.map(ev => ev.id === editId ? data : ev))
        toast.success('Event updated!')
      } else {
        const { data } = await eventService.create(payload)
        setEvents([data, ...events])
        toast.success('Event created!')
      }
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await eventService.delete(id)
      setEvents(events.filter(ev => ev.id !== id))
      toast.success('Event deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  )

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Events', value: stats?.totalEvents, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Bookings', value: stats?.activeBookings, icon: Ticket, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: `₹${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Manage events, bookings, and track performance</p>
        </div>
        {tab === 'events' && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {['overview', 'events', 'bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Bookings Bar Chart */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Bookings (This Year)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.bookingsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Category Pie */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.revenueByCategory || []}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(stats.revenueByCategory || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Events */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Events by Bookings</h3>
            <div className="space-y-3">
              {(stats.topEvents || []).map((ev, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{ev.title}</div>
                    <div className="text-xs text-gray-400">{ev.category}</div>
                  </div>
                  <span className="badge bg-indigo-100 text-indigo-700">{ev.bookings} bookings</span>
                </div>
              ))}
              {(!stats?.topEvents || stats.topEvents.length === 0) && (
                <p className="text-gray-400 text-sm">No booking data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Event', 'Date', 'Location', 'Price', 'Seats', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate">{ev.title}</div>
                    <div className="text-xs text-indigo-600">{ev.category}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {format(new Date(ev.date), 'dd MMM yyyy')}
                  </td>
                  <td className="py-3 px-4 text-gray-500 max-w-[150px] truncate">{ev.location}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {ev.price === 0 ? 'FREE' : `₹${Number(ev.price).toLocaleString()}`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium ${ev.availableSeats === 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {ev.availableSeats}/{ev.totalSeats}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(ev)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No events found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {tab === 'bookings' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'User', 'Event', 'Tickets', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-400 font-mono">#{b.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800">{b.userName}</div>
                    <div className="text-xs text-gray-400">{b.userEmail}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-[180px] truncate">{b.eventTitle}</td>
                  <td className="py-3 px-4 text-gray-600">{b.tickets}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">₹{Number(b.totalPrice).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                    {format(new Date(b.createdAt), 'dd MMM yyyy')}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Event Modal ── */}
      {modal === 'event' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Event' : 'Create Event'}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required className="input-field" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className="input-field resize-none" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                  <input required type="datetime-local" className="input-field" value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required className="input-field" value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input required className="input-field" value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" className="input-field" value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
                  <input required type="number" min="1" className="input-field" value={formData.totalSeats}
                    onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" className="input-field" placeholder="https://…" value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
