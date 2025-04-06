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
  
  // Color scheme constants
  const colors = {
    primary: "#99BC85",
    primaryLight: "#E4EFE7",
    background: "#FAF1E6",
    card: "#FDFAF6",
    accent: "#7D9D6D",
    accentLight: "#C5DEB9",
    text: "#4B5F3D",
    textLight: "#6E8461",
    error: "#D57676",
    success: "#78A16F",
    pending: "#D0B17A",
    border: "#D9E7D5"
  };
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      <div className="max-w-6xl mx-auto p-6 font-sans">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: colors.text }}>
            ZKVote Dispute Center
          </h1>
          <p style={{ color: colors.textLight }}>Manage and resolve voting disputes with zero-knowledge proofs</p>
          <div className="w-20 h-1 mx-auto mt-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
        </div>
        
        {/* Connection Status */}
        <div className="mb-8 rounded-xl shadow-lg p-5" style={{ backgroundColor: colors.card, borderLeft: `4px solid ${colors.primary}` }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'animate-pulse' : ''}`} 
                style={{ backgroundColor: isConnected ? colors.success : colors.error }}></div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
                  {isConnected ? 'Connected to Ethereum' : 'Not Connected'}
                </h2>
                {isConnected && (
                  <p className="text-sm font-mono truncate max-w-xs" style={{ color: colors.textLight }}>
                    {account}
                  </p>
                )}
              </div>
            </div>
            
            {isValidator && (
              <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.primaryLight, border: `1px solid ${colors.accentLight}` }}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill={colors.accent}>
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium" style={{ color: colors.text }}>
                    Validator • {disputeCredits} Dispute Credits Available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="p-4 rounded-lg mb-6 flex items-start" style={{ backgroundColor: `rgba(213, 118, 118, 0.1)`, borderLeft: `4px solid ${colors.error}` }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill={colors.error}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p style={{ color: colors.error }}>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 rounded-lg mb-6 flex items-start" style={{ backgroundColor: `rgba(153, 188, 133, 0.1)`, borderLeft: `4px solid ${colors.success}` }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill={colors.success}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p style={{ color: colors.success }}>{success}</p>
          </div>
        )}
        
        {txHash && (
          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: `rgba(153, 188, 133, 0.1)`, borderLeft: `4px solid ${colors.accent}` }}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill={colors.accent}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p style={{ color: colors.text }}>Transaction submitted</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: colors.accent }}
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raise Dispute Card */}
          <div className="rounded-xl shadow-lg" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: colors.border, backgroundColor: colors.primaryLight }}>
              <h2 className="text-xl font-bold flex items-center" style={{ color: colors.text }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill={colors.accent}>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Raise a Dispute
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={createDispute}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Topic ID</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Nullifier (hex)</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      value={nullifier}
                      onChange={(e) => setNullifier(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Voter Commitment (hex)</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      value={voterCommitment}
                      onChange={(e) => setVoterCommitment(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Reason</label>
                    <textarea
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
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
                  className="mt-6 w-full font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: isLoading || !isConnected ? `${colors.accent}80` : colors.accent,
                    color: colors.card,
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <div className="rounded-xl shadow-lg" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: colors.border, backgroundColor: colors.primaryLight }}>
              <h2 className="text-xl font-bold flex items-center" style={{ color: colors.text }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill={colors.accent}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resolve a Dispute
              </h2>
              {!isValidator && (
                <p className="text-sm mt-1" style={{ color: colors.pending }}>Validator privileges required</p>
              )}
            </div>
            
            <div className="p-6">
              <form onSubmit={resolveDispute}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Dispute ID</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      value={disputeId}
                      onChange={(e) => setDisputeId(e.target.value)}
                      placeholder="456"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Resolution Status</label>
                    <select
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
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
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Resolution Details</label>
                    <textarea
                      className="w-full p-3 rounded-lg focus:ring-2 transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Explain your decision..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  {isValidator && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primaryLight}`, border: `1px solid ${colors.border}` }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: colors.text }}>Your Dispute Credits:</span>
                        <span className="font-bold" style={{ color: colors.text }}>{disputeCredits}</span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textLight }}>
                        Resolving disputes consumes 1 credit. Invalid resolutions may result in credit deductions.
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !isConnected || !isValidator}
                  className="mt-6 w-full font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: isLoading || !isConnected || !isValidator ? `${colors.accent}80` : colors.accent,
                    color: colors.card,
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <div className="mt-6 rounded-xl shadow-lg" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: colors.border, backgroundColor: colors.primaryLight }}>
            <h2 className="text-xl font-bold flex items-center" style={{ color: colors.text }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill={colors.accent}>
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
                  className="flex-grow p-3 rounded-lg focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: colors.background, 
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                  value={fetchDisputeId}
                  onChange={(e) => setFetchDisputeId(e.target.value)}
                  placeholder="Enter dispute ID"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !isConnected}
                  className="font-medium px-6 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 flex items-center transition-colors"
                  style={{ 
                    backgroundColor: isLoading || !isConnected ? `${colors.accent}80` : colors.accent,
                    color: colors.card,
                  }}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
            
            {disputeDetails && (
              <div className="mt-6 p-5 rounded-xl" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textLight }}>Topic ID</div>
                    <div className="font-medium" style={{ color: colors.text }}>{disputeDetails.topicId}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textLight }}>Status</div>
                    <div
                      className="font-bold"
                      style={{ 
                        color: disputeDetails.status === 0 ? colors.pending : 
                               disputeDetails.status === 1 ? colors.success : 
                               colors.error 
                      }}
                    >
                      {disputeDetails.statusText}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textLight }}>Submitted</div>
                    <div className="text-sm" style={{ color: colors.text }}>{disputeDetails.timestamp}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textLight }}>Resolution</div>
                    <div className="text-sm" style={{ color: colors.text }}>
                      
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