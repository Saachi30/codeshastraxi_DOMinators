import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ZKVoteChatbot from './AiAgent';
const contractAddress = "0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC";

const VotingDashboard = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [topics, setTopics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const contractABI = [
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
      
      for (let i = 0; i < count; i++) {
        try {
          const topicDetails = await contract.getTopicDetails(i);
          
          // Add additional category field for our UI organization
          // Determine category based on topic name or description keywords
          let topicCategory = "other";
          const nameAndDesc = (topicDetails.name + " " + topicDetails.description).toLowerCase();
          
          if (nameAndDesc.includes("government") || nameAndDesc.includes("election") || 
              nameAndDesc.includes("civic") || nameAndDesc.includes("national") || 
              nameAndDesc.includes("municipal") || nameAndDesc.includes("public") ||
              nameAndDesc.includes("civil")) {
            topicCategory = "government";
          } else if (nameAndDesc.includes("society") || nameAndDesc.includes("resident") || 
                    nameAndDesc.includes("apartment") || nameAndDesc.includes("community")) {
            topicCategory = "society";
          } else if (nameAndDesc.includes("college") || nameAndDesc.includes("university") || 
                    nameAndDesc.includes("school") || nameAndDesc.includes("education") || 
                    nameAndDesc.includes("student")) {
            topicCategory = "college";
          }
          
          const topic = {
            id: i,
            title: topicDetails.name,
            description: topicDetails.description,
            status: topicDetails.isVotingOpen ? "active" : (new Date() > new Date(topicDetails.endTime.toNumber() * 1000) ? "completed" : "upcoming"),
            endDate: new Date(topicDetails.endTime.toNumber() * 1000),
            votingMethod: getVotingMethodName(topicDetails.method),
            choices: topicDetails.choices,
            participants: topicDetails.voteCounts.reduce((sum, count) => sum + count.toNumber(), 0),
            geoFenced: topicDetails.location !== "",
            category: topicCategory
          };
          
          loadedTopics.push(topic);
        } catch (error) {
          console.warn(`Error loading topic ${i}:`, error.message);
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
    navigate(`/vote`, { state: { topic: election } });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'government': return 'bg-blue-600';
      case 'society': return 'bg-green-600';
      case 'college': return 'bg-purple-600';
      default: return 'bg-gray-600';
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

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'government': return '🏛️';
      case 'society': return '🏙️';
      case 'college': return '🎓';
      default: return '📊';
    }
  };

  // Filter topics based on selected category
  const filteredTopics = topics.filter(topic => {
    return category === 'all' || category === topic.category;
  });

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-indigo-300">
      <ZKVoteChatbot />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">BharatVote Dashboard</h1>
              <p className="text-gray-600">Select a topic to cast your vote or view results</p>
            </div>
            <button
              onClick={() => navigate('/create-topic')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Create Topic
            </button>
          </div>

          {/* Category selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCategory('all')}
                className={`px-4 py-2 rounded-full transition-colors ${category === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                All Categories
              </button>
              <button 
                onClick={() => setCategory('government')}
                className={`px-4 py-2 rounded-full flex items-center gap-1 transition-colors ${category === 'government' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
              >
                <span>🏛️</span> Government
              </button>
              <button 
                onClick={() => setCategory('society')}
                className={`px-4 py-2 rounded-full flex items-center gap-1 transition-colors ${category === 'society' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
              >
                <span>🏙️</span> Society
              </button>
              <button 
                onClick={() => setCategory('college')}
                className={`px-4 py-2 rounded-full flex items-center gap-1 transition-colors ${category === 'college' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
              >
                <span>🎓</span> College
              </button>
              <button 
                onClick={() => setCategory('other')}
                className={`px-4 py-2 rounded-full flex items-center gap-1 transition-colors ${category === 'other' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                <span>📊</span> Other
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                <span className="text-gray-600 ml-2">Loading topics...</span>
              </div>
            </div>
          ) : !account ? (
            <div className="text-center p-12 bg-gray-50 rounded-lg">
              <div className="text-gray-500 mb-2">Please connect your wallet to view topics</div>
              <button
                onClick={connectWallet}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Connect Wallet
              </button>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-lg">
              <div className="text-gray-500">No topics available for your current criteria</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleElectionSelect(topic)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                >
                  <div className={`h-28 relative ${getCategoryColor(topic.category).replace('bg-', 'bg-gradient-to-r from-').replace('600', '500')} to-${topic.category === 'government' ? 'indigo' : topic.category === 'society' ? 'emerald' : topic.category === 'college' ? 'violet' : 'slate'}-600`}>
                    {topic.geoFenced && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-xs text-black font-bold px-2 py-1 rounded-full">
                        Geo-fenced
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <span>{getCategoryIcon(topic.category)}</span>
                      <span className="capitalize">{topic.category}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3">
                      <div className="text-lg font-semibold text-white">{topic.title}</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full text-white ${getCategoryColor(topic.category)}`}>
                        {topic.category.toUpperCase()}
                      </div>
                      <div className="text-gray-700 font-medium text-sm flex items-center gap-1">
                        <span>{getVotingMethodIcon(topic.votingMethod)}</span>
                        {topic.votingMethod.charAt(0).toUpperCase() + topic.votingMethod.slice(1)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                      <div>Ends: {topic.endDate.toLocaleDateString()}</div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {topic.participants} participants
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Wallet Connection - Streamlined at the bottom */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-grow">
                {account ? (
                  <div className="text-green-600 font-medium">Connected wallet: {account.slice(0, 6)}...{account.slice(-4)}</div>
                ) : (
                  <div className="text-blue-800">Connect your wallet to interact with the contract</div>
                )}
                {errorMessage && (
                  <div className="mt-2 text-red-600 text-sm">{errorMessage}</div>
                )}
              </div>
              {!account && (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
            {account && (
              <div className="mt-2 text-gray-500 text-sm">
                Contract Address: {contractAddress || "Not specified"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingDashboard;