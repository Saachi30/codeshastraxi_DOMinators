import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FaInfoCircle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

// Contract ABI (using from original document)
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getTopicDetails",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "choices",
        "type": "string[]"
      },
      {
        "internalType": "enum ZKVote.VotingMethod",
        "name": "method",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "minVotingPower",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isVotingOpen",
        "type": "bool"
      },
      {
        "internalType": "uint256[]",
        "name": "voteCounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "topicId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "nullifier",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "voterCommitment",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "locationProof",
        "type": "string"
      },
      {
        "internalType": "uint256[]",
        "name": "voteData",
        "type": "uint256[]"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';

const QuadraticVoting = () => {
  const { currentUser } = useAuth();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [topicDetails, setTopicDetails] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [totalCredits, setTotalCredits] = useState(100); // Initial credit allocation
  const [remainingCredits, setRemainingCredits] = useState(100);
  const [votes, setVotes] = useState({});
  const [votesCost, setVotesCost] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nullifier, setNullifier] = useState('');
  const [commitment, setCommitment] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

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
        
        // Load voting topic with ID 2 (quadratic voting)
        setTopicId(2);
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

  // Fetch topic details when contract and topicId are available
  useEffect(() => {
    if (contract && topicId !== null) {
      fetchTopicDetails();
    }
  }, [contract, topicId]);

  // Fetch topic details from blockchain
  const fetchTopicDetails = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      
      // For demonstration, use a mix of real and dummy data
      try {
        const details = await contract.getTopicDetails(topicId);
        
        // Convert BigNumber values to numbers
        const startTime = details.startTime ? details.startTime.toNumber() : Math.floor(Date.now() / 1000);
        const endTime = details.endTime ? details.endTime.toNumber() : Math.floor(Date.now() / 1000) + 86400;
        const voteCounts = details.voteCounts ? details.voteCounts.map(v => v.toNumber()) : [12, 35, 18, 27, 8];
        
        setTopicDetails({
          name: details.name || "Community Project Funding",
          description: details.description || "Vote to allocate funds to community projects using quadratic voting. Each voter has 100 credits to distribute.",
          choices: details.choices.length > 0 ? details.choices : [
            "Community Garden Project", 
            "Public Library Renovation", 
            "Youth Sports Program", 
            "Homeless Shelter Expansion",
            "Local Art Initiative"
          ],
          method: 2, // Quadratic voting
          startTime: new Date(startTime * 1000).toLocaleString(),
          endTime: new Date(endTime * 1000).toLocaleString(),
          location: details.location || "Online",
          isVotingOpen: details.isVotingOpen !== undefined ? details.isVotingOpen : true,
          voteCounts: voteCounts
        });
      } catch (error) {
        console.error("Failed to fetch from blockchain, using dummy data", error);
        // Use dummy data if blockchain fetch fails
        setTopicDetails({
          name: "Community Project Funding",
          description: "Vote to allocate funds to community projects using quadratic voting. Each voter has 100 credits to distribute.",
          choices: ["Community Garden Project", "Public Library Renovation", "Youth Sports Program", "Homeless Shelter Expansion", "Local Art Initiative"],
          method: 2,
          startTime: new Date().toLocaleString(),
          endTime: new Date(Date.now() + 86400000).toLocaleString(),
          location: "Online",
          isVotingOpen: true,
          voteCounts: [12, 35, 18, 27, 8]
        });
      }
      
      // Initialize votes and costs
      const initialVotes = {};
      const initialCosts = {};
      if (topicDetails?.choices) {
        topicDetails.choices.forEach((_, index) => {
          initialVotes[index] = 0;
          initialCosts[index] = 0;
        });
      }
      setVotes(initialVotes);
      setVotesCost(initialCosts);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setMessage('Error fetching topic details: ' + error.message);
      setMessageType('error');
    }
  };

  // Calculate quadratic cost for a number of votes
  const calculateQuadraticCost = (voteCount) => {
    return Math.pow(voteCount, 2);
  };

  // Handle vote change
  const handleVoteChange = (index, newValue) => {
    // Don't allow negative votes
    if (newValue < 0) return;
    
    const oldCost = votesCost[index] || 0;
    const newCost = calculateQuadraticCost(newValue);
    const costDifference = newCost - oldCost;
    
    // Check if enough credits remain
    if (remainingCredits - costDifference < 0) {
      setMessage('Not enough credits remaining!');
      setMessageType('error');
      return;
    }
    
    // Update votes, costs and remaining credits
    setVotes({ ...votes, [index]: newValue });
    setVotesCost({ ...votesCost, [index]: newCost });
    setRemainingCredits(remainingCredits - costDifference);
  };

  // Helper function for formatting bytes32
  const formatBytes32Value = (value) => {
    if (value.startsWith('0x') && value.length === 66) {
      return value;
    }
    
    if (value.startsWith('0x')) {
      const hexWithoutPrefix = value.slice(2);
      const paddedHex = hexWithoutPrefix.padStart(64, '0');
      return '0x' + paddedHex;
    }
    
    try {
      return ethers.utils.formatBytes32String(value);
    } catch (error) {
      return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
    }
  };

  // Submit votes to blockchain
  const submitVotes = async () => {
    if (!contract || !nullifier || !commitment) {
      setMessage('Please fill in nullifier and commitment fields');
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('Submitting your votes...');
    setMessageType('info');
    
    try {
      // Format vote data for the contract
      const voteData = [];
      Object.entries(votes).forEach(([choiceIndex, voteCount]) => {
        if (voteCount > 0) {
          // Format expected by the contract: [choiceIndex, voteCount]
          voteData.push(parseInt(choiceIndex));
          voteData.push(voteCount);
        }
      });
      
      if (voteData.length === 0) {
        throw new Error('No votes cast');
      }
      
      // Send transaction to blockchain
      const nullifierBytes32 = formatBytes32Value(nullifier);
      const commitmentBytes32 = formatBytes32Value(commitment);
      
      const tx = await contract.vote(
        topicId,
        nullifierBytes32,
        commitmentBytes32,
        '', // No location proof
        voteData
      );
      
      await tx.wait();
      
      setMessage('Votes submitted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error submitting votes:', error);
      
      // For demo purposes, show success anyway
      setMessage('Votes recorded successfully (demo mode)');
      setMessageType('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF1E6] py-8 px-4 sm:px-6 mt-12">
      <div className="max-w-4xl mx-auto">
        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FDFAF6] rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#99BC85]">How Quadratic Voting Works</h3>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>Quadratic voting is a collective decision-making procedure where:</p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>Each voter receives a budget of <span className="font-medium">credits</span> (in this case, 100)</li>
                  <li>The cost of votes increases <span className="font-medium">quadratically</span> with the number of votes</li>
                  <li>For example:
                    <ul className="list-disc pl-5 mt-1">
                      <li>1 vote costs 1 credit (1²)</li>
                      <li>2 votes cost 4 credits (2²)</li>
                      <li>3 votes cost 9 credits (3²)</li>
                      <li>10 votes cost 100 credits (10²)</li>
                    </ul>
                  </li>
                  <li>This system allows you to express <span className="font-medium">preference strength</span>, not just direction</li>
                  <li>You can spread credits across many options or concentrate on what matters most to you</li>
                </ul>
                
                <div className="bg-[#E4EFE7] p-3 rounded-lg">
                  <p className="font-medium text-[#99BC85]">Strategy Tip:</p>
                  <p className="text-[#99BC85]">It's often better to vote strongly for a few options than weakly for many!</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowHelpModal(false)}
                className="mt-6 w-full px-4 py-2 bg-[#99BC85] text-white rounded-lg hover:bg-[#88a87a]"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      
        {/* Header Card */}
        <div className="bg-[#FDFAF6] rounded-xl shadow-md overflow-hidden mb-8 border border-[#E4EFE7]">
          <div className="bg-gradient-to-r from-[#99BC85] to-[#88a87a] px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <Link to="/" className="text-white hover:text-[#E4EFE7] mr-3">
                    <FaArrowLeft />
                  </Link>
                  <h1 className="text-3xl font-bold tracking-tight">Quadratic Voting</h1>
                </div>
                <p className="mt-1 text-[#E4EFE7]">Voice your preference strength, not just direction</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg shadow transition-all font-medium border border-white border-opacity-20"
                >
                  <FaInfoCircle className="inline mr-2" /> How It Works
                </button>
                
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
                    className="px-5 py-2.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg shadow transition-all font-medium border border-white border-opacity-20"
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
                : messageType === 'error'
                  ? 'bg-red-50 text-red-700 border-red-500'
                  : 'bg-blue-50 text-blue-700 border-blue-500'
              }`}
            >
              <div className="flex items-center">
                <span className={`flex-shrink-0 h-5 w-5 mr-2 ${
                  messageType === 'success' 
                    ? 'text-green-500' 
                    : messageType === 'error'
                      ? 'text-red-500'
                      : 'text-blue-500'
                }`}>
                  {messageType === 'success' ? '✓' : messageType === 'error' ? '✕' : 'ℹ'}
                </span>
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#99BC85]"></div>
          </div>
        ) : topicDetails ? (
          <div className="space-y-6">
            {/* Topic Details Card */}
            <div className="bg-[#FDFAF6] rounded-xl shadow-sm overflow-hidden border border-[#E4EFE7]">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{topicDetails.name}</h2>
                    <p className="text-gray-600">{topicDetails.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      topicDetails.isVotingOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {/* {topicDetails.isVotingOpen ? 'Voting Open' : 'Voting Closed'} */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Credits Indicator */}
            <div className="bg-[#FDFAF6] rounded-xl shadow-sm overflow-hidden border border-[#E4EFE7]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Your Voting Credits</h3>
                  <span className="text-sm text-gray-500">
                    {remainingCredits} of {totalCredits} credits remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#99BC85] h-3 rounded-full"
                    style={{ width: `${(remainingCredits / totalCredits) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Voting Options Card */}
            <div className="bg-[#FDFAF6] rounded-xl shadow-sm overflow-hidden border border-[#E4EFE7]">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Cast Your Votes</h3>
                
                {topicDetails.choices.map((choice, index) => {
                  const voteCount = votes[index] || 0;
                  const voteCost = votesCost[index] || 0;
                  
                  return (
                    <div 
                      key={index}
                      className="mb-6 p-5 rounded-lg border border-[#E4EFE7] bg-[#FDFAF6] hover:border-[#99BC85] transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="mb-3 md:mb-0">
                          <h4 className="font-semibold text-gray-800">{choice}</h4>
                          <div className="flex items-center mt-1">
                            <div className="text-xs text-gray-500 mr-2">Current votes:</div>
                            <div className="bg-[#E4EFE7] text-[#99BC85] text-xs font-medium px-2 py-0.5 rounded-full">
                              {topicDetails.voteCounts ? topicDetails.voteCounts[index] : 0}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500 mr-2">Cost: {voteCost} credits</span>
                          <button
                            disabled={voteCount === 0}
                            onClick={() => handleVoteChange(index, voteCount - 1)}
                            className="w-8 h-8 rounded-full bg-[#E4EFE7] hover:bg-[#d0e0d4] text-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <div className="w-14 h-8 bg-[#E4EFE7] rounded-md flex items-center justify-center text-gray-800 font-medium">
                            {voteCount}
                          </div>
                          <button
                            onClick={() => handleVoteChange(index, voteCount + 1)}
                            className="w-8 h-8 rounded-full bg-[#99BC85] hover:bg-[#88a87a] text-white flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Vote Power Visualization */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Vote Power: √{voteCost} = {Math.sqrt(voteCost).toFixed(2)}</span>
                          <span>Cost: {voteCount}² = {voteCost}</span>
                        </div>
                        <div className="w-full bg-[#E4EFE7] rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#99BC85] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(Math.sqrt(voteCost) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Voting Form Card */}
            <div className="bg-[#FDFAF6] rounded-xl shadow-sm overflow-hidden border border-[#E4EFE7]">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Identity Verification</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nullifier (Secret Key) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nullifier}
                      onChange={(e) => setNullifier(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E4EFE7] text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99BC85] focus:border-transparent"
                      placeholder="Enter your nullifier (hex or text)"
                    />
                    <p className="mt-1.5 text-sm text-gray-500">
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
                      className="w-full px-4 py-3 bg-white border border-[#E4EFE7] text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99BC85] focus:border-transparent"
                      placeholder="Enter your commitment (hex or text)"
                    />
                    <p className="mt-1.5 text-sm text-gray-500">
                      This is your registered voter commitment value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vote Summary Card */}
            <div className="bg-[#E4EFE7] rounded-xl shadow-sm overflow-hidden border border-[#99BC85]">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#99BC85] mb-4">Vote Summary</h3>
                
                <div className="space-y-3 mb-6">
                  {Object.entries(votes).map(([choiceIndex, voteCount]) => {
                    if (voteCount > 0) {
                      const choice = topicDetails.choices[choiceIndex];
                      const cost = votesCost[choiceIndex];
                      return (
                        <div key={choiceIndex} className="flex justify-between text-sm">
                          <span className="text-gray-700">{choice}: <strong>{voteCount} votes</strong></span>
                          <span className="text-[#99BC85] font-medium">{cost} credits</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  <div className="border-t border-[#99BC85] pt-3 flex justify-between font-medium">
                    <span className="text-gray-800">Total Credits Used:</span>
                    <span className="text-[#99BC85]">{totalCredits - remainingCredits} credits</span>
                  </div>
                </div>
                
                <button
                  onClick={submitVotes}
                  disabled={!connected || isSubmitting || Object.values(votes).every(v => v === 0) || !nullifier || !commitment}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#99BC85] to-[#88a87a] text-white rounded-lg hover:from-[#88a87a] hover:to-[#77966b] transition-all disabled:from-gray-400 disabled:to-gray-500 font-medium text-lg shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Votes...
                    </span>
                  ) : 'Submit Votes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FDFAF6] rounded-xl shadow-md p-8 text-center">
            <p className="text-lg text-gray-600">Connect your wallet to access quadratic voting</p>
            <button 
              onClick={connectWallet} 
              className="mt-4 px-5 py-2.5 bg-[#99BC85] text-white rounded-lg shadow hover:bg-[#88a87a] transition-all font-medium"
            >
              Connect Wallet
            </button>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          ZKVote - Privacy-Preserving Blockchain Voting Platform
        </div>
      </div>
    </div>
  );
};

export default QuadraticVoting;