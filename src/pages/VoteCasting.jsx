import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ZKEmailModal from './zkproof';
import { Link } from 'react-router-dom';
import { getFirestore, 
  collection, 
  query, 
  where, 
  getDocs  } from 'firebase/firestore';

// Define the contract ABI and address
const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
const contractABI = [
  // Existing functions
  "function getTopicDetails(uint256 topicId) view returns (string name, string description, string[] choices, uint8 method, uint256 startTime, uint256 endTime, string location, uint256 minVotingPower, bool isVotingOpen, uint256[] voteCounts)",
  "function vote(uint256 topicId, bytes32 nullifier, bytes32 voterCommitment, string locationProof, uint256[] voteData)",
  // NFT functions
  "function mintParticipationNFT(string tokenURI, bytes32 nullifier, bytes32 voterCommitment)",
  "function getNFTDetails(uint256 tokenId) view returns (address owner, string tokenURI)"
];

// NFT Viewer Component with dark theme
const NFTViewer = ({ commitment, nullifier, onClose, onMintNFT }) => {
  const [ipfsHash, setIpfsHash] = useState('');
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [nftDetails, setNftDetails] = useState(null);
  

  const handleMintNFT = async () => {
    if (!ipfsHash) {
      alert('Please enter an IPFS hash');
      return;
    }
    
    try {
      setMinting(true);
      await onMintNFT(ipfsHash);
      setMinted(true);
      setMinting(false);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMinting(false);
      alert('Failed to mint NFT: ' + error.message);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-purple-400">Your Vote NFT</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {!minted ? (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <div className="w-full h-48 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-20 h-20 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold text-white mb-2">Mint Your Vote NFT</h4>
            <p className="text-gray-400 mb-4">This NFT will represent your anonymous vote on the blockchain</p>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">IPFS Hash for Metadata</label>
              <input
                type="text"
                value={ipfsHash}
                onChange={(e) => setIpfsHash(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Qm... or bafy..."
              />
              <p className="mt-1 text-xs text-gray-500">Enter the IPFS hash for your NFT metadata</p>
            </div>
          </div>
          
          <button
            onClick={handleMintNFT}
            disabled={minting}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium flex items-center justify-center"
          >
            {minting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Minting NFT...
              </>
            ) : 'Mint NFT'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <div className="w-full h-64 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-32 h-32 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          
          <div className="px-2">
            <h4 className="font-bold text-white mb-2">Vote Verification NFT</h4>
            <p className="text-sm text-gray-400 mb-4">Your voting NFT has been successfully minted!</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">IPFS Hash</p>
                <p className="text-sm bg-gray-700 p-2 rounded font-mono break-all text-gray-300">{ipfsHash}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Commitment</p>
                <p className="text-sm bg-gray-700 p-2 rounded font-mono break-all text-gray-300">{commitment}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nullifier</p>
                <p className="text-sm bg-gray-700 p-2 rounded font-mono break-all text-gray-300">{nullifier}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
      >
        {minted ? 'Close' : 'Cancel'}
      </button>
    </div>
  );
};

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
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [ipData, setIpData] = useState(null);
const [ipLoading, setIpLoading] = useState(false);
const [ipError, setIpError] = useState(null);
const [electionDetails, setElectionDetails] = useState(null);
const [locationVerified, setLocationVerified] = useState(false);
  
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

  // Fetch user's IP geolocation data
const fetchIPData = async () => {
  setIpLoading(true);
  setIpError(null);
  
  try {
    const ACCESS_KEY = '49c7d211f478d6ce3b6a1bc48952f80c'; // Your API key
    const url = `https://api.ipstack.com/check?access_key=${ACCESS_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.info || 'Failed to fetch IP data');
    }
    
    setIpData(data);
    
    // Check if election details are available and verify location
    if (electionDetails) {
      verifyLocation(data, electionDetails);
    }
  } catch (err) {
    setIpError(err.message || 'Something went wrong with location verification');
    console.error(err);
  } finally {
    setIpLoading(false);
  }
};

// Fetch election details from Firebase
const fetchElectionDetails = async (id) => {
  try {
    const db = getFirestore();
    // Query elections collection where topicId matches
    const querySnapshot = await getDocs(
      query(collection(db, "elections"), where("topicId", "==", id.toString()))
    );
    
    if (!querySnapshot.empty) {
      // Get the first matching document
      const docSnapshot = querySnapshot.docs[0];
      const electionData = docSnapshot.data();
      
      console.log("Found election:", electionData);
      setElectionDetails(electionData);
      return electionData;
    } else {
      console.log("No election found with topicId:", id);
      setElectionDetails(null);
      return null;
    }
  } catch (error) {
    console.error("Error fetching election:", error);
    setElectionDetails(null);
    return null;
  }
};
// Verify if user's location matches the election location
const verifyLocation = (ipData, electionData) => {
  if (!ipData || !electionData) return;

  // Normalize both values
  const normalize = (value) => {
    if (!value) return '';
    return String(value).trim().replace(/\s+/g, '');
  };

  const userZip = normalize(ipData.zip);
  const electionPincode = normalize(electionData.pincode);

  console.log('Verification Details:', {
    rawZip: ipData.zip,
    rawPincode: electionData.pincode,
    normalizedZip: userZip,
    normalizedPincode: electionPincode,
    match: userZip === electionPincode
  });

  if (userZip === electionPincode) {
    setLocationVerified(true);
    setMessage("Location verified successfully!");
    setMessageType("success");
  } else {
    setLocationVerified(false);
    setMessage(`Location verification failed. Your ZIP code (${userZip}) doesn't match the required pincode (${electionPincode}).`);
    setMessageType("error");
  }
};
  
  // Fetch topic details
  // Fetch topic details
const fetchTopicDetails = async () => {
  if (!contract || !topicId) return;
  
  try {
    setLoading(true);
    
    // 1. Fetch blockchain topic details
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
    
    // 2. Fetch Firebase election details
    await fetchElectionDetails(topicId);
    
    // 3. Fetch IP location data if not already fetched
    if (!ipData) {
      fetchIPData();
    }
    
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
  
  // Helper function to properly format bytes32 values
  const formatBytes32Value = (value) => {
    // Check if input is already a valid bytes32 hex string
    if (value.startsWith('0x') && value.length === 66) {
      return value;
    }
    
    // Check if it's a shorter hex string that needs padding
    if (value.startsWith('0x')) {
      // Remove '0x', pad to 64 chars with leading zeros, then add '0x' back
      const hexWithoutPrefix = value.slice(2);
      const paddedHex = hexWithoutPrefix.padStart(64, '0');
      return '0x' + paddedHex;
    }
    
    // If it's a string, convert to bytes32
    try {
      return ethers.utils.formatBytes32String(value);
    } catch (error) {
      // If the string is too long for bytes32, hash it instead
      return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
    }
  };
  
  // Mint NFT function
  const mintNFT = async (ipfsHash) => {
    if (!contract || !nullifier || !commitment) {
      throw new Error('Missing required parameters for NFT minting');
    }
    
    try {
      const tx = await contract.mintParticipationNFT(
        ipfsHash,
        formatBytes32Value(nullifier),
        formatBytes32Value(commitment)
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  };
  
  // Submit vote
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
  
  // Check location verification
  if (!locationVerified) {
    setMessage('Your location does not match the required location for this election');
    setMessageType('error');
    return;
  }
  
  try {
    setLoading(true);
    
    // Format nullifier and commitment to proper bytes32 values
    const nullifierBytes32 = formatBytes32Value(nullifier);
    const commitmentBytes32 = formatBytes32Value(commitment);
    
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
    
    // Show NFT modal after successful vote submission
    setShowNFTModal(true);
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
    const methods = ['Single Choice',  'Ranked Choice', 'Quadratic Voting','Multiple Choice',];
    return methods[methodId] || 'Unknown Method';
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-700">
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">ZKVote</h1>
                <p className="mt-1 text-purple-200">Private and Secure Blockchain Voting Platform</p>
              </div>
              <div className="mt-4 md:mt-0">
                {connected ? (
                  <div className="flex items-center bg-black bg-opacity-20 rounded-lg px-4 py-2">
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
                ? 'bg-green-900 bg-opacity-30 text-green-300 border-green-500' 
                : 'bg-red-900 bg-opacity-30 text-red-300 border-red-500'
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
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
          <div className="p-6 sm:p-8">
            {/* Topic ID Input */}
            <div className="mb-8">
              <label className="block text-gray-300 font-medium mb-2">Topic ID</label>
              <div className="flex shadow-sm rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700 border-y border-l border-gray-600 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter Topic ID"
                />
                <button
                  onClick={fetchTopicDetails}
                  disabled={!connected || !topicId || loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-r-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:from-gray-600 disabled:to-gray-600 font-medium"
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
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <h2 className="text-2xl font-bold text-white mb-2">{topicDetails.name}</h2>
                  <p className="text-gray-300 mb-6">{topicDetails.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
                      <p className="text-sm font-medium text-gray-400 mb-1">Voting Method</p>
                      <p className="font-semibold text-white">{getVotingMethodName(topicDetails.method)}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
                      <p className="text-sm font-medium text-gray-400 mb-1">Status</p>
                      <div className="flex items-center">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${topicDetails.isVotingOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`font-semibold ${topicDetails.isVotingOpen ? 'text-green-400' : 'text-red-400'}`}>
                          {topicDetails.isVotingOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
                      <p className="text-sm font-medium text-gray-400 mb-1">Start Time</p>
                      <p className="font-semibold text-white">{topicDetails.startTime}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
                      <p className="text-sm font-medium text-gray-400 mb-1">End Time</p>
                      <p className="font-semibold text-white">{topicDetails.endTime}</p>
                    </div>
                  </div>
                  
                  {/* Choices */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-white mb-3 text-lg">Available Options</h3>
                    <div className="space-y-3">
                      {topicDetails.choices.map((choice, index) => (
                        <div 
                          key={index}
                          onClick={() => handleChoiceSelection(index)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            isChoiceSelected(index) 
                              ? 'border-2 border-purple-500 bg-purple-900 bg-opacity-30 shadow-md' 
                              : 'border border-gray-600 hover:border-purple-400 bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center border-2 ${
                              isChoiceSelected(index) 
                                ? 'border-purple-500 bg-purple-500' 
                                : 'border-gray-500'
                            }`}>
                              {isChoiceSelected(index) && (
                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              )}
                            </div>
                            <span className="text-white font-medium">{choice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Voting Form */}
                <div className="bg-gray-700 rounded-xl border border-gray-600 shadow-sm p-6">
                <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700 mt-4">
  <div className="flex items-center justify-between">
    <p className="text-sm font-medium text-gray-400">Location Verification</p>
    {ipLoading ? (
      <span className="flex items-center">
        <svg className="animate-spin h-5 w-5 text-purple-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Verifying location...
      </span>
    ) : ipData ? (
      <div className="flex items-center">
        {locationVerified ? (
          <>
            <span className="inline-block h-2.5 w-2.5 rounded-full mr-2 bg-green-500"></span>
            <span className="font-semibold text-green-400">Verified</span>
          </>
        ) : (
          <>
            <span className="inline-block h-2.5 w-2.5 rounded-full mr-2 bg-red-500"></span>
            <span className="font-semibold text-red-400">Not Verified</span>
          </>
        )}
      </div>
    ) : (
      <button
        onClick={fetchIPData}
        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
      >
        Verify My Location
      </button>
    )}
  </div>
  
  {ipData && electionDetails && (
  <div className="bg-yellow-900 bg-opacity-20 p-4 rounded-lg mb-4">
    <h4 className="font-bold text-white mb-2">Verification Debug</h4>
    <div className="text-xs text-gray-300">
      <p>Raw ZIP: {JSON.stringify(ipData.zip)} (Type: {typeof ipData.zip})</p>
      <p>Raw Pincode: {JSON.stringify(electionDetails.pincode)} (Type: {typeof electionDetails.pincode})</p>
      <p>Normalized ZIP: {String(ipData.zip).trim().replace(/\s+/g, '')}</p>
      <p>Normalized Pincode: {String(electionDetails.pincode).trim().replace(/\s+/g, '')}</p>
      <p>Match: {String(ipData.zip).trim().replace(/\s+/g, '') === String(electionDetails.pincode).trim().replace(/\s+/g, '') ? '✅' : '❌'}</p>
    </div>
  </div>
)}
  
  {ipError && (
    <p className="mt-2 text-xs text-red-400">{ipError}</p>
  )}
</div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your Vote Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Nullifier (Secret Key) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nullifier}
                        onChange={(e) => setNullifier(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your nullifier (hex or text)"
                      />
                      <p className="mt-1.5 text-sm text-gray-400 flex items-start">
                        <svg className="w-4 h-4 text-purple-400 mr-1.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        This is your private key for this vote. Keep it secret!
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Commitment <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your commitment (hex or text)"
                      />
                      <p className="mt-1.5 text-sm text-gray-400 flex items-start">
                        <svg className="w-4 h-4 text-purple-400 mr-1.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        This is your registered voter commitment value.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Location Proof (if required)
                      </label>
                      <input
                        type="text"
                        value={locationProof}
                        onChange={(e) => setLocationProof(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Location proof (if needed)"
                      />
                      
                    </div>
                    <ZKEmailModal/>
                    <button
  onClick={submitVote}
  disabled={!connected || loading || !topicDetails.isVotingOpen || !nullifier || !commitment || selectedChoices.length === 0 || !locationVerified}
  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:from-gray-600 disabled:to-gray-600 font-medium text-lg shadow-md"
>
  {loading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Submitting Vote...
    </span>
  ) : !locationVerified ? 'Location Verification Required' : 'Submit Vote'}
</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Link to="/tracking"><button className='m-12 bg-amber-700'>Track</button></Link>
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          ZKVote - Privacy-Preserving Blockchain Voting Platform
        </div>
      </div>
      
      {/* NFT Modal */}
      {showNFTModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <NFTViewer 
              commitment={commitment} 
              nullifier={nullifier} 
              onClose={() => setShowNFTModal(false)}
              onMintNFT={mintNFT}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ZKVote;