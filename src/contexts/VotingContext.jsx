import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useWeb3 } from './Web3Context';

const VotingContext = createContext();

export const useVoting = () => useContext(VotingContext);

export const VotingProvider = ({ children }) => {
  const { web3, account } = useWeb3();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVote, setCurrentVote] = useState(null);
  const [votingHistory, setVotingHistory] = useState([]);
  const [sentiment, setSentiment] = useState({});
  const [currentElection, setCurrentElection] = useState(null);
  
  // Memoize loadElections to prevent recreation on each render
  const loadElections = useCallback(async () => {
    setLoading(true);
    
    // Mock data - in a real app this would come from smart contracts
    const mockElections = [
      {
        id: 'election-1',
        title: 'City Council Election 2025',
        description: 'Vote for your preferred city council candidate',
        votingMethod: 'ranked',
        status: 'active',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        participants: 156,
        candidates: [ // Renamed from options to candidates to match component usage
          { id: 1, name: 'Alice Johnson', description: 'Environmental focus' },
          { id: 2, name: 'Bob Smith', description: 'Economic development' },
          { id: 3, name: 'Carol Davis', description: 'Public safety' },
          { id: 4, name: 'David Wilson', description: 'Education reform' }
        ],
        geoFenced: true,
        geoFence: {
          latitude: 40.7128,
          longitude: -74.0060,
          radiusKm: 50
        }
      },
      {
        id: 'election-2',
        title: 'Community Budget Allocation',
        description: 'Decide how to allocate the community budget',
        votingMethod: 'quadratic',
        status: 'upcoming',
        startDate: '2025-02-01',
        endDate: '2025-02-15',
        participants: 89,
        candidates: [ // Renamed from options to candidates
          { id: 1, name: 'Park Renovation', description: 'Upgrade local parks' },
          { id: 2, name: 'Road Improvements', description: 'Fix potholes and repave roads' },
          { id: 3, name: 'Public Library Funding', description: 'Increase library resources' },
          { id: 4, name: 'Community Center', description: 'Build new community center' }
        ],
        totalCredits: 16,
        geoFenced: false
      },
      {
        id: 'election-3',
        title: 'Policy Proposal Approval',
        description: 'Approve or disapprove new community policies',
        votingMethod: 'approval',
        status: 'completed',
        startDate: '2025-03-01',
        endDate: '2025-03-15',
        participants: 234,
        candidates: [ // Renamed from options to candidates
          { id: 1, name: 'Increase Recycling Programs', description: 'Expand recycling initiatives' },
          { id: 2, name: 'Bike Lane Expansion', description: 'Add bike lanes to major roads' },
          { id: 3, name: 'Street Light Upgrades', description: 'Convert to energy-efficient lighting' },
          { id: 4, name: 'Public WiFi', description: 'Install free WiFi in public spaces' }
        ],
        geoFenced: false
      }
    ];
    
    setElections(mockElections);
    setLoading(false);
    return mockElections;
  }, []);
  
  // Add a fetchElection function that VoteCasting component is trying to use
  const fetchElection = useCallback((electionId) => {
    const election = elections.find(e => e.id === electionId);
    return Promise.resolve(election || null);
  }, [elections]);
  
  const fetchVotingHistory = useCallback(async (userAccount) => {
    // This would fetch from blockchain in real implementation
    // Using mock data for demo
    const mockHistory = [
      {
        electionId: 'past-election-1',
        title: 'Previous City Budget',
        method: 'quadratic',
        timestamp: '2024-11-15T12:00:00Z',
        votes: [
          { optionId: 1, label: 'Parks', votes: 2 },
          { optionId: 3, label: 'Infrastructure', votes: 3 }
        ],
        certificate: {
          id: 'cert-1234',
          transactionHash: '0x1234...'
        }
      }
    ];
    
    setVotingHistory(mockHistory);
  }, []);
  
  useEffect(() => {
    // Load elections once when component mounts
    loadElections();
    
    // Fetch user's voting history if user is connected
    if (account) {
      fetchVotingHistory(account);
    }
  }, [account, loadElections, fetchVotingHistory]); // Include the memoized functions
  
  // Cast vote based on voting method
  const castVote = useCallback(async (electionId, voteData) => {
    setLoading(true);
    
    try {
      // This would call your smart contract to record vote
      // For demo purposes, we'll just simulate a successful vote
      
      const election = elections.find(e => e.id === electionId);
      
      if (!election) {
        throw new Error("Election not found");
      }
      
      // Create a vote record - would be stored on blockchain in real app
      const voteRecord = {
        electionId,
        title: election.title,
        method: election.votingMethod,
        timestamp: new Date().toISOString(),
        votes: mapVoteDataToRecord(election.votingMethod, voteData),
        status: 'confirmed'
      };
      
      // Update sentiment data (for analytics)
      updateSentiment(electionId, voteData);
      
      // Store the current vote for confirmation page
      setCurrentVote(voteRecord);
      
      // Update voting history
      setVotingHistory(prev => [...prev, voteRecord]);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error casting vote:", error);
      setLoading(false);
      return false;
    }
  }, [elections]);
  
  // Map vote data to correct format based on voting method
  const mapVoteDataToRecord = (method, voteData) => {
    switch (method) {
      case 'approval':
        // For approval voting, voteData is an array of selected option IDs
        return voteData.map(optionId => ({ optionId, approved: true }));
        
      case 'ranked':
        // For ranked-choice, voteData is an object mapping optionId to rank
        return Object.entries(voteData).map(([optionId, rank]) => ({
          optionId: parseInt(optionId),
          rank
        }));
        
      case 'quadratic':
        // For quadratic, voteData is an object mapping optionId to vote count
        return Object.entries(voteData).map(([optionId, votes]) => ({
          optionId: parseInt(optionId),
          votes
        }));
        
      default:
        return [];
    }
  };
  
  // Update sentiment data for analytics
  const updateSentiment = useCallback((electionId, voteData) => {
    // In a real app, this would be more sophisticated
    // For demo purposes, we'll just track simple metrics
    
    setSentiment(prev => {
      const electionSentiment = prev[electionId] || {
        participationCount: 0,
        approvalRates: {},
        averageAllocation: {}
      };
      
      // Update metrics based on vote data
      const updatedSentiment = {
        ...electionSentiment,
        participationCount: electionSentiment.participationCount + 1
      };
      
      return {
        ...prev,
        [electionId]: updatedSentiment
      };
    });
  }, []);
  
  // Check if user is eligible to vote in given election (geo-fencing)
  const isEligibleForElection = useCallback((election, userLocation) => {
    // If no geo restrictions, everyone is eligible
    if (!election.geoFenced) {
      return true;
    }
    
    // Check if user's location matches any of the allowed regions
    // This is a simplified check - real implementation would be more complex
    if (!userLocation) return false;
    
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      election.geoFence.latitude,
      election.geoFence.longitude
    ) <= election.geoFence.radiusKm;
  }, []);
  
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
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Detect anomalies in voting patterns (for admin)
  const detectAnomalies = useCallback(() => {
    // This would implement sophisticated anomaly detection
    // For demo purposes, we'll return some mock data
    
    return [
      {
        electionId: 'election-1',
        description: 'Unusual voting pattern detected - high concentration from single IP range',
        severity: 'medium',
        timestamp: new Date().toISOString()
      },
      {
        electionId: 'election-2',
        description: 'Potential duplicate voting attempts blocked',
        severity: 'high',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }, []);
  
  const value = {
    elections,
    loading,
    currentVote,
    votingHistory,
    sentiment,
    loadElections,
    fetchElection, // Added the missing function
    castVote,
    isEligibleForElection,
    detectAnomalies,
    setCurrentElection,
    currentElection
  };
  
  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
};