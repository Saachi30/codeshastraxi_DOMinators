import React, { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            
            // Get network ID
            const netId = await web3Instance.eth.net.getId();
            setNetworkId(netId);
          } catch (err) {
            setError("User denied account access");
          }
        } 
        // Legacy dapp browsers
        else if (window.web3) {
          const web3Instance = new Web3(window.web3.currentProvider);
          setWeb3(web3Instance);
          
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          
          const netId = await web3Instance.eth.net.getId();
          setNetworkId(netId);
        } 
        // Non-dapp browsers
        else {
          setError("Non-Ethereum browser detected. Consider using MetaMask!");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initWeb3();

    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Function to mint NFT voter certificate
  const mintVoterCertificate = async (votingData) => {
    if (!web3 || !account) return null;
    
    try {
      // This would connect to your NFT minting contract
      // For demo purposes we're just returning a mock NFT data
      return {
        id: `vote-${Date.now()}`,
        timestamp: new Date().toISOString(),
        theme: votingData.electionTitle,
        voterAddress: account,
        transactionHash: `0x${Math.random().toString(16).substring(2, 42)}`
      };
    } catch (err) {
      console.error("Error minting voter certificate:", err);
      return null;
    }
  };

  // Function to verify smart contract for vote
  const verifyVote = async (voteData) => {
    if (!web3 || !account) return false;
    
    // Mock verification function - would connect to your voting smart contract
    return true;
  };

  const value = {
    web3,
    account,
    networkId,
    loading,
    error,
    mintVoterCertificate,
    verifyVote
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};