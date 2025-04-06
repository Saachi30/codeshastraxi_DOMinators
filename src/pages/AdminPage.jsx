
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json'; 
import EmailZKPGenerator from './BulkZKP';
import ZKEmailModal from './zkproof';
const AdminPage = () => {
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
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Provider.listAccounts();
          
          const contractABI = abi;

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
      if (str.startsWith('0x') && str.length === 66) return str;
      else if (str.length === 64) return '0x' + str;
      else return ethers.utils.formatBytes32String(str);
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
      if (!contract) throw new Error('Contract not initialized');

      const commitmentBytes32 = commitments.map(stringToBytes32);
      const votingPowersNum = votingPowers.map(vp => ethers.BigNumber.from(vp));
      const disputeCreditsNum = disputeCredits.map(dc => ethers.BigNumber.from(dc));
      const initialCreditsNum = initialCredits.map(ic => ethers.BigNumber.from(ic));
      
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
      if (!contract) throw new Error('Contract not initialized');
      if (!topicId || isNaN(parseInt(topicId))) throw new Error('Invalid Topic ID');

      const details = await contract.getTopicDetails(topicId);
      
      setTopicDetails({
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
      });
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
      if (!contract) throw new Error('Contract not initialized');
      if (!voterCommitment) throw new Error('Voter commitment is required');

      const commitment = stringToBytes32(voterCommitment);
      const details = await contract.getVoterDetails(commitment);

      setVoterDetails({
        disputeCredits: details[0].toString(),
        votingPower: details[1].toString(),
        remainingCredits: details[2].toString()
      });
    } catch (err) {
      console.error('Error getting voter details:', err);
      setError(`Failed to fetch voter details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-20 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  ZKVote Admin Portal
                </h1>
                <p className="text-sm text-indigo-300">Zero-Knowledge Voting Management</p>
              </div>
            </div>
            {account && (
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse absolute -right-1 -top-1 ring-2 ring-green-400 ring-opacity-50"></div>
                  <div className="bg-gray-800 bg-opacity-80 rounded-full px-4 py-2 border border-indigo-500 shadow-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    <span className="text-sm font-mono truncate max-w-xs">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-gray-500 break-all">Contract: {contractAddress}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 rounded-lg shadow-inner flex items-start animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900/50 border-l-4 border-green-500 text-green-100 p-4 rounded-lg shadow-inner flex items-start animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Register Voters Card */}
            <div className="bg-gray-800/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all hover:border-blue-500/30">
              <div className="bg-gradient-to-r from-blue-900/70 to-blue-800/70 px-6 py-4 border-b border-blue-500/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                    </svg>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-200">
                      Register Voters
                    </span>
                  </h2>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-900/30 text-blue-200">
                    {commitments.length} {commitments.length === 1 ? 'Voter' : 'Voters'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={registerVotersHandler}>
                  <div className="space-y-4">
                    {commitments.map((commitment, index) => (
                      <div key={index} className="relative p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 group hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-blue-300 flex items-center">
                            <span className="bg-blue-600/80 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
                              #{index + 1}
                            </span>
                            Voter Credentials
                          </h3>
                          {commitments.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeVoterField(index)}
                              className="text-red-400 hover:text-red-300 text-sm flex items-center p-1 rounded-full hover:bg-red-900/30 transition-colors"
                              title="Remove voter"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Commitment (bytes32)
                            </label>
                            <input
                              type="text"
                              value={commitment}
                              onChange={(e) => handleCommitmentChange(index, e.target.value)}
                              placeholder="0x... or string"
                              className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Voting Power
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={votingPowers[index]}
                                  onChange={(e) => handleVotingPowerChange(index, e.target.value)}
                                  placeholder="1"
                                  className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                                  required
                                  min="1"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Dispute Credits
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={disputeCredits[index]}
                                  onChange={(e) => handleDisputeCreditsChange(index, e.target.value)}
                                  placeholder="0"
                                  className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                                  required
                                  min="0"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Initial Credits
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={initialCredits[index]}
                                onChange={(e) => handleInitialCreditsChange(index, e.target.value)}
                                placeholder="0"
                                className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                                required
                                min="0"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ZKEmailModal/>
                        <EmailZKPGenerator/>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-6">
                    <button
                      type="button"
                      onClick={addVoterField}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600/50 hover:border-blue-500/50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Voter
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Register Voters
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Voter Details Card */}
            <div className="bg-gray-800/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all hover:border-purple-500/30">
              <div className="bg-gradient-to-r from-purple-900/70 to-purple-800/70 px-6 py-4 border-b border-purple-500/20">
                <h2 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-200">
                    Voter Details
                  </span>
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={getVoterDetailsHandler}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Voter Commitment (bytes32)
                    </label>
                    <div className="flex rounded-lg overflow-hidden shadow-sm">
                      <input
                        type="text"
                        value={voterCommitment}
                        onChange={(e) => setVoterCommitment(e.target.value)}
                        placeholder="0x... or string"
                        className="flex-grow p-3 bg-gray-700/50 border border-gray-600/50 focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 text-gray-100 placeholder-gray-400 transition-all"
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 flex items-center transition-colors"
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                
                {voterDetails && (
                  <div className="mt-6 p-5 bg-gray-700/50 rounded-xl border border-gray-600/50">
                    <h3 className="font-bold text-purple-300 mb-4 flex items-center text-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                      </svg>
                      Voter Statistics
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-4 rounded-lg text-center border border-blue-500/20">
                        <div className="text-xs font-medium text-blue-300 mb-1">Voting Power</div>
                        <div className="text-2xl font-bold text-blue-100">{voterDetails.votingPower}</div>
                        <div className="text-xs text-blue-400 mt-1">Vote Weight</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-4 rounded-lg text-center border border-purple-500/20">
                        <div className="text-xs font-medium text-purple-300 mb-1">Dispute Credits</div>
                        <div className="text-2xl font-bold text-purple-100">{voterDetails.disputeCredits}</div>
                        <div className="text-xs text-purple-400 mt-1">Available</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-4 rounded-lg text-center border border-green-500/20">
                        <div className="text-xs font-medium text-green-300 mb-1">Remaining</div>
                        <div className="text-2xl font-bold text-green-100">{voterDetails.remainingCredits}</div>
                        <div className="text-xs text-green-400 mt-1">Credits Left</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Topic Details Card */}
            <div className="bg-gray-800/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all hover:border-cyan-500/30">
              <div className="bg-gradient-to-r from-cyan-900/70 to-cyan-800/70 px-6 py-4 border-b border-cyan-500/20">
                <h2 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-teal-200">
                    Topic Details
                  </span>
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={getTopicDetailsHandler}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Topic ID
                    </label>
                    <div className="flex rounded-lg overflow-hidden shadow-sm">
                      <input
                        type="number"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        placeholder="1"
                        className="flex-grow p-3 bg-gray-700/50 border border-gray-600/50 focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 text-gray-100 placeholder-gray-400 transition-all"
                        required
                        min="0"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 flex items-center transition-colors"
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                
                {topicDetails && (
                  <div className="mt-6 p-5 bg-gray-700/50 rounded-xl border border-gray-600/50">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="text-2xl font-bold text-cyan-300">{topicDetails.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{topicDetails.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        topicDetails.isVotingOpen 
                          ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                          : 'bg-red-900/50 text-red-300 border border-red-500/30'
                      }`}>
                        {topicDetails.isVotingOpen ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-700/70 p-4 rounded-lg border border-gray-600/50">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Voting Method</div>
                        <div className="font-medium text-white">
                          {topicDetails.method === 0 ? 'Single Choice' : 
                           topicDetails.method === 1 ? 'Approval Voting' : 
                           topicDetails.method === 2 ? 'Ranked Choice' : 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/70 p-4 rounded-lg border border-gray-600/50">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Min Voting Power</div>
                        <div className="font-medium text-white">{topicDetails.minVotingPower}</div>
                      </div>
                      
                      <div className="bg-gray-700/70 p-4 rounded-lg border border-gray-600/50">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Start Time</div>
                        <div className="text-sm text-gray-300">{topicDetails.startTime}</div>
                      </div>
                      
                      <div className="bg-gray-700/70 p-4 rounded-lg border border-gray-600/50">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">End Time</div>
                        <div className="text-sm text-gray-300">{topicDetails.endTime}</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm font-bold text-gray-300 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Location Hash
                      </div>
                      <div className="text-xs font-mono bg-gray-900/50 p-3 rounded-lg break-all border border-gray-700/50">
                        {topicDetails.location}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-bold text-gray-300 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 100-6 3 3 0 000 6zM17 6a3 3 0 100-6 3 3 0 000 6zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Voting Results
                      </div>
                      <div className="space-y-3">
                        {topicDetails.choices.map((choice, idx) => {
                          const totalVotes = topicDetails.voteCounts.reduce((a, b) => a + parseInt(b), 0);
                          const percentage = totalVotes > 0 
                            ? Math.round((parseInt(topicDetails.voteCounts[idx]) / totalVotes * 100) 
                            )
                            : 0;
                          
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="truncate max-w-[50%]">{choice}</span>
                                <span className="font-medium">
                                  {topicDetails.voteCounts[idx]} votes ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Dashboard Info Card */}
            <div className="bg-gray-800/80 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all hover:border-indigo-500/30">
              <div className="bg-gradient-to-r from-indigo-900/70 to-indigo-800/70 px-6 py-4 border-b border-indigo-500/20">
                <h2 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-violet-200">
                    Dashboard Info
                  </span>
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <p className="text-gray-300 leading-relaxed">
                    This dashboard allows administrators to manage the ZKVote smart contract. 
                    Register voters, monitor voting topics, and verify voter credentials with 
                    zero-knowledge proofs for maximum privacy and security.
                  </p>
                  
                  <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600/50">
                    <div className="text-lg font-bold text-indigo-300 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Connected Wallet
                    </div>
                    {account ? (
                      <div className="space-y-2">
                        <div className="text-xs font-mono bg-gray-900/50 p-3 rounded-lg break-all">
                          {account}
                        </div>
                        <div className="flex items-center text-xs text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Wallet connected successfully
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        No wallet connected
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-700/50 p-5 rounded-xl border border-gray-600/50">
                    <div className="text-lg font-bold text-indigo-300 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Quick Actions
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 p-3 rounded-lg border border-gray-500/50 flex items-center justify-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        New Topic
                      </button>
                      <button className="bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 p-3 rounded-lg border border-gray-500/50 flex items-center justify-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        View All Voters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              ZKVote Admin Dashboard v1.0
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;