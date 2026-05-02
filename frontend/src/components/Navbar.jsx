import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CalendarDays, Ticket, LayoutDashboard, LogOut, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navLink = (to, label, icon) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
      }`}
    >
      {icon}
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <CalendarDays className="w-6 h-6" />
            EventBook
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/', 'Events', <CalendarDays className="w-4 h-4" />)}
            {isAuthenticated && navLink('/my-bookings', 'My Bookings', <Ticket className="w-4 h-4" />)}
            {isAdmin && navLink('/admin', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Hi, <span className="font-semibold text-gray-800">{user?.name}</span>
                  {isAdmin && <span className="ml-1.5 badge bg-indigo-100 text-indigo-700">Admin</span>}
                </span>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 text-sm">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-100 pt-3">
            {navLink('/', 'Events', <CalendarDays className="w-4 h-4" />)}
            {isAuthenticated && navLink('/my-bookings', 'My Bookings', <Ticket className="w-4 h-4" />)}
            {isAdmin && navLink('/admin', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="w-full btn-secondary flex items-center justify-center gap-2 text-sm">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center text-sm">Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
