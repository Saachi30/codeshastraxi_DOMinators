import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ZKEmailModal from './zkproof';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

// Define the contract ABI and address
const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
const contractABI = [
  "function getTopicDetails(uint256 id) view returns (string name, string description, string[] choices, uint8 method, uint256 startTime, uint256 endTime, string location, uint256 minVotingPower, bool isVotingOpen, uint256[] voteCounts)",
  "function vote(uint256 topicId, bytes32 nullifier, bytes32 voterCommitment, string locationProof, uint256[] voteData)",
  "function mintParticipationNFT(string tokenURI, bytes32 nullifier, bytes32 voterCommitment)",
  "function getNFTDetails(uint256 tokenId) view returns (address owner, string tokenURI)"
];

// NFT Viewer Component with light theme
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-indigo-600">Your Vote NFT</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {!minted ? (
        <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-20 h-20 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-2">Mint Your Vote NFT</h4>
            <p className="text-gray-600 mb-4">This NFT will represent your anonymous vote on the blockchain</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">IPFS Hash for Metadata</label>
              <input
                type="text"
                value={ipfsHash}
                onChange={(e) => setIpfsHash(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Qm... or bafy..."
              />
              <p className="mt-1 text-xs text-gray-500">Enter the IPFS hash for your NFT metadata</p>
            </div>
          </div>
          
          <button
            onClick={handleMintNFT}
            disabled={minting}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium flex items-center justify-center"
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
        <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center mb-6">
            <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </div>
          
          <div className="px-2">
            <h4 className="font-bold text-gray-800 mb-2">Vote Verification NFT</h4>
            <p className="text-sm text-gray-600 mb-4">Your voting NFT has been successfully minted!</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">IPFS Hash</p>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono break-all text-gray-700">{ipfsHash}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Commitment</p>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono break-all text-gray-700">{commitment}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nullifier</p>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono break-all text-gray-700">{nullifier}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all font-medium"
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
  const [topicDetails, setTopicDetails] = useState(null);
  const [nullifier, setNullifier] = useState('');
  const [commitment, setCommitment] = useState('');
  const [locationProof, setLocationProof] = useState('');
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [ipData, setIpData] = useState(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState(null);
  const [electionDetails, setElectionDetails] = useState(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const { id } = useParams();
  console.log(id)
  const numericTopicId = parseInt(id, 10);

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
      const ACCESS_KEY = '49c7d211f478d6ce3b6a1bc48952f80c';
      const url = `https://api.ipstack.com/check?access_key=${ACCESS_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.info || 'Failed to fetch IP data');
      }
      
      setIpData(data);
      
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
    const querySnapshot = await getDocs(
      query(collection(db, "elections"), where("id", "==", numericTopicId.toString()))
    );
      
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const electionData = docSnapshot.data();
        setElectionDetails(electionData);
        return electionData;
      } else {
        console.log("No election found with id:", id);
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

    const normalize = (value) => {
      if (!value) return '';
      return String(value).trim().replace(/\s+/g, '');
    };

    const userZip = normalize(ipData.zip);
    const electionPincode = normalize(electionData.pincode);

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
  
  // Fetch topic details when component mounts or id changes
  useEffect(() => {
    if (id) {
      // console.log(id)
      fetchTopicDetails();
      // console.log(id)
    }

  }, [id]);

  // Fetch topic details
  const fetchTopicDetails = async () => {
    if (!contract || !numericTopicId) return
    
    try {
      setLoading(true);
      console.log(id)
      // 1. Fetch blockchain topic details
      const details = await contract.getTopicDetails(numericTopicId);
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
      await fetchElectionDetails(id);
      
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
  const submitVote = async () => {
    if (!contract || !id || !nullifier || !commitment || !topicDetails) {
      setMessage('Please fill all required fields');
      setMessageType('error');
      return;
    }
    
    if (!selectedChoices.length) {
      setMessage('Please select at least one choice');
      setMessageType('error');
      return;
    }
    
    if (!locationVerified) {
      setMessage('Your location does not match the required location for this election');
      setMessageType('error');
      return;
    }
    
    try {
      setLoading(true);
      
      const nullifierBytes32 = formatBytes32Value(nullifier);
      const commitmentBytes32 = formatBytes32Value(commitment);
      
      let voteData = [];
      
      if (topicDetails.method === 0) {
        voteData = [parseInt(selectedChoices[0])];
      } else if (topicDetails.method === 1) {
        voteData = selectedChoices.map(choice => parseInt(choice));
      } else if (topicDetails.method === 2) {
        voteData = selectedChoices.map((choice, index) => [parseInt(choice), index + 1]).flat();
      } else if (topicDetails.method === 3) {
        voteData = selectedChoices.map(choice => [parseInt(choice), 1]).flat();
      }
      
      const tx = await contract.vote(
        numericTopicId,
        nullifierBytes32,
        commitmentBytes32,
        locationProof || '',
        voteData
      );
      await tx.wait();
      
      setLoading(false);
      setMessage('Vote submitted successfully!');
      setMessageType('success');
      
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
      setSelectedChoices([index.toString()]);
    } else {
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
    const methods = ['Single Choice', 'Ranked Choice', 'Quadratic Voting', 'Multiple Choice'];
    return methods[methodId] || 'Unknown Method';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">ZKVote</h1>
                <p className="mt-1 text-indigo-100">Private and Secure Blockchain Voting Platform</p>
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
        {loading && !topicDetails ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : topicDetails ? (
          <div className="space-y-6">
            {/* Topic Details Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{topicDetails.name}</h2>
                    <p className="text-gray-600 mb-4">{topicDetails.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      topicDetails.isVotingOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {topicDetails.isVotingOpen ? 'Voting Open' : 'Voting Closed'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Voting Method</p>
                    <p className="font-semibold text-gray-800">{getVotingMethodName(topicDetails.method)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-800">{topicDetails.location || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Start Time</p>
                    <p className="font-semibold text-gray-800">{topicDetails.startTime}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">End Time</p>
                    <p className="font-semibold text-gray-800">{topicDetails.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Voting Options Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Voting Options</h3>
                
                <div className="space-y-3 mb-8">
                  {topicDetails.choices.map((choice, index) => (
                    <div 
                      key={index}
                      onClick={() => handleChoiceSelection(index)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        isChoiceSelected(index) 
                          ? 'border-2 border-indigo-500 bg-indigo-50 shadow-sm' 
                          : 'border border-gray-200 hover:border-indigo-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center border-2 ${
                          isChoiceSelected(index) 
                            ? 'border-indigo-500 bg-indigo-500' 
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
            
            {/* Voting Form Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Cast Your Vote</h3>
                
                {/* Location Verification */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Location Verification</p>
                    {ipLoading ? (
                      <span className="flex items-center text-sm text-gray-600">
                        <svg className="animate-spin h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : ipData ? (
                      <div className="flex items-center">
                        {locationVerified ? (
                          <>
                            <span className="inline-block h-2.5 w-2.5 rounded-full mr-2 bg-green-500"></span>
                            <span className="text-sm font-medium text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <span className="inline-block h-2.5 w-2.5 rounded-full mr-2 bg-red-500"></span>
                            <span className="text-sm font-medium text-red-600">Not Verified</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={fetchIPData}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                      >
                        Verify My Location
                      </button>
                    )}
                  </div>
                  
                  {ipData && electionDetails && (
                    <div className="mt-4 text-xs text-gray-600">
                      <p>Detected Location: {ipData.city}, {ipData.region_name}, {ipData.country_name}</p>
                      <p>ZIP Code: {ipData.zip || 'Not available'}</p>
                    </div>
                  )}
                  
                  {ipError && (
                    <p className="mt-2 text-xs text-red-500">{ipError}</p>
                  )}
                </div>
                
                {/* Vote Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nullifier (Secret Key) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nullifier}
                      onChange={(e) => setNullifier(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your commitment (hex or text)"
                    />
                    <p className="mt-1.5 text-sm text-gray-500">
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Location proof (if needed)"
                    />
                  </div>
                  
                  <ZKEmailModal />
                  
                  <button
                    onClick={submitVote}
                    disabled={!connected || loading || !topicDetails.isVotingOpen || !nullifier || !commitment || selectedChoices.length === 0 || !locationVerified}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all disabled:from-gray-400 disabled:to-gray-500 font-medium text-lg shadow-sm"
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
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">No voting topic selected</h3>
            <p className="text-gray-500 mb-6">Please check the URL and try again</p>
            <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Home
            </Link>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          ZKVote - Privacy-Preserving Blockchain Voting Platform
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/tracking" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Track Your Vote
          </Link>
        </div>
      </div>
      
      {/* NFT Modal */}
      {showNFTModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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