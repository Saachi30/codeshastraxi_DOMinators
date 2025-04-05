import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">SecureVote</Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-blue-200">Home</Link>
            </li>
            <li>
              <Link to="/vote" className="hover:text-blue-200">Vote</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-blue-200">My Dashboard</Link>
            </li>
            <li>
              <Link to="/voice-assistant" className="hover:text-blue-200">Voice Assistant</Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-blue-200">Login</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;


