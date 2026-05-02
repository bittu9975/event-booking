import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventService, bookingService } from '../services'
import { useAuth } from '../context/AuthContext'
import { MapPin, Calendar, Users, Tag, Minus, Plus, Loader2, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState(1)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    eventService.getById(id)
      .then(({ data }) => setEvent(data))
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book tickets')
      navigate('/login')
      return
    }
    setBooking(true)
    try {
      await bookingService.create({ eventId: event.id, tickets })
      toast.success('🎉 Booking confirmed! Check your email.')
      navigate('/my-bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  )

  if (!event) return (
    <div className="text-center py-24 text-gray-500">Event not found.</div>
  )

  const totalPrice = (event.price * tickets).toFixed(2)
  const isSoldOut = event.availableSeats === 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <img
              src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                <span className="badge bg-indigo-100 text-indigo-700 shrink-0">
                  <Tag className="w-3 h-3 mr-1" />{event.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{format(new Date(event.date), 'EEEE, dd MMMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{format(new Date(event.date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">
                    {isSoldOut
                      ? <span className="text-red-500 font-medium">Sold Out</span>
                      : `${event.availableSeats} of ${event.totalSeats} seats available`
                    }
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h2 className="font-semibold text-gray-900 mb-2">About this event</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 mb-1">Book Tickets</h2>
            <p className="text-sm text-gray-500 mb-5">Secure your spot today</p>

            <div className="text-3xl font-extrabold text-indigo-600 mb-5">
              {event.price === 0 ? 'FREE' : `₹${Number(event.price).toLocaleString()}`}
              <span className="text-sm font-normal text-gray-400 ml-1">/ ticket</span>
            </div>

            {/* Ticket selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Tickets</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTickets(Math.max(1, tickets - 1))}
                  disabled={tickets <= 1}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-indigo-400 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center">{tickets}</span>
                <button
                  onClick={() => setTickets(Math.min(event.availableSeats, 10, tickets + 1))}
                  disabled={tickets >= Math.min(event.availableSeats, 10)}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-indigo-400 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Max 10 tickets per booking</p>
            </div>

            {/* Price breakdown */}
            {event.price > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-5 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>₹{Number(event.price).toLocaleString()} × {tickets}</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-indigo-600">₹{Number(totalPrice).toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={booking || isSoldOut}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              {booking
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                : isSoldOut
                  ? 'Sold Out'
                  : `Confirm Booking`
              }
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              QR code & confirmation sent to your email
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
