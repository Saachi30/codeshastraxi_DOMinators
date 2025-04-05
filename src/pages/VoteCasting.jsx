import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Define the contract ABI and address
const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
const contractABI = [
  // Functions we'll need
  "function getTopicDetails(uint256 topicId) view returns (string name, string description, string[] choices, uint8 method, uint256 startTime, uint256 endTime, string location, uint256 minVotingPower, bool isVotingOpen, uint256[] voteCounts)",
  "function vote(uint256 topicId, bytes32 nullifier, bytes32 voterCommitment, string locationProof, uint256[] voteData)"
];

const ZKVote = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topicDetails, setTopicDetails] = useState(null);
  const [nullifier, setNullifier] = useState('');
  const [commitment, setCommitment] = useState('');
  const [locationProof, setLocationProof] = useState('');
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(address);
        setConnected(true);
        
        setMessage('Wallet connected successfully!');
        setMessageType('success');
      } else {
        setMessage('Please install MetaMask!');
        setMessageType('error');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error connecting wallet: ' + error.message);
      setMessageType('error');
    }
  };
  
  // Fetch topic details
  const fetchTopicDetails = async () => {
    if (!contract || !topicId) return;
    
    try {
      setLoading(true);
      const details = await contract.getTopicDetails(topicId);
      setTopicDetails({
        name: details.name,
        description: details.description,
        choices: details.choices,
        method: details.method,
        startTime: new Date(details.startTime.toNumber() * 1000).toLocaleString(),
        endTime: new Date(details.endTime.toNumber() * 1000).toLocaleString(),
        location: details.location,
        minVotingPower: details.minVotingPower.toString(),
        isVotingOpen: details.isVotingOpen,
        voteCounts: details.voteCounts.map(count => count.toString())
      });
      setLoading(false);
      setMessage('Topic details loaded!');
      setMessageType('success');
    } catch (error) {
      console.error(error);
      setLoading(false);
      setMessage('Error fetching topic details: ' + error.message);
      setMessageType('error');
    }
  };
  
  // Submit vote
  const submitVote = async () => {
    if (!contract || !topicId || !nullifier || !commitment || !topicDetails) {
      setMessage('Please fill all required fields');
      setMessageType('error');
      return;
    }
    
    if (!selectedChoices.length) {
      setMessage('Please select at least one choice');
      setMessageType('error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Modified code for handling hex bytes32 values
let nullifierBytes32, commitmentBytes32;

// Check if nullifier and commitment are already in hex format
if (nullifier.startsWith('0x') && nullifier.length === 66) {
  nullifierBytes32 = nullifier; // Already in bytes32 format
} else {
  nullifierBytes32 = ethers.utils.formatBytes32String(nullifier);
}

if (commitment.startsWith('0x') && commitment.length === 66) {
  commitmentBytes32 = commitment; // Already in bytes32 format
} else {
  commitmentBytes32 = ethers.utils.formatBytes32String(commitment);
}
      // Prepare voteData based on voting method
      // 0: Single choice, 1: Multiple choice, 2: Ranked choice, 3: Quadratic
      let voteData = [];
      
      if (topicDetails.method === 0) {
        // Single choice - just the index of the selected choice
        voteData = [parseInt(selectedChoices[0])];
      } else if (topicDetails.method === 1) {
        // Multiple choice - array of selected indices
        voteData = selectedChoices.map(choice => parseInt(choice));
      } else if (topicDetails.method === 2) {
        // Ranked choice - array of [index, rank] pairs
        voteData = selectedChoices.map((choice, index) => [parseInt(choice), index + 1]).flat();
      } else if (topicDetails.method === 3) {
        // Quadratic voting - array of [index, votes] pairs
        voteData = selectedChoices.map(choice => [parseInt(choice), 1]).flat();
      }
      
      // Call vote function
      const tx = await contract.vote(
        topicId,
        nullifierBytes32,
        commitmentBytes32,
        locationProof || '',
        voteData
      );
      
      await tx.wait();
      
      setLoading(false);
      setMessage('Vote submitted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error(error);
      setLoading(false);
      setMessage('Error submitting vote: ' + error.message);
      setMessageType('error');
    }
  };
  
  // Handle choice selection
  const handleChoiceSelection = (index) => {
    if (topicDetails?.method === 0) {
      // Single choice voting
      setSelectedChoices([index.toString()]);
    } else {
      // For other methods
      const currentIndex = selectedChoices.indexOf(index.toString());
      if (currentIndex === -1) {
        setSelectedChoices([...selectedChoices, index.toString()]);
      } else {
        setSelectedChoices(selectedChoices.filter(i => i !== index.toString()));
      }
    }
  };
  
  // Check if a choice is selected
  const isChoiceSelected = (index) => {
    return selectedChoices.includes(index.toString());
  };
  
  // Display voting method name
  const getVotingMethodName = (methodId) => {
    const methods = ['Single Choice', 'Multiple Choice', 'Ranked Choice', 'Quadratic Voting'];
    return methods[methodId] || 'Unknown Method';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">ZKVote</h1>
                <p className="mt-1 text-blue-100">Private and Secure Blockchain Voting Platform</p>
              </div>
              <div className="mt-4 md:mt-0">
                {connected ? (
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">
                      {account.substring(0, 6)}...{account.substring(account.length - 4)}
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={connectWallet} 
                    className="px-5 py-2.5 bg-white text-indigo-700 rounded-lg shadow hover:bg-indigo-50 transition-all font-medium"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Notifications */}
          {message && (
            <div className={`px-6 py-3 text-sm border-l-4 ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border-green-500' 
                : 'bg-red-50 text-red-700 border-red-500'
              }`}
            >
              <div className="flex items-center">
                <span className={`flex-shrink-0 h-5 w-5 mr-2 ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {messageType === 'success' ? '✓' : '✕'}
                </span>
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Topic ID Input */}
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">Topic ID</label>
              <div className="flex shadow-sm rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="flex-1 px-4 py-3 border-y border-l border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Topic ID"
                />
                <button
                  onClick={fetchTopicDetails}
                  disabled={!connected || !topicId || loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-r-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-400 disabled:to-gray-400 font-medium"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading
                    </span>
                  ) : 'Load Topic'}
                </button>
              </div>
            </div>
            
            {topicDetails && (
              <div className="space-y-8">
                {/* Topic Details */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{topicDetails.name}</h2>
                  <p className="text-gray-600 mb-6">{topicDetails.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Voting Method</p>
                      <p className="font-semibold text-gray-800">{getVotingMethodName(topicDetails.method)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                      <div className="flex items-center">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${topicDetails.isVotingOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`font-semibold ${topicDetails.isVotingOpen ? 'text-green-600' : 'text-red-600'}`}>
                          {topicDetails.isVotingOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Start Time</p>
                      <p className="font-semibold text-gray-800">{topicDetails.startTime}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">End Time</p>
                      <p className="font-semibold text-gray-800">{topicDetails.endTime}</p>
                    </div>
                  </div>
                  
                  {/* Choices */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">Available Options</h3>
                    <div className="space-y-3">
                      {topicDetails.choices.map((choice, index) => (
                        <div 
                          key={index}
                          onClick={() => handleChoiceSelection(index)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            isChoiceSelected(index) 
                              ? 'border-2 border-blue-500 bg-blue-50 shadow-md' 
                              : 'border border-gray-200 hover:border-blue-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center border-2 ${
                              isChoiceSelected(index) 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {isChoiceSelected(index) && (
                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              )}
                            </div>
                            <span className="text-gray-800 font-medium">{choice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Voting Form */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Vote Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Nullifier (Secret Key) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nullifier}
                        onChange={(e) => setNullifier(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your nullifier"
                      />
                      <p className="mt-1.5 text-sm text-gray-500 flex items-start">
                        <svg className="w-4 h-4 text-blue-500 mr-1.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        This is your private key for this vote. Keep it secret!
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Commitment <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your commitment"
                      />
                      <p className="mt-1.5 text-sm text-gray-500 flex items-start">
                        <svg className="w-4 h-4 text-blue-500 mr-1.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        This is your registered voter commitment value.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Location Proof (if required)
                      </label>
                      <input
                        type="text"
                        value={locationProof}
                        onChange={(e) => setLocationProof(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Location proof (if needed)"
                      />
                    </div>
                    
                    <button
                      onClick={submitVote}
                      disabled={!connected || loading || !topicDetails.isVotingOpen || !nullifier || !commitment || selectedChoices.length === 0}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-400 disabled:to-gray-400 font-medium text-lg shadow-md"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting Vote...
                        </span>
                      ) : 'Submit Vote'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          ZKVote - Privacy-Preserving Blockchain Voting Platform
        </div>
      </div>
    </div>
  );
};

export default ZKVote;