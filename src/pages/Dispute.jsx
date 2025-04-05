import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json'; // Import the ABI from your JSON file
const contractABI = abi; // Truncated for brevity
const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';

const DisputeManagement = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isValidator, setIsValidator] = useState(false);
  
  // Dispute creation states
  const [topicId, setTopicId] = useState('');
  const [nullifier, setNullifier] = useState('');
  const [voterCommitment, setVoterCommitment] = useState('');
  const [reason, setReason] = useState('');
  
  // Resolve dispute states
  const [disputeId, setDisputeId] = useState('');
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState(0); // 0: Pending, 1: Accepted, 2: Rejected
  
  // Get dispute details states
  const [disputeDetails, setDisputeDetails] = useState(null);
  const [fetchDisputeId, setFetchDisputeId] = useState('');
  
  // Transaction states
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          
          // Create provider and signer
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          
          // Create contract instance
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          
          setProvider(provider);
          setContract(contract);
          setAccount(account);
          setIsConnected(true);
          
          // Check if the connected account is a validator
          try {
            const validatorStatus = await contract.validators(account);
            setIsValidator(validatorStatus);
          } catch (err) {
            console.error("Error checking validator status:", err);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
            window.location.reload();
          });
        } catch (error) {
          console.error("Failed to connect to Ethereum:", error);
          setError("Failed to connect to Ethereum. Please make sure MetaMask is installed and unlocked.");
        }
      } else {
        setError("Ethereum wallet not detected. Please install MetaMask.");
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
    setTxHash('');
    
    try {
      // Convert inputs to appropriate format
      const topicIdBN = ethers.BigNumber.from(topicId);
      const nullifierBytes = ethers.utils.arrayify(`0x${nullifier.replace(/^0x/, '')}`);
      const voterCommitmentBytes = ethers.utils.arrayify(`0x${voterCommitment.replace(/^0x/, '')}`);
      
      // Call raiseDispute function
      const tx = await contract.raiseDispute(
        topicIdBN,
        nullifierBytes,
        voterCommitmentBytes,
        reason
      );
      
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Reset form
      setTopicId('');
      setNullifier('');
      setVoterCommitment('');
      setReason('');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error raising dispute:", err);
      setError(err.message || "Failed to raise dispute. Check the console for details.");
      setIsLoading(false);
    }
  };

  const resolveDispute = async (e) => {
    e.preventDefault();
    
    if (!contract || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!isValidator) {
      setError("Only validators can resolve disputes");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setTxHash('');
    
    try {
      // Convert inputs to appropriate format
      const disputeIdBN = ethers.BigNumber.from(disputeId);
      const statusBN = ethers.BigNumber.from(status);
      
      // Call resolveDispute function
      const tx = await contract.resolveDispute(
        disputeIdBN,
        statusBN,
        resolution
      );
      
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Reset form
      setDisputeId('');
      setStatus(0);
      setResolution('');
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error resolving dispute:", err);
      setError(err.message || "Failed to resolve dispute. Check the console for details.");
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
    setDisputeDetails(null);
    
    try {
      // Convert dispute ID to BigNumber
      const disputeIdBN = ethers.BigNumber.from(fetchDisputeId);
      
      // Call getDisputeDetails function
      const details = await contract.getDisputeDetails(disputeIdBN);
      
      // Format the result
      const formattedDetails = {
        topicId: details.topicId.toString(),
        reason: details.reason,
        status: parseInt(details.status),
        statusText: ['Pending', 'Accepted', 'Rejected'][parseInt(details.status)],
        timestamp: new Date(details.timestamp.toNumber() * 1000).toLocaleString(),
        resolution: details.resolution
      };
      
      setDisputeDetails(formattedDetails);
      setIsLoading(false);
    } catch (err) {
      console.error("Error getting dispute details:", err);
      setError(err.message || "Failed to get dispute details. Check the console for details.");
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Accepted' },
    { value: 2, label: 'Rejected' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">ZKVote Dispute Management</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connection Status: 
                <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </p>
              {isConnected && (
                <p className="text-sm text-gray-600">
                  Account: {account}
                </p>
              )}
              {isValidator && (
                <p className="text-sm text-green-600 font-medium">
                  Validator Status: Active
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Error/Success Notifications */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {txHash && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>Transaction submitted: {txHash}</p>
            <a 
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Etherscan
            </a>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          {/* Create Dispute Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Raise a Dispute</h2>
            <form onSubmit={createDispute}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Topic ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  placeholder="Enter topic ID"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nullifier (hex)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={nullifier}
                  onChange={(e) => setNullifier(e.target.value)}
                  placeholder="Enter nullifier (hex string)"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Voter Commitment (hex)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={voterCommitment}
                  onChange={(e) => setVoterCommitment(e.target.value)}
                  placeholder="Enter voter commitment (hex string)"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Reason</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the reason for this dispute"
                  rows={3}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? 'Processing...' : 'Submit Dispute'}
              </button>
            </form>
          </div>
          
          {/* Resolve Dispute Section (Validators Only) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resolve a Dispute</h2>
            {!isValidator && (
              <p className="text-amber-600 mb-4">Note: Only validators can resolve disputes.</p>
            )}
            <form onSubmit={resolveDispute}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dispute ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={disputeId}
                  onChange={(e) => setDisputeId(e.target.value)}
                  placeholder="Enter dispute ID"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(parseInt(e.target.value))}
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Resolution</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Provide details about how this dispute was resolved"
                  rows={3}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                disabled={isLoading || !isConnected || !isValidator}
              >
                {isLoading ? 'Processing...' : 'Resolve Dispute'}
              </button>
            </form>
          </div>
          
          {/* Get Dispute Details Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Get Dispute Details</h2>
            <form onSubmit={getDisputeDetails}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dispute ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={fetchDisputeId}
                  onChange={(e) => setFetchDisputeId(e.target.value)}
                  placeholder="Enter dispute ID"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? 'Fetching...' : 'Get Details'}
              </button>
            </form>
            
            {disputeDetails && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">Dispute Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-gray-600">Topic ID:</div>
                  <div>{disputeDetails.topicId}</div>
                  
                  <div className="text-gray-600">Status:</div>
                  <div className={
                    disputeDetails.status === 0 ? 'text-yellow-600' :
                    disputeDetails.status === 1 ? 'text-green-600' : 'text-red-600'
                  }>
                    {disputeDetails.statusText}
                  </div>
                  
                  <div className="text-gray-600">Submitted:</div>
                  <div>{disputeDetails.timestamp}</div>
                  
                  <div className="text-gray-600 col-span-2">Reason:</div>
                  <div className="col-span-2 p-2 bg-white border border-gray-200 rounded">
                    {disputeDetails.reason}
                  </div>
                  
                  {disputeDetails.status !== 0 && (
                    <>
                      <div className="text-gray-600 col-span-2 mt-2">Resolution:</div>
                      <div className="col-span-2 p-2 bg-white border border-gray-200 rounded">
                        {disputeDetails.resolution}
                      </div>
                    </>
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