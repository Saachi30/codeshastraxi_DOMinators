import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-opacity-95 bg-blue-900 backdrop-filter backdrop-blur-sm shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-500 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            VoteChain
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`transition duration-300 ${isActive('/') ? 'text-blue-300 font-medium' : 'text-gray-200 hover:text-blue-300'}`}
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={`transition duration-300 ${isActive('/dashboard') ? 'text-blue-300 font-medium' : 'text-gray-200 hover:text-blue-300'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/analytics" 
                className={`transition duration-300 ${isActive('/analytics') ? 'text-blue-300 font-medium' : 'text-gray-200 hover:text-blue-300'}`}
              >
                Analytics
              </Link>
              {user?.isAdmin && (
                <Link 
                  to="/admin" 
                  className={`transition duration-300 ${isActive('/admin') ? 'text-blue-300 font-medium' : 'text-gray-200 hover:text-blue-300'}`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Buttons or User Menu */}
        <div className="hidden md:block">
          {!isAuthenticated ? (
            <Link 
              to="/auth" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 bg-blue-800 bg-opacity-50 px-3 py-1.5 rounded-full hover:bg-opacity-70 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-blue-900 bg-opacity-95 backdrop-filter backdrop-blur-sm rounded-lg shadow-xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-blue-800">
                    <p className="text-sm text-gray-300">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-blue-800 transition">Profile</Link>
                  <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-blue-800 transition">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-blue-900 bg-opacity-95 backdrop-filter backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <Link to="/" className="block py-2 hover:bg-blue-800 rounded px-3 transition" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 hover:bg-blue-800 rounded px-3 transition" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/analytics" className="block py-2 hover:bg-blue-800 rounded px-3 transition" onClick={() => setIsMenuOpen(false)}>
                  Analytics
                </Link>
                {user?.isAdmin && (
                  <Link to="/admin" className="block py-2 hover:bg-blue-800 rounded px-3 transition" onClick={() => setIsMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="w-full text-left block py-2 text-red-400 hover:bg-blue-800 rounded px-3 transition">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="block py-2 hover:bg-blue-800 rounded px-3 transition" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;