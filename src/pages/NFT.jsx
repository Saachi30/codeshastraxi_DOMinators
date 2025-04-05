import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';

// ABI shortened for readability in the component - include the full ABI in your actual implementation
const contractABI = [
  // NFT related functions
  "function mintParticipationNFT(string tokenURI, bytes32 nullifier, bytes32 voterCommitment) public",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function getNFTDetails(uint256 tokenId) public view returns (address owner, string memory tokenURI)",
  // Events
  "event NFTMinted(address to, uint256 tokenId, string tokenURI)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const NFTManager = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [nftData, setNftData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NFT minting form state
  const [tokenURI, setTokenURI] = useState('');
  const [nullifier, setNullifier] = useState('');
  const [commitment, setCommitment] = useState('');
  
  // NFT viewing state
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [startTokenId, setStartTokenId] = useState(1);
  const [searchTokenId, setSearchTokenId] = useState('');

  useEffect(() => {
    const initializeEthers = async () => {
      try {
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } else {
          setError('Please install MetaMask to use this dApp');
        }
      } catch (err) {
        console.error('Error initializing ethers:', err);
        setError('Failed to initialize blockchain connection');
      }
    };

    initializeEthers();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const userAddress = await web3Signer.getAddress();
      
      const nftContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(nftContract);
      setAccount(userAddress);
      setIsConnected(true);
      
      fetchNFTs(nftContract, userAddress);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTs = async (nftContract, userAddress) => {
    try {
      setLoading(true);
      
      // Get user's NFT balance
      const balance = await nftContract.balanceOf(userAddress);
      setTotalNFTs(balance.toNumber());
      
      // This is a simplistic approach - in a real implementation you would use events or other methods
      // to determine which NFTs are owned by the user, since tokenIds might not be sequential
      const nfts = [];
      let validNFTs = 0;
      let tokenId = startTokenId;
      
      // Try to find NFTs by iterating through tokenIds
      // This is not efficient but works for demo purposes
      // In production, you would use events or a proper indexing service
      while (validNFTs < balance.toNumber() && tokenId < startTokenId + 100) {
        try {
          const owner = await nftContract.ownerOf(tokenId);
          
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            const details = await nftContract.getNFTDetails(tokenId);
            nfts.push({
              id: tokenId,
              owner: details.owner,
              uri: details.tokenURI
            });
            validNFTs++;
          }
        } catch (err) {
          // Skip this token ID if it doesn't exist
        }
        tokenId++;
      }
      
      setNftData(nfts);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to fetch NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!tokenURI || !nullifier || !commitment) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Convert string inputs to bytes32
      const nullifierBytes = ethers.utils.id(nullifier); // This is a simplified approach
      const commitmentBytes = ethers.utils.id(commitment); // In a real app, you'd use proper ZK proofs
      
      // Call the mint function
      const tx = await contract.mintParticipationNFT(tokenURI, nullifierBytes, commitmentBytes);
      await tx.wait();
      
      // Clear form fields
      setTokenURI('');
      setNullifier('');
      setCommitment('');
      
      // Refresh NFT list
      fetchNFTs(contract, account);
      
      alert('NFT minted successfully!');
    } catch (err) {
      console.error('Error minting NFT:', err);
      setError(`Failed to mint NFT: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchNFT = async () => {
    if (!searchTokenId || !isConnected) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tokenId = parseInt(searchTokenId);
      const details = await contract.getNFTDetails(tokenId);
      
      setNftData([{
        id: tokenId,
        owner: details.owner,
        uri: details.tokenURI
      }]);
    } catch (err) {
      console.error('Error searching NFT:', err);
      setError(`NFT with ID ${searchTokenId} not found or error occurred`);
      setNftData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">ZKVote NFT Manager</h1>
          <p className="text-gray-600">Create and view participation NFTs</p>
        </header>
        
        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {!isConnected ? (
            <button 
              onClick={connectWallet} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">
                Connected: <span className="font-mono text-blue-600">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Connected
              </span>
            </div>
          )}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mint NFT Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mint Participation NFT</h2>
              
              <form onSubmit={mintNFT}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tokenURI">
                    Token URI (IPFS or other link to metadata)
                  </label>
                  <input
                    type="text"
                    id="tokenURI"
                    value={tokenURI}
                    onChange={(e) => setTokenURI(e.target.value)}
                    placeholder="ipfs://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nullifier">
                    Nullifier (unique identifier)
                  </label>
                  <input
                    type="text"
                    id="nullifier"
                    value={nullifier}
                    onChange={(e) => setNullifier(e.target.value)}
                    placeholder="Unique value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be hashed on-chain to create a bytes32 value
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="commitment">
                    Voter Commitment
                  </label>
                  <input
                    type="text"
                    id="commitment"
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    placeholder="Voter commitment value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be hashed on-chain to create a bytes32 value
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  {loading ? 'Processing...' : 'Mint NFT'}
                </button>
              </form>
            </div>
            
            {/* View NFTs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your NFTs</h2>
              
              <div className="flex mb-4">
                <input
                  type="number"
                  placeholder="Search by Token ID"
                  value={searchTokenId}
                  onChange={(e) => setSearchTokenId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={searchNFT}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-300"
                >
                  Search
                </button>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={() => fetchNFTs(contract, account)}
                  disabled={loading}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Refresh NFTs
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading NFTs...</p>
                  </div>
                ) : nftData.length > 0 ? (
                  <ul className="space-y-4">
                    {nftData.map((nft) => (
                      <li key={nft.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-blue-600">Token #{nft.id}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Owner: {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          <span className="font-medium">URI:</span> {nft.uri}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No NFTs found. Mint your first NFT or refresh the list.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTManager;