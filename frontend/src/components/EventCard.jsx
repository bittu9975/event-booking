import { Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Tag } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORY_COLORS = {
  Technology:   'bg-blue-100 text-blue-700',
  Music:        'bg-purple-100 text-purple-700',
  Business:     'bg-green-100 text-green-700',
  Sports:       'bg-orange-100 text-orange-700',
  Entertainment:'bg-pink-100 text-pink-700',
  default:      'bg-gray-100 text-gray-700',
}

export default function EventCard({ event }) {
  const categoryStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default
  const isSoldOut = event.availableSeats === 0

  return (
    <div className="card group hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`badge ${categoryStyle} shadow-sm`}>
            <Tag className="w-3 h-3 mr-1" />{event.category}
          </span>
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-sm tracking-wide">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{event.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            {format(new Date(event.date), 'dd MMM yyyy, h:mm a')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            {isSoldOut
              ? <span className="text-red-500 font-medium">Sold Out</span>
              : <span>{event.availableSeats} seats left</span>
            }
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {event.price === 0
              ? <span className="text-green-600 font-bold text-lg">FREE</span>
              : <span className="text-indigo-600 font-bold text-lg">₹{Number(event.price).toLocaleString()}</span>
            }
            <span className="text-gray-400 text-xs ml-1">/ ticket</span>
          </div>
          <Link
            to={`/events/${event.id}`}
            className={`btn-primary text-sm py-1.5 px-4 ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isSoldOut ? 'Sold Out' : 'Book Now'}
          </Link>
        </div>
      </div>
    </div>
  )
}
