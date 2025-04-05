import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';
import Header from '../components/Header';

const VotingDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { elections, loadElections, setCurrentElection } = useVoting();
  const [filter, setFilter] = useState('all');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Define these functions before they are used
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Simple haversine formula to calculate distance between two points
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };
  
  useEffect(() => {
    // Get user's location for geo-fenced voting
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
    
    // Load available elections
    loadElections().then(() => {
      setLoading(false);
    });
  }, [loadElections]);
  
  // Filter elections based on geo-fencing and other criteria
  const filteredElections = elections.filter(election => {
    if (filter === 'all') return true;
    if (filter === 'active' && election.status === 'active') return true;
    if (filter === 'upcoming' && election.status === 'upcoming') return true;
    if (filter === 'past' && election.status === 'completed') return true;
    return false;
  }).filter(election => {
    // Apply geo-fencing if location is available and election has geo restrictions
    if (location && election.geoFenced) {
      // Simple distance calculation (can be replaced with more precise algorithm)
      const distance = calculateDistance(
        location.latitude, 
        location.longitude,
        election.geoFence.latitude,
        election.geoFence.longitude
      );
      return distance <= election.geoFence.radiusKm;
    }
    return true;
  });
  
  const handleElectionSelect = (election) => {
    setCurrentElection(election);
    navigate(`/vote/${election.id}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const getVotingMethodIcon = (method) => {
    switch(method) {
      case 'approval': return '✓';
      case 'ranked': return '🔢';
      case 'quadratic': return '🧮';
      case 'community': return '🌐';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-white text-xl">Loading available elections...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      {/* <Header /> */}
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Available Elections</h1>
          <p className="text-blue-200 mb-6">Select an election to cast your vote or view results</p>
          
          {location ? (
            <div className="text-white/80 text-sm mb-4">
              Your location verified! You'll see all elections available in your area.
            </div>
          ) : (
            <div className="text-yellow-300 text-sm mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Location access required for geo-fenced elections
            </div>
          )}
          
          <div className="mb-6 flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-white/80'}`}
            >
              All Elections
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-800/50 text-white/80'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-full ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-white/80'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-full ${filter === 'past' ? 'bg-gray-600 text-white' : 'bg-gray-800/50 text-white/80'}`}
            >
              Past
            </button>
          </div>
          
          {filteredElections.length === 0 ? (
            <div className="text-center p-8 text-white/70">
              No elections available for your current criteria or location.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElections.map((election) => (
                <motion.div
                  key={election.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleElectionSelect(election)}
                  className="bg-white/20 backdrop-blur-md rounded-lg overflow-hidden shadow-lg cursor-pointer"
                >
                  <div className="h-32 bg-gradient-to-r from-blue-600 to-violet-600 relative">
                    {election.geoFenced && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-xs text-black font-bold px-2 py-1 rounded-full">
                        Geo-fenced
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/30 p-3">
                      <div className="text-lg font-medium text-white">{election.title}</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(election.status)}`}>
                        {election.status.toUpperCase()}
                      </div>
                      <div className="text-white font-medium text-sm flex items-center">
                        <span className="mr-1">{getVotingMethodIcon(election.votingMethod)}</span>
                        {election.votingMethod.charAt(0).toUpperCase() + election.votingMethod.slice(1)}
                      </div>
                    </div>
                    
                    <p className="text-blue-100 text-sm mb-3">{election.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-white/70">
                      <div>Ends: {new Date(election.endDate).toLocaleDateString()}</div>
                      <div>{election.participants} participants</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VotingDashboard;