import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';

const DisputeManagement = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isValidator, setIsValidator] = useState(false);
  const [disputeCredits, setDisputeCredits] = useState(0);
  
  // Contract address and ABI
  const contractAddress = "0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC";
  const contractABI = abi;
  
  // Dispute states
  const [topicId, setTopicId] = useState('');
  const [nullifier, setNullifier] = useState('');
  const [voterCommitment, setVoterCommitment] = useState('');
  const [reason, setReason] = useState('');
  const [disputeId, setDisputeId] = useState('');
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState(0);
  const [disputeDetails, setDisputeDetails] = useState(null);
  const [fetchDisputeId, setFetchDisputeId] = useState('');
  
  // Transaction states
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          
          setProvider(provider);
          setContract(contract);
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Check validator status
          const validatorStatus = await contract.validators(accounts[0]);
          setIsValidator(validatorStatus);
          
          // Load dispute credits
          if (validatorStatus) {
            const credits = await contract.getValidatorDetails(accounts[0]);
            setDisputeCredits(credits.disputeCredits.toString());
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              window.location.reload();
            } else {
              setIsConnected(false);
              setAccount('');
            }
          });
        } catch (error) {
          console.error("Connection error:", error);
          setError("Failed to connect. Please check MetaMask.");
        }
      } else {
        setError("Please install MetaMask to continue.");
      }
    };

    init();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const createDispute = async (e) => {
    e.preventDefault();
    if (!contract || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.raiseDispute(
        ethers.BigNumber.from(topicId),
        ethers.utils.hexlify(nullifier),
        ethers.utils.hexlify(voterCommitment),
        reason
      );
      
      setTxHash(tx.hash);
      await tx.wait();
      setSuccess('Dispute raised successfully!');
      
      // Refresh credits if validator
      if (isValidator) {
        const credits = await contract.getValidatorDetails(account);
        setDisputeCredits(credits.disputeCredits.toString());
      }
      
      // Reset form
      setTopicId('');
      setNullifier('');
      setVoterCommitment('');
      setReason('');
    } catch (err) {
      console.error("Error raising dispute:", err);
      setError(err.message || "Failed to raise dispute");
    } finally {
      setIsLoading(false);
    }
  };

  const resolveDispute = async (e) => {
    e.preventDefault();
    if (!contract || !isConnected || !isValidator) {
      setError("Validator privileges required");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.resolveDispute(
        ethers.BigNumber.from(disputeId),
        ethers.BigNumber.from(status),
        resolution
      );
      
      setTxHash(tx.hash);
      await tx.wait();
      setSuccess('Dispute resolved successfully!');
      
      // Refresh credits
      const credits = await contract.getValidatorDetails(account);
      setDisputeCredits(credits.disputeCredits.toString());
      
      // Reset form
      setDisputeId('');
      setStatus(0);
      setResolution('');
    } catch (err) {
      console.error("Error resolving dispute:", err);
      setError(err.message || "Failed to resolve dispute");
    } finally {
      setIsLoading(false);
    }
  };

  const getDisputeDetails = async (e) => {
    e.preventDefault();
    if (!contract || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const details = await contract.getDisputeDetails(ethers.BigNumber.from(fetchDisputeId));
      
      setDisputeDetails({
        topicId: details.topicId.toString(),
        reason: details.reason,
        status: parseInt(details.status),
        statusText: ['Pending', 'Accepted', 'Rejected'][parseInt(details.status)],
        timestamp: new Date(details.timestamp.toNumber() * 1000).toLocaleString(),
        resolution: details.resolution
      });
    } catch (err) {
      console.error("Error fetching dispute details:", err);
      setError(err.message || "Failed to fetch dispute details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            ZKVote Dispute Center
          </h1>
          <p className="text-gray-400">Manage and resolve voting disputes with zero-knowledge proofs</p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 mb-8 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
              <div>
                <h2 className="text-lg font-semibold">
                  {isConnected ? 'Connected to Ethereum' : 'Not Connected'}
                </h2>
                {isConnected && (
                  <p className="text-sm text-gray-400 font-mono truncate max-w-xs">
                    {account}
                  </p>
                )}
              </div>
            </div>
            
            {isValidator && (
              <div className="bg-gradient-to-r from-green-900/40 to-green-800/40 px-4 py-2 rounded-lg border border-green-500/30 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-green-300">
                  Validator • {disputeCredits} Dispute Credits Available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 rounded-lg mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border-l-4 border-green-500 text-green-100 p-4 rounded-lg mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{success}</p>
          </div>
        )}

        {txHash && (
          <div className="bg-blue-900/50 border-l-4 border-blue-500 text-blue-100 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p>Transaction submitted</p>
                <a 
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:underline text-sm"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raise Dispute Card */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg border border-gray-700/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-900/70 to-blue-800/70 px-6 py-4 border-b border-blue-500/20">
              <h2 className="text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Raise a Dispute
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={createDispute}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Topic ID</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nullifier (hex)</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                      value={nullifier}
                      onChange={(e) => setNullifier(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Voter Commitment (hex)</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                      value={voterCommitment}
                      onChange={(e) => setVoterCommitment(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                    <textarea
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition-all"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe the issue..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !isConnected}
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Submit Dispute'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Resolve Dispute Card */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg border border-gray-700/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-purple-900/70 to-purple-800/70 px-6 py-4 border-b border-purple-500/20">
              <h2 className="text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resolve a Dispute
              </h2>
              {!isValidator && (
                <p className="text-sm text-amber-300 mt-1">Validator privileges required</p>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={resolveDispute}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Dispute ID</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 text-gray-100 placeholder-gray-400 transition-all"
                      value={disputeId}
                      onChange={(e) => setDisputeId(e.target.value)}
                      placeholder="456"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Resolution Status</label>
                    <select
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 text-gray-100 transition-all"
                      value={status}
                      onChange={(e) => setStatus(parseInt(e.target.value))}
                      required
                    >
                      <option value={0}>Pending</option>
                      <option value={1}>Accepted</option>
                      <option value={2}>Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Resolution Details</label>
                    <textarea
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 text-gray-100 placeholder-gray-400 transition-all"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Explain your decision..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  {isValidator && (
                    <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-300">Your Dispute Credits:</span>
                        <span className="font-bold text-purple-100">{disputeCredits}</span>
                      </div>
                      <div className="text-xs text-purple-400 mt-1">
                        Resolving disputes consumes 1 credit. Invalid resolutions may result in credit deductions.
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !isConnected || !isValidator}
                  className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Resolve Dispute'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* View Dispute Details Card */}
        <div className="mt-6 bg-gray-800/80 rounded-xl shadow-lg border border-gray-700/50 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-cyan-900/70 to-cyan-800/70 px-6 py-4 border-b border-cyan-500/20">
            <h2 className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              View Dispute Details
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={getDisputeDetails}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-grow p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500 text-gray-100 placeholder-gray-400 transition-all"
                  value={fetchDisputeId}
                  onChange={(e) => setFetchDisputeId(e.target.value)}
                  placeholder="Enter dispute ID"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !isConnected}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 flex items-center transition-colors"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
            
            {disputeDetails && (
              <div className="mt-6 p-5 bg-gray-700/50 rounded-xl border border-gray-600/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Topic ID</div>
                    <div className="font-medium">{disputeDetails.topicId}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                    <div className={
                      disputeDetails.status === 0 ? 'text-yellow-400 font-bold' :
                      disputeDetails.status === 1 ? 'text-green-400 font-bold' : 
                      'text-red-400 font-bold'
                    }>
                      {disputeDetails.statusText}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted</div>
                    <div className="text-sm">{disputeDetails.timestamp}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Resolution</div>
                    <div className="text-sm">
                      {disputeDetails.status === 0 ? 'Pending resolution' : disputeDetails.resolution || 'No details provided'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reason</div>
                    <div className="p-3 bg-gray-600/30 rounded-lg border border-gray-500/30">
                      {disputeDetails.reason}
                    </div>
                  </div>
                  
                  {disputeDetails.status !== 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Resolution Details</div>
                      <div className="p-3 bg-gray-600/30 rounded-lg border border-gray-500/30">
                        {disputeDetails.resolution}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeManagement;