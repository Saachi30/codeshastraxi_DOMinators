import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const AdminPage= () => {
  // Connect to Ethereum
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Contract data
  const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
  
  // Component state
  const [topicId, setTopicId] = useState('');
  const [topicDetails, setTopicDetails] = useState(null);
  const [voterCommitment, setVoterCommitment] = useState('');
  const [voterDetails, setVoterDetails] = useState(null);
  
  // Register voters form state
  const [commitments, setCommitments] = useState(['']);
  const [votingPowers, setVotingPowers] = useState(['']);
  const [disputeCredits, setDisputeCredits] = useState(['']);
  const [initialCredits, setInitialCredits] = useState(['']);

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        // Check if ethereum is available
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Provider.listAccounts();
          
          const contractABI = [
            // ABI from the document
            {"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"disputeId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"topicId","type":"uint256"}],"name":"DisputeRaised","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"disputeId","type":"uint256"},{"indexed":false,"internalType":"enum ZKVote.DisputeStatus","name":"status","type":"uint8"}],"name":"DisputeResolved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"tokenURI","type":"string"}],"name":"NFTMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"topicId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"TopicCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"topicId","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"nullifier","type":"bytes32"}],"name":"VoteCast","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"commitment","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"votingPower","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"disputeCredits","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"remainingCredits","type":"uint256"}],"name":"VoterRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"topicId","type":"uint256"}],"name":"VotingResultsFinalized","type":"event"},{"inputs":[{"internalType":"address","name":"_validator","type":"address"}],"name":"addValidator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string[]","name":"_choices","type":"string[]"},{"internalType":"uint256","name":"_duration","type":"uint256"},{"internalType":"string","name":"_locationHash","type":"string"},{"internalType":"enum ZKVote.VotingMethod","name":"_method","type":"uint8"},{"internalType":"uint256","name":"_minVotingPower","type":"uint256"}],"name":"createTopic","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"disputeCreditCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"disputePeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"disputes","outputs":[{"internalType":"uint256","name":"topicId","type":"uint256"},{"internalType":"bytes32","name":"nullifier","type":"bytes32"},{"internalType":"string","name":"reason","type":"string"},{"internalType":"address","name":"reporter","type":"address"},{"internalType":"enum ZKVote.DisputeStatus","name":"status","type":"uint8"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"resolution","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"topicId","type":"uint256"}],"name":"finalizeResults","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"disputeId","type":"uint256"}],"name":"getDisputeDetails","outputs":[{"internalType":"uint256","name":"topicId","type":"uint256"},{"internalType":"string","name":"reason","type":"string"},{"internalType":"enum ZKVote.DisputeStatus","name":"status","type":"uint8"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"resolution","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getNFTDetails","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"tokenURI","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"topicId","type":"uint256"}],"name":"getTopicDetails","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string[]","name":"choices","type":"string[]"},{"internalType":"enum ZKVote.VotingMethod","name":"method","type":"uint8"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"minVotingPower","type":"uint256"},{"internalType":"bool","name":"isVotingOpen","type":"bool"},{"internalType":"uint256[]","name":"voteCounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"voterCommitment","type":"bytes32"}],"name":"getVoterDetails","outputs":[{"internalType":"uint256","name":"disputeCredits","type":"uint256"},{"internalType":"uint256","name":"votingPower","type":"uint256"},{"internalType":"uint256","name":"remainingCredits","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"tokenURI","type":"string"},{"internalType":"bytes32","name":"nullifier","type":"bytes32"},{"internalType":"bytes32","name":"voterCommitment","type":"bytes32"}],"name":"mintParticipationNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"topicId","type":"uint256"},{"internalType":"bytes32","name":"nullifier","type":"bytes32"},{"internalType":"bytes32","name":"voterCommitment","type":"bytes32"},{"internalType":"string","name":"reason","type":"string"}],"name":"raiseDispute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"commitments","type":"bytes32[]"},{"internalType":"uint256[]","name":"votingPowers","type":"uint256[]"},{"internalType":"uint256[]","name":"disputeCredits","type":"uint256[]"},{"internalType":"uint256[]","name":"initialCredits","type":"uint256[]"}],"name":"registerVoters","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"disputeId","type":"uint256"},{"internalType":"enum ZKVote.DisputeStatus","name":"status","type":"uint8"},{"internalType":"string","name":"resolution","type":"string"}],"name":"resolveDispute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"topicCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"validators","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"topicId","type":"uint256"},{"internalType":"bytes32","name":"nullifier","type":"bytes32"},{"internalType":"bytes32","name":"voterCommitment","type":"bytes32"},{"internalType":"string","name":"locationProof","type":"string"},{"internalType":"uint256[]","name":"voteData","type":"uint256[]"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}
          ];

          const contractInstance = new ethers.Contract(contractAddress, contractABI, web3Provider.getSigner());
          
          setProvider(web3Provider);
          setSigner(web3Provider.getSigner());
          setContract(contractInstance);
          setAccount(accounts[0]);
        } else {
          setError('Ethereum wallet not detected. Please install MetaMask.');
        }
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError('Failed to connect to the blockchain. Please check your MetaMask connection.');
      }
    };

    initContract();
  }, []);

  // Helper function to convert string to bytes32
  const stringToBytes32 = (str) => {
    try {
      // If it's already a hex string with 0x prefix
      if (str.startsWith('0x') && str.length === 66) {
        return str;
      }
      // If it's a hash or random hex (without 0x)
      else if (str.length === 64) {
        return '0x' + str;
      }
      // If it's a normal string
      else {
        return ethers.utils.formatBytes32String(str);
      }
    } catch (error) {
      console.error('Error converting to bytes32:', error);
      return ethers.utils.formatBytes32String(str);
    }
  };

  // Add/remove voter fields
  const addVoterField = () => {
    setCommitments([...commitments, '']);
    setVotingPowers([...votingPowers, '']);
    setDisputeCredits([...disputeCredits, '']);
    setInitialCredits([...initialCredits, '']);
  };

  const removeVoterField = (index) => {
    if (commitments.length > 1) {
      setCommitments(commitments.filter((_, i) => i !== index));
      setVotingPowers(votingPowers.filter((_, i) => i !== index));
      setDisputeCredits(disputeCredits.filter((_, i) => i !== index));
      setInitialCredits(initialCredits.filter((_, i) => i !== index));
    }
  };

  // Handle input change for voter fields
  const handleCommitmentChange = (index, value) => {
    const newCommitments = [...commitments];
    newCommitments[index] = value;
    setCommitments(newCommitments);
  };

  const handleVotingPowerChange = (index, value) => {
    const newVotingPowers = [...votingPowers];
    newVotingPowers[index] = value;
    setVotingPowers(newVotingPowers);
  };

  const handleDisputeCreditsChange = (index, value) => {
    const newDisputeCredits = [...disputeCredits];
    newDisputeCredits[index] = value;
    setDisputeCredits(newDisputeCredits);
  };

  const handleInitialCreditsChange = (index, value) => {
    const newInitialCredits = [...initialCredits];
    newInitialCredits[index] = value;
    setInitialCredits(newInitialCredits);
  };

  // Register voters
  const registerVotersHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Convert inputs to proper format
      const commitmentBytes32 = commitments.map(stringToBytes32);
      const votingPowersNum = votingPowers.map(vp => ethers.BigNumber.from(vp));
      const disputeCreditsNum = disputeCredits.map(dc => ethers.BigNumber.from(dc));
      const initialCreditsNum = initialCredits.map(ic => ethers.BigNumber.from(ic));
      
      // Call the contract function
      const tx = await contract.registerVoters(
        commitmentBytes32,
        votingPowersNum,
        disputeCreditsNum,
        initialCreditsNum
      );

      await tx.wait();
      setSuccess('Voters registered successfully!');
    } catch (err) {
      console.error('Error registering voters:', err);
      setError(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get Topic Details
  const getTopicDetailsHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTopicDetails(null);

    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      if (!topicId || isNaN(parseInt(topicId))) {
        throw new Error('Invalid Topic ID');
      }

      const details = await contract.getTopicDetails(topicId);
      
      // Format the details for display
      const formattedDetails = {
        name: details[0],
        description: details[1],
        choices: details[2],
        method: details[3],
        startTime: new Date(details[4].toNumber() * 1000).toLocaleString(),
        endTime: new Date(details[5].toNumber() * 1000).toLocaleString(),
        location: details[6],
        minVotingPower: details[7].toString(),
        isVotingOpen: details[8],
        voteCounts: details[9].map(count => count.toString())
      };

      setTopicDetails(formattedDetails);
    } catch (err) {
      console.error('Error getting topic details:', err);
      setError(`Failed to fetch topic details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get Voter Details
  const getVoterDetailsHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVoterDetails(null);

    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      if (!voterCommitment) {
        throw new Error('Voter commitment is required');
      }

      const commitment = stringToBytes32(voterCommitment);
      const details = await contract.getVoterDetails(commitment);

      const formattedDetails = {
        disputeCredits: details[0].toString(),
        votingPower: details[1].toString(),
        remainingCredits: details[2].toString()
      };

      setVoterDetails(formattedDetails);
    } catch (err) {
      console.error('Error getting voter details:', err);
      setError(`Failed to fetch voter details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">ZKVote Dashboard</h1>
          <div className="mt-2 flex flex-wrap items-center justify-between">
            <p className="text-sm opacity-90">Contract: {contractAddress}</p>
            {account && (
              <div className="mt-2 lg:mt-0 flex items-center bg-white bg-opacity-20 rounded-full px-4 py-1">
                <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm font-medium truncate">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm">
            <p>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Register Voters Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Register Voters</h2>
              <form onSubmit={registerVotersHandler}>
                {commitments.map((commitment, index) => (
                  <div key={index} className="mb-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">Voter #{index + 1}</h3>
                      <button 
                        type="button" 
                        onClick={() => removeVoterField(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commitment (bytes32)
                      </label>
                      <input
                        type="text"
                        value={commitment}
                        onChange={(e) => handleCommitmentChange(index, e.target.value)}
                        placeholder="0x... or string"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Voting Power
                      </label>
                      <input
                        type="number"
                        value={votingPowers[index]}
                        onChange={(e) => handleVotingPowerChange(index, e.target.value)}
                        placeholder="1"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                        min="1"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dispute Credits
                      </label>
                      <input
                        type="number"
                        value={disputeCredits[index]}
                        onChange={(e) => handleDisputeCreditsChange(index, e.target.value)}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Initial Credits
                      </label>
                      <input
                        type="number"
                        value={initialCredits[index]}
                        onChange={(e) => handleInitialCreditsChange(index, e.target.value)}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={addVoterField}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <span className="mr-1">+</span> Add Voter
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Register Voters'}
                  </button>
                </div>
              </form>
            </div>

            {/* Get Voter Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Get Voter Details</h2>
              <form onSubmit={getVoterDetailsHandler}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voter Commitment (bytes32)
                  </label>
                  <input
                    type="text"
                    value={voterCommitment}
                    onChange={(e) => setVoterCommitment(e.target.value)}
                    placeholder="0x... or string"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Get Voter Details'}
                    </button>
                  </div>
                </form>
                
                {voterDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-gray-700 mb-2">Voter Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Voting Power:</span> {voterDetails.votingPower}</p>
                      <p><span className="font-medium">Dispute Credits:</span> {voterDetails.disputeCredits}</p>
                      <p><span className="font-medium">Remaining Credits:</span> {voterDetails.remainingCredits}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
  
            {/* Right Column */}
            <div className="space-y-8">
              {/* Get Topic Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Get Topic Details</h2>
                <form onSubmit={getTopicDetailsHandler}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic ID
                    </label>
                    <input
                      type="number"
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      placeholder="1"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Get Topic Details'}
                    </button>
                  </div>
                </form>
                
                {topicDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">{topicDetails.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{topicDetails.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Voting Method</h4>
                        <p>{topicDetails.method === 0 ? 'Single Choice' : 
                           topicDetails.method === 1 ? 'Approval Voting' : 
                           topicDetails.method === 2 ? 'Ranked Choice' : 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Voting Period</h4>
                        <p className="text-sm">Start: {topicDetails.startTime}</p>
                        <p className="text-sm">End: {topicDetails.endTime}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Status</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          topicDetails.isVotingOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {topicDetails.isVotingOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Minimum Voting Power</h4>
                        <p>{topicDetails.minVotingPower}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Location</h4>
                        <p className="break-all text-sm">{topicDetails.location}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Choices</h4>
                        <div className="mt-2 space-y-2">
                          {topicDetails.choices.map((choice, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-sm">{choice}</span>
                              <span className="text-sm font-medium">
                                {topicDetails.voteCounts[idx]} votes
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dashboard Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">ZKVote Information</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    This dashboard allows you to interact with the ZKVote smart contract. You can register voters, 
                    view topic details, and check voter information.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-blue-800 mb-2">Connected Account</h3>
                    {account ? (
                      <p className="text-blue-700">{account}</p>
                    ) : (
                      <p className="text-red-600">No account connected. Please connect your wallet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AdminPage;