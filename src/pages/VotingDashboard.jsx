import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
const contractAddress = "0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC";
const VotingDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [topics, setTopics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const contractABI = [
    // ABI entries for functions we need
    {
      "inputs": [],
      "name": "topicCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "topicId", "type": "uint256"}],
      "name": "getTopicDetails",
      "outputs": [
        {"internalType": "string", "name": "name", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string[]", "name": "choices", "type": "string[]"},
        {"internalType": "enum ZKVote.VotingMethod", "name": "method", "type": "uint8"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "string", "name": "location", "type": "string"},
        {"internalType": "uint256", "name": "minVotingPower", "type": "uint256"},
        {"internalType": "bool", "name": "isVotingOpen", "type": "bool"},
        {"internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Connect wallet function
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Initialize contract after wallet connection
        await initializeContract();
        setLoading(false);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        setErrorMessage("Failed to connect to wallet");
        setLoading(false);
      }
    } else {
      setErrorMessage("Metamask is not installed");
      setLoading(false);
    }
  };

  const initializeContract = async () => {
    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      setErrorMessage("Invalid contract address");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const zkVoteContract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(zkVoteContract);
      
      // Load topics after contract initialization
      await loadTopics(zkVoteContract);
    } catch (error) {
      console.error("Error initializing contract:", error);
      setErrorMessage("Failed to initialize contract");
    }
  };

  const loadTopics = async (contractInstance) => {
    try {
      const contract = contractInstance || contract;
      if (!contract) return;
      
      const topicCount = await contract.topicCount();
      const count = topicCount.toNumber();
      const loadedTopics = [];
      
      // Start from index 0 instead of 1
      for (let i = 0; i < count; i++) {
        try {
          const topicDetails = await contract.getTopicDetails(i);
          
          // Map contract data to our UI format
          const topic = {
            id: i, // Use the same ID as in the contract
            title: topicDetails.name,
            description: topicDetails.description,
            status: topicDetails.isVotingOpen ? "active" : (new Date() > new Date(topicDetails.endTime.toNumber() * 1000) ? "completed" : "upcoming"),
            endDate: new Date(topicDetails.endTime.toNumber() * 1000),
            votingMethod: getVotingMethodName(topicDetails.method),
            choices: topicDetails.choices,
            participants: topicDetails.voteCounts.reduce((sum, count) => sum + count.toNumber(), 0),
            geoFenced: topicDetails.location !== "",
            geoFence: {
              latitude: 0,
              longitude: 0,
              radiusKm: 5
            }
          };
          
          loadedTopics.push(topic);
        } catch (error) {
          console.warn(`Error loading topic ${i}:`, error.message);
          // Continue with the next topic instead of stopping the entire process
        }
      }
      
      setTopics(loadedTopics);
    } catch (error) {
      console.error("Error loading topics:", error);
      setErrorMessage("Failed to load topics from contract");
    }
  };

  // Helper function to convert voting method enum to string
  const getVotingMethodName = (methodId) => {
    const methods = ["standard", "approval", "ranked", "quadratic", "community"];
    return methods[methodId] || "standard";
  };

  const handleElectionSelect = (election) => {
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

  // Filter elections based on selected filter
  const filteredTopics = topics.filter(topic => {
    if (filter === 'all') return true;
    if (filter === 'active' && topic.status === 'active') return true;
    if (filter === 'upcoming' && topic.status === 'upcoming') return true;
    if (filter === 'past' && topic.status === 'completed') return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">ZKVote Dashboard</h1>
            <button
              onClick={() => navigate('/createtopic')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Topic
            </button>
          </div>

          {/* Wallet Connection */}
          <div className="mb-6 bg-white/20 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-grow">
                {account ? (
                  <div className="text-green-300">Connected wallet: {account.slice(0, 6)}...{account.slice(-4)}</div>
                ) : (
                  <div className="text-blue-200">Connect your wallet to interact with the contract</div>
                )}
                {errorMessage && (
                  <div className="mt-2 text-red-300 text-sm">{errorMessage}</div>
                )}
              </div>
              {!account && (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:opacity-50"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
            <div className="mt-2 text-white/70">
              Contract Address: {contractAddress || "Not specified"}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Available Topics</h2>
          <p className="text-blue-200 mb-6">Select a topic to cast your vote or view results</p>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-white/80'}`}
            >
              All Topics
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
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-white text-xl">Loading...</div>
            </div>
          ) : !account ? (
            <div className="text-center p-8 text-white/70">
              Connect your wallet to view topics.
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center p-8 text-white/70">
              No topics available for your current criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleElectionSelect(topic)}
                  className="bg-white/20 backdrop-blur-md rounded-lg overflow-hidden shadow-lg cursor-pointer"
                >
                  <div className="h-32 bg-gradient-to-r from-blue-600 to-violet-600 relative">
                    {topic.geoFenced && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-xs text-black font-bold px-2 py-1 rounded-full">
                        Geo-fenced
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/30 p-3">
                      <div className="text-lg font-medium text-white">{topic.title}</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(topic.status)}`}>
                        {topic.status.toUpperCase()}
                      </div>
                      <div className="text-white font-medium text-sm flex items-center">
                        <span className="mr-1">{getVotingMethodIcon(topic.votingMethod)}</span>
                        {topic.votingMethod.charAt(0).toUpperCase() + topic.votingMethod.slice(1)}
                      </div>
                    </div>
                    
                    <p className="text-blue-100 text-sm mb-3">{topic.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-white/70">
                      <div>Ends: {topic.endDate.toLocaleDateString()}</div>
                      <div>{topic.participants} participants</div>
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