import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '../contexts/VotingContext';

const AdminDispute = () => {
  const { user, isAuthenticated } = useAuth();
  const { getDisputedVotes, resolveDispute } = useVoting();
  const navigate = useNavigate();
  
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');

  // Anomaly statistics
  const [anomalyStats, setAnomalyStats] = useState({
    deepfakes: 12,
    irregularVotes: 28,
    locationMismatches: 7,
    multipleAttempts: 19,
    total: 66
  });

  // Mock dispute data for demonstration
  useEffect(() => {
    // Check if user is admin
    if (isAuthenticated && !user?.isAdmin) {
      navigate('/dashboard');
      return;
    }

    // Simulated API call to get disputed votes
    const fetchDisputedVotes = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would come from getDisputedVotes()
        const mockDisputes = [
          {
            id: 'disp_001',
            electionId: 'elec_2023_city',
            userId: 'user_8732',
            userName: 'Alex Thompson',
            timestamp: new Date('2025-04-04T14:23:16'),
            type: 'deepfake_attempt',
            status: 'pending',
            details: 'Face recognition system detected potential deepfake. Confidence: 78%',
            evidence: {
              faceScanConfidence: 78,
              ipLocation: 'Chicago, IL',
              deviceFingerprint: 'Unusual device pattern',
              previousAttempts: 2
            },
            priority: 'high'
          },
          {
            id: 'disp_002',
            electionId: 'elec_2023_city',
            userId: 'user_5421',
            userName: 'Morgan Chen',
            timestamp: new Date('2025-04-04T15:12:45'),
            type: 'geo_mismatch',
            status: 'pending',
            details: 'Users registered location (New York) does not match voting IP (Los Angeles)',
            evidence: {
              registeredLocation: 'New York, NY',
              votingIpLocation: 'Los Angeles, CA',
              distanceMismatch: '2,789 miles'
            },
            priority: 'medium'
          },
          {
            id: 'disp_003',
            electionId: 'elec_2023_city',
            userId: 'user_2198',
            userName: 'Jordan Rivera',
            timestamp: new Date('2025-04-03T09:47:32'),
            type: 'multiple_votes',
            status: 'resolved',
            resolution: 'Legitimate dual voting - user has properties in both districts',
            details: 'System detected votes cast in multiple district elections',
            evidence: {
              elections: ['District 5 Proposal', 'District 8 Council'],
              propertiesVerified: true
            },
            priority: 'low'
          },
          {
            id: 'disp_004',
            electionId: 'elec_2023_state',
            userId: 'user_9127',
            userName: 'Taylor Wilson',
            timestamp: new Date('2025-04-02T11:33:18'),
            type: 'authentication_failure',
            status: 'pending',
            details: 'Multiple failed biometric authentication attempts followed by SMS bypass',
            evidence: {
              failedAttempts: 5,
              biometricScore: 82, // Below threshold
              smsVerified: true
            },
            priority: 'high'
          },
          {
            id: 'disp_005',
            electionId: 'elec_2023_state',
            userId: 'user_6349',
            userName: 'Sam Johnson',
            timestamp: new Date('2025-04-04T16:05:22'),
            type: 'smart_contract_trigger',
            status: 'pending',
            details: 'Anomaly detected in voting pattern - quadratic voting distribution unusual',
            evidence: {
              votingPattern: 'Concentrated all points on single option',
              statisticalDeviation: '3.8 sigma from mean',
              previousBehavior: 'First-time voter'
            },
            priority: 'medium'
          }
        ];

        setDisputes(mockDisputes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching disputes:', error);
        setLoading(false);
      }
    };

    fetchDisputedVotes();
  }, [isAuthenticated, user, navigate, getDisputedVotes]);

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolution) return;

    try {
      // In a real implementation, this would call resolveDispute()
      console.log(`Resolving dispute ${selectedDispute.id} with resolution: ${resolution}`);

      // Update disputes list
      setDisputes(disputes.map(dispute => 
        dispute.id === selectedDispute.id 
          ? { ...dispute, status: 'resolved', resolution } 
          : dispute
      ));

      // Clear selection
      setSelectedDispute(null);
      setResolution('');
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const getFilteredDisputes = () => {
    switch (activeFilter) {
      case 'pending':
        return disputes.filter(dispute => dispute.status === 'pending');
      case 'resolved':
        return disputes.filter(dispute => dispute.status === 'resolved');
      case 'high_priority':
        return disputes.filter(dispute => dispute.priority === 'high');
      default:
        return disputes;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="bg-blue-800 bg-opacity-20 rounded-xl shadow-2xl p-6 backdrop-filter backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dispute Resolution
          </h1>
          <p className="text-blue-200 mb-8">
            Review and resolve disputes flagged by our smart contract system
          </p>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium text-sm uppercase tracking-wider">Total Anomalies</h3>
              <p className="text-white text-2xl font-bold">{anomalyStats.total}</p>
              <div className="flex items-center mt-2">
                <span className="text-red-400 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  12% from last election
                </span>
              </div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium text-sm uppercase tracking-wider">Deepfakes</h3>
              <p className="text-white text-2xl font-bold">{anomalyStats.deepfakes}</p>
              <div className="w-full bg-blue-800 rounded-full h-1.5 mt-2">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(anomalyStats.deepfakes/anomalyStats.total*100).toFixed(0)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium text-sm uppercase tracking-wider">Irregular Votes</h3>
              <p className="text-white text-2xl font-bold">{anomalyStats.irregularVotes}</p>
              <div className="w-full bg-blue-800 rounded-full h-1.5 mt-2">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(anomalyStats.irregularVotes/anomalyStats.total*100).toFixed(0)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium text-sm uppercase tracking-wider">Location Mismatch</h3>
              <p className="text-white text-2xl font-bold">{anomalyStats.locationMismatches}</p>
              <div className="w-full bg-blue-800 rounded-full h-1.5 mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(anomalyStats.locationMismatches/anomalyStats.total*100).toFixed(0)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium text-sm uppercase tracking-wider">Multiple Attempts</h3>
              <p className="text-white text-2xl font-bold">{anomalyStats.multipleAttempts}</p>
              <div className="w-full bg-blue-800 rounded-full h-1.5 mt-2">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(anomalyStats.multipleAttempts/anomalyStats.total*100).toFixed(0)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center mb-6 gap-2">
            <span className="text-blue-200">Filter:</span>
            <button 
              className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-blue-900 bg-opacity-50 text-blue-200 hover:bg-opacity-70'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-blue-900 bg-opacity-50 text-blue-200 hover:bg-opacity-70'}`}
              onClick={() => setActiveFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'resolved' ? 'bg-blue-600 text-white' : 'bg-blue-900 bg-opacity-50 text-blue-200 hover:bg-opacity-70'}`}
              onClick={() => setActiveFilter('resolved')}
            >
              Resolved
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'high_priority' ? 'bg-blue-600 text-white' : 'bg-blue-900 bg-opacity-50 text-blue-200 hover:bg-opacity-70'}`}
              onClick={() => setActiveFilter('high_priority')}
            >
              High Priority
            </button>
          </div>

          {/* Main Content Area - Disputes List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Disputes List */}
            <div className="lg:col-span-1 overflow-hidden">
              <div className="bg-blue-900 bg-opacity-30 rounded-lg h-[600px] overflow-y-auto">
                <h2 className="p-4 border-b border-blue-800 text-lg font-semibold text-white">
                  Disputes {activeFilter !== 'all' && `(${activeFilter})`}
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
                  </div>
                ) : getFilteredDisputes().length === 0 ? (
                  <div className="p-6 text-center text-blue-300">
                    No disputes found matching the current filter.
                  </div>
                ) : (
                  <ul>
                    {getFilteredDisputes().map(dispute => (
                      <li 
                        key={dispute.id}
                        className={`border-b border-blue-800 hover:bg-blue-800 hover:bg-opacity-40 transition cursor-pointer ${selectedDispute?.id === dispute.id ? 'bg-blue-700 bg-opacity-50' : ''}`}
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-block px-2 py-1 text-xs rounded-full mb-2 mr-2 font-medium uppercase tracking-wide bg-blue-900 text-blue-300">
                                {dispute.type.replace(/_/g, ' ')}
                              </span>
                              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(dispute.status)}`}></span>
                            </div>
                            <span className={`text-sm font-medium ${getPriorityColor(dispute.priority)}`}>
                              {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                            </span>
                          </div>
                          <p className="font-medium text-white">{dispute.userName}</p>
                          <p className="text-sm text-blue-200 truncate">{dispute.details}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-blue-300">
                              {dispute.timestamp.toLocaleString()}
                            </span>
                            <span className="text-xs text-white bg-blue-800 px-2 py-0.5 rounded-full">
                              ID: {dispute.id}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Dispute Details */}
            <div className="lg:col-span-2">
              <div className="bg-blue-900 bg-opacity-30 rounded-lg h-[600px] overflow-y-auto p-6">
                {!selectedDispute ? (
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 opacity-70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl text-blue-200 font-medium mb-2">No Dispute Selected</h3>
                    <p className="text-blue-300 max-w-md">
                      Select a dispute from the list to view details and take action
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-white">Dispute {selectedDispute.id}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedDispute.status === 'resolved' 
                          ? 'bg-green-600 bg-opacity-30 text-green-300' 
                          : 'bg-amber-600 bg-opacity-30 text-amber-300'
                      }`}>
                        {selectedDispute.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-sm text-blue-400 uppercase font-medium mb-2">User Information</h3>
                        <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4">
                          <p className="text-white font-medium">{selectedDispute.userName}</p>
                          <p className="text-blue-200 text-sm">ID: {selectedDispute.userId}</p>
                          <div className="mt-3 pt-3 border-t border-blue-700">
                            <p className="text-sm text-blue-200">Election: {selectedDispute.electionId}</p>
                            <p className="text-sm text-blue-200">Time: {selectedDispute.timestamp.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm text-blue-400 uppercase font-medium mb-2">Dispute Type</h3>
                        <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4">
                          <p className="text-white font-medium capitalize">
                            {selectedDispute.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-blue-200 text-sm mt-2">{selectedDispute.details}</p>
                          <div className="mt-3">
                            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(selectedDispute.priority)} bg-opacity-20`}>
                              {selectedDispute.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm text-blue-400 uppercase font-medium mb-2">Evidence</h3>
                      <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(selectedDispute.evidence).map(([key, value]) => (
                            <div key={key} className="bg-blue-900 bg-opacity-60 rounded p-3">
                              <p className="text-blue-300 text-xs uppercase mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}</p>
                              <p className="text-white font-medium">{value.toString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedDispute.status === 'resolved' ? (
                      <div>
                        <h3 className="text-sm text-blue-400 uppercase font-medium mb-2">Resolution</h3>
                        <div className="bg-green-800 bg-opacity-20 border border-green-700 rounded-lg p-4">
                          <p className="text-white">{selectedDispute.resolution}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm text-blue-400 uppercase font-medium mb-2">Resolve Dispute</h3>
                        <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4">
                          <textarea
                            className="w-full bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-3 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="Enter resolution details..."
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                          ></textarea>
                          <div className="flex justify-end mt-4">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!resolution.trim()}
                              onClick={handleResolveDispute}
                            >
                              Resolve Dispute
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDispute;