import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ZKEmailModal from './zkproof';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { FaSmile, FaMeh, FaFrown, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

// Contract ABI
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
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
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
      }
    ],
    "name": "mintParticipationNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getNFTDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
const PINATA_API_KEY = '8c60abd9f27467cf2101';
const PINATA_SECRET_API_KEY = 'd1f1282cb1531dcdd08f0b33e2dad886e908e878b8733571e5b9d4f36f90eae9';

const NFTViewer = ({ commitment, nullifier, onClose, onMintNFT }) => {
  const { currentUser } = useAuth();
  const [ipfsHash, setIpfsHash] = useState('');
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [nftDetails, setNftDetails] = useState(null);
  const [nftImage, setNftImage] = useState('');
  const [nftName, setNftName] = useState('My Voting NFT');
  const [nftDescription, setNftDescription] = useState('This NFT represents my anonymous vote in the ZKVote system');
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const generateNFTImage = async () => {
    const svg = `
      <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#4f46e5"/>
        <circle cx="250" cy="250" r="200" fill="#312e81"/>
        <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="40" font-family="Arial">ZKVote</text>
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Voting Participation</text>
        <text x="50%" y="60%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">${commitment.slice(0, 12)}...</text>
      </svg>
    `;
    
    try {
      const formData = new FormData();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      formData.append('file', blob, 'vote-nft.svg');
      
      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        }
      });
      
      const imageHash = res.data.IpfsHash;
      setNftImage(`https://ipfs.io/ipfs/${imageHash}`);
      return imageHash;
    } catch (error) {
      console.error('Error uploading NFT image:', error);
      throw error;
    }
  };

  const generateMetadata = async (imageHash) => {
    const metadata = {
      name: nftName,
      description: nftDescription,
      image: `https://ipfs.io/ipfs/${imageHash}`,
      attributes: [
        {
          trait_type: "Commitment",
          value: commitment
        },
        {
          trait_type: "Nullifier",
          value: nullifier
        },
        {
          trait_type: "Type",
          value: "Voting Participation"
        }
      ]
    };
    
    try {
      const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        }
      });
      
      return res.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      throw error;
    }
  };

  const submitFeedback = async () => {
    // if (!selectedSentiment || !feedbackText.trim()) {
    //   alert("Please select a sentiment and provide feedback");
    //   return;
    // }
  
    setIsSubmittingFeedback(true);
    
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: feedbackText,
          userId: currentUser?.uid,
          electionId: "election-1",
          sentiment: selectedSentiment // Include the selected sentiment
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      
      if (currentUser) {
        const db = getFirestore();
        await setDoc(doc(db, "sentiments", `${currentUser.uid}_${Date.now()}`), {
          text: feedbackText,
          sentiment: selectedSentiment,
          serverResponse: result,
          electionId: "election-1",
          userId: currentUser.uid,
          timestamp: new Date().toISOString()
        });
      }
  
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(`Failed to submit feedback: ${error.message}. Please check your connection and try again.`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleMintNFT = async () => {
    try {
      setMinting(true);
      const imageHash = await generateNFTImage();
      const metadataHash = await generateMetadata(imageHash);
      await onMintNFT(`ipfs://${metadataHash}`);
      
      setMinted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMinting(false);
      alert('Failed to mint NFT: ' + error.message);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 relative overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
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
              <label className="block text-gray-700 text-sm font-medium mb-2">NFT Name</label>
              <input
                type="text"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="My Voting NFT"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">NFT Description</label>
              <textarea
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Description of your voting NFT"
                rows="3"
              />
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
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6 border border-gray-200"
          >
            <div className="flex items-center justify-center mb-4">
              <FaCheckCircle className="text-4xl text-green-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">NFT Minted Successfully!</h2>
            </div>
            
            <div className="relative mx-auto w-full h-64 rounded-lg overflow-hidden border-4 border-indigo-600 shadow-lg mb-6">
              {nftImage ? (
                <img src={nftImage} alt="Voting NFT" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  <span className="text-2xl">NFT Preview</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">NFT Name</p>
                <p className="text-sm bg-gray-100 p-2 rounded font-medium text-gray-700">{nftName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm bg-gray-100 p-2 rounded font-medium text-gray-700">{nftDescription}</p>
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
          </motion.div>

          {!feedbackSubmitted && !isClosing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} // Add exit animation for smoother closing
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Share your voting experience</h3>

              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setSelectedSentiment('positive')}
                  className={`p-3 rounded-full ${selectedSentiment === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  <FaSmile className="text-2xl" />
                  <span className="text-xs mt-1 block">Positive</span>
                </button>
                <button
                  onClick={() => setSelectedSentiment('neutral')}
                  className={`p-3 rounded-full ${selectedSentiment === 'neutral' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  <FaMeh className="text-2xl" />
                  <span className="text-xs mt-1 block">Neutral</span>
                </button>
                <button
                  onClick={() => setSelectedSentiment('negative')}
                  className={`p-3 rounded-full ${selectedSentiment === 'negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  <FaFrown className="text-2xl" />
                  <span className="text-xs mt-1 block">Negative</span>
                </button>
              </div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your voting experience..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                rows="3"
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  disabled={isSubmittingFeedback}
                  className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
                >
                  Skip
                </button>
                <button
                  onClick={submitFeedbackAndClose}
                  disabled={isSubmittingFeedback}
                  className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} // Add exit animation here as well
      className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg"
            >
              Thank you for your feedback! Your response helps improve the voting experience.
            </motion.div>
          )}
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
  const [topicIdInput, setTopicIdInput] = useState('');
  const [topicId, setTopicId] = useState(null);
  const { currentUser } = useAuth();

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
        query(collection(db, "elections"), 
        where("id", "==", id)
      ));
      
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
  
  // Handle topic ID submission
  const handleTopicIdSubmit = () => {
    if (!topicIdInput) {
      setMessage('Please enter a topic ID');
      setMessageType('error');
      return;
    }
    
    try {
      const numericId = ethers.BigNumber.from(topicIdInput).toNumber();
      setTopicId(numericId);
      setTopicIdInput('');
    } catch (error) {
      setMessage('Invalid topic ID format');
      setMessageType('error');
    }
  };
  
  // Fetch topic details when topicId or contract changes
  useEffect(() => {
    const fetchData = async () => {
      if (topicId !== null) {
        await fetchTopicDetails();
      }
    };
    fetchData();
  }, [topicId, contract]);

  // Fetch topic details
  const fetchTopicDetails = async () => {
    if (!contract || topicId === null) return;
    
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
      
      // 2. Fetch Firebase election details using the string version of topicId
      await fetchElectionDetails(topicId.toString());
      
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
    if (!contract || topicId === null || !nullifier || !commitment || !topicDetails) {
      setMessage('Please fill all required fields');
      setMessageType('error');
      return;
    }
    
    if (!selectedChoices.length) {
      setMessage('Please select at least one choice');
      setMessageType('error');
      return;
    }
    
    // if (!locationVerified) {
    //   setMessage('Your location does not match the required location for this election');
    //   setMessageType('error');
    //   return;
    // }
    
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 pt-10">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-200 pt-12">
          <div className="bg-gradient-to-r from-[#99BC85] to-[#7FA56D] px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">ZKVote</h1>
                <p className="mt-1 text-indigo-100">Private and Secure Blockchain Voting Platform</p>
              </div>
              <div className="mt-4 md:mt-0 text-black">
                {connected ? (
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 text-black py-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">
                      {account.substring(0, 6)}...{account.substring(account.length - 4)}
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={connectWallet} 
                    className="px-5 py-2.5 text-black bg-white bg-opacity-10 hover:bg-opacity-20  rounded-lg shadow transition-all font-medium border border-white border-opacity-20"
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

        {/* Topic ID Input */}
        {!topicId && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Enter Voting Topic ID</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={topicIdInput}
                onChange={(e) => setTopicIdInput(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter topic ID (e.g., 1, 2, 3...)"
              />
              <button
                onClick={handleTopicIdSubmit}
                className="px-6 py-2 bg-[#7FA56D] pointer-cursor text-white rounded-lg transition-all font-medium"
              >
                Load Topic
              </button>
            </div>
          </div>
        )}

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
                    disabled={!connected || loading || !topicDetails.isVotingOpen || !nullifier || !commitment || selectedChoices.length === 0 }
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
                    ) : 'Submit Vote'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
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