import { useState, useEffect } from 'react'
import { bookingService } from '../services'
import { format } from 'date-fns'
import { Ticket, MapPin, Calendar, X, Loader2, QrCode, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [qrModal, setQrModal] = useState(null)

  useEffect(() => {
    bookingService.getMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(bookingId)
    try {
      const { data } = await bookingService.cancel(bookingId)
      setBookings(bookings.map(b => b.id === bookingId ? data : b))
      toast.success('Booking cancelled successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-indigo-600" /> My Bookings
        </h1>
        <p className="text-gray-500 mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24 card">
          <Ticket className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No bookings yet</h3>
          <p className="text-gray-400 mt-1">Start exploring events to make your first booking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{booking.eventTitle}</h3>
                    <span className={`badge ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'CONFIRMED'
                        ? <><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</>
                        : <><XCircle className="w-3 h-3 mr-1" /> Cancelled</>
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {format(new Date(booking.eventDate), 'dd MMM yyyy, h:mm a')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {booking.eventLocation}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-indigo-400" />
                      {booking.tickets} ticket{booking.tickets !== 1 ? 's' : ''}
                    </div>
                    <div className="font-semibold text-indigo-600">
                      Total: ₹{Number(booking.totalPrice).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Booking #{booking.id} · Booked on {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {booking.qrCode && booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setQrModal(booking)}
                      className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3"
                    >
                      <QrCode className="w-4 h-4" /> QR Code
                    </button>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="btn-danger text-sm flex items-center gap-1.5 py-1.5 px-3"
                    >
                      {cancelling === booking.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <X className="w-4 h-4" />
                      }
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-xl mb-1">{qrModal.eventTitle}</h3>
            <p className="text-gray-500 text-sm mb-5">Show this QR code at the event entrance</p>
            <img src={qrModal.qrCode} alt="QR Code" className="mx-auto w-56 h-56 rounded-lg border border-gray-200" />
            <p className="text-xs text-gray-400 mt-4">Booking #{qrModal.id}</p>
            <button
              onClick={() => setQrModal(null)}
              className="btn-primary mt-5 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
