import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Award, Trophy, Star, Medal, Check, Shield, Key, Gift, AlertTriangle, Compass, ExternalLink } from 'lucide-react';

// Contract details
const CONTRACT_ADDRESS = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
const ABI = [
  // Relevant functions from the ABI
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getNFTDetails(uint256 tokenId) view returns (address owner, string tokenURI)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

const NFTManager = () => {
  const [account, setAccount] = useState('');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rewards, setRewards] = useState({
    votingPower: 0,
    streak: 0,
    badges: [],
    level: 1,
    experience: 0,
    nextLevelExp: 100,
  });
  const [selectedNft, setSelectedNft] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        setError('MetaMask is not installed. Please install it to use this app.');
      }
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Load user's NFTs
  useEffect(() => {
    const loadNFTs = async () => {
      if (!account) return;
      
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        // Get balance of NFTs for the connected account
        const balance = await contract.balanceOf(account);
        console.log(`Account ${account} has ${balance.toString()} NFTs`);
        
        const nftItems = [];
        
        // Iterate through tokenIDs from 0 to 20 to try and find all NFTs
        // Increased to check up to 12 NFTs
        for (let tokenId = 0; tokenId <= 20; tokenId++) {
          try {
            // Call getNFTDetails for each tokenId
            const details = await contract.getNFTDetails(tokenId);
            
            // Check if the owner of this NFT is the connected account
            if (details && details.owner && details.owner.toLowerCase() === account.toLowerCase()) {
              console.log(`Found NFT #${tokenId} owned by the connected account`);
              
              // Try to fetch metadata from tokenURI
              let metadata;
              try {
                // In a real application, you would fetch this from IPFS or a server
                const uri = details.tokenURI;
                // For demo purposes, we'll create mock metadata
                metadata = {
                  name: `ZK Vote #${tokenId}`,
                  description: `Participation NFT for secure voting`,
                  image: `/api/placeholder/${300 + (tokenId % 10) * 10}/${200 + (tokenId % 5) * 10}`,
                  attributes: [
                    { trait_type: "Topic", value: `Election #${tokenId}` },
                    { trait_type: "Voting Power", value: 5 + (tokenId % 5) },
                    { trait_type: "Rarity", value: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][tokenId % 5] }
                  ]
                };
              } catch (metadataErr) {
                console.error(`Error fetching metadata for NFT #${tokenId}:`, metadataErr);
                // Use fallback metadata
                metadata = {
                  name: `ZK Vote #${tokenId}`,
                  description: `Participation NFT (metadata unavailable)`,
                  image: `/api/placeholder/300/200`,
                  attributes: [
                    { trait_type: "Voting Power", value: 1 },
                    { trait_type: "Rarity", value: "Common" }
                  ]
                };
              }
              
              nftItems.push({
                id: tokenId,
                tokenURI: details.tokenURI,
                metadata
              });
            }
          } catch (err) {
            // This could happen if the token doesn't exist or other issues
            console.log(`Token ID ${tokenId} check resulted in: ${err.message}`);
            // Continue to the next token ID
          }
        }
        
        console.log(`Found ${nftItems.length} NFTs belonging to the account`);
        
        // For demo purposes, add some sample NFTs if none were found
        // Increased to 12 sample NFTs
        if (nftItems.length === 0) {
          console.log("No NFTs found, adding sample data for demonstration");
          for (let i = 1; i <= 12; i++) {
            const sampleTokenURI = `ipfs://sample/${i}`;
            nftItems.push({
              id: i,
              tokenURI: sampleTokenURI,
              metadata: {
                name: `ZK Vote #${i}`,
                description: `Participation NFT for secure voting`,
                image: `/api/placeholder/${300 + (i % 10) * 10}/${200 + (i % 5) * 10}`,
                attributes: [
                  { trait_type: "Topic", value: `Election #${i}` },
                  { trait_type: "Voting Power", value: 5 + (i % 5) },
                  { trait_type: "Rarity", value: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][i % 5] }
                ]
              }
            });
          }
        }
        
        setNfts(nftItems);
        
        // Calculate rewards based on NFTs
        calculateRewards(nftItems);
      } catch (err) {
        setError('Error loading NFTs: ' + err.message);
        console.error("Error in loadNFTs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (account) {
      loadNFTs();
    }
  }, [account]);
  
  // Calculate user rewards based on their NFTs
  const calculateRewards = (nftItems) => {
    const votingPower = nftItems.reduce((sum, nft) => {
      const powerAttribute = nft.metadata.attributes.find(attr => attr.trait_type === "Voting Power");
      return sum + (powerAttribute ? powerAttribute.value : 0);
    }, 0);
    
    const rarityMap = {
      "Common": 1,
      "Uncommon": 2,
      "Rare": 3,
      "Epic": 4,
      "Legendary": 5
    };
    
    const experience = nftItems.reduce((sum, nft) => {
      const rarityAttribute = nft.metadata.attributes.find(attr => attr.trait_type === "Rarity");
      const rarityValue = rarityAttribute ? rarityMap[rarityAttribute.value] || 1 : 1;
      return sum + (rarityValue * 20);
    }, 0);
    
    const level = Math.floor(experience / 100) + 1;
    const nextLevelExp = level * 100;
    
    // Determine badges based on collection
    const badges = [];
    
    if (nftItems.length >= 1) badges.push({ name: "First Vote", icon: <Check size={16} />, color: "bg-green-500" });
    if (nftItems.length >= 3) badges.push({ name: "Active Voter", icon: <Medal size={16} />, color: "bg-blue-500" });
    if (nftItems.length >= 5) badges.push({ name: "Democracy Advocate", icon: <Shield size={16} />, color: "bg-purple-500" });
    if (nftItems.length >= 8) badges.push({ name: "Civic Duty", icon: <Key size={16} />, color: "bg-indigo-500" });
    if (nftItems.length >= 10) badges.push({ name: "Democracy Champion", icon: <Trophy size={16} />, color: "bg-amber-500" });
    
    if (votingPower >= 10) badges.push({ name: "Influencer", icon: <Star size={16} />, color: "bg-yellow-500" });
    if (votingPower >= 20) badges.push({ name: "Power Voter", icon: <Trophy size={16} />, color: "bg-amber-500" });
    if (votingPower >= 30) badges.push({ name: "Super Delegate", icon: <Award size={16} />, color: "bg-red-500" });
    
    // Check if user has any rare or legendary NFTs
    const hasRare = nftItems.some(nft => {
      const rarityAttribute = nft.metadata.attributes.find(attr => attr.trait_type === "Rarity");
      return rarityAttribute && (rarityAttribute.value === "Rare" || rarityAttribute.value === "Epic" || rarityAttribute.value === "Legendary");
    });
    
    if (hasRare) badges.push({ name: "Collector", icon: <Award size={16} />, color: "bg-red-500" });
    
    setRewards({
      votingPower,
      streak: nftItems.length, // Using the number of NFTs as a stand-in for voting streak
      badges,
      level,
      experience,
      nextLevelExp
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFAF6] text-gray-100 pt-20">
      {/* Header */}
      <header className="bg-[#99BC85] border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <Shield className="mr-2" /> ZK Vote NFT Dashboard
          </h1>
          
          {account ? (
            <div className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </div>
          ) : (
            <button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="px-4 py-2 bg-green-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            <p>{error}</p>
          </div>
        )}
        
        {!account ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield size={64} className="mb-4 text-blue-500" />
            <h2 className="text-2xl text-[#99BC85] font-bold mb-2">Welcome to ZK Vote NFT Dashboard</h2>
            <p className="mb-6 text-gray-400 max-w-md">Connect your wallet to view your participation NFTs and unlock rewards based on your voting history.</p>
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 text-black border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-2">Loading your NFTs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - NFT Collection */}
            <div className="lg:col-span-2">
              <div className="bg-[#FAF1E6] border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-xl text-[#99BC85] font-bold">Your NFT Collection</h2>
                  <p className="text-gray-400 text-sm">Collect more NFTs by participating in ZK Vote elections</p>
                </div>
                
                {nfts.length === 0 ? (
                  <div className="p-6 text-center">
                    <Compass size={48} className="mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
                    <p className="text-gray-400">Participate in ZK Vote elections to earn NFTs.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {nfts.map((nft) => {
                      const rarityAttribute = nft.metadata.attributes.find(attr => attr.trait_type === "Rarity");
                      const rarity = rarityAttribute ? rarityAttribute.value : "Common";
                      const rarityColor = {
                        "Common": "border-gray-500",
                        "Uncommon": "border-green-500",
                        "Rare": "border-blue-500", 
                        "Epic": "border-purple-500",
                        "Legendary": "border-amber-500"
                      }[rarity];
                      
                      return (
                        <div 
                          key={nft.id}
                          onClick={() => setSelectedNft(nft)}
                          className={`bg-[#E4EFE7] rounded-lg overflow-hidden border-2 ${rarityColor} hover:scale-105 transition-transform cursor-pointer ${selectedNft?.id === nft.id ? 'ring-2 ring-blue-400' : ''}`}
                        >
                          <div className="aspect-square bg-[#99BC85] relative">
                            <img 
                              src={nft.metadata.image} 
                              alt={nft.metadata.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded bg-gray-900/70">
                              #{nft.id}
                            </div>
                          </div>
                          
                          <div className="p-3 text-gray-700">
                            <h3 className="font-bold mb-1">{nft.metadata.name}</h3>
                            <div className="flex items-center text-xs">
                              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                {
                                  "Common": "bg-gray-400",
                                  "Uncommon": "bg-green-400",
                                  "Rare": "bg-blue-400", 
                                  "Epic": "bg-purple-400",
                                  "Legendary": "bg-amber-400"
                                }[rarity]
                              }`}></span>
                              <span>{rarity}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Player Stats and Selected NFT */}
            <div className="space-y-6">
              {/* Player Stats Card */}
              <div className="bg-gradiant-b from-[#E4EFE7] via- [#E4EFE7] to-white border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-xl text-[#99BC85] font-bold">Player Stats</h2>
                </div>
                
                <div className="p-4">
                  {/* Level Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-black">Level {rewards.level}</span>
                      <span className="text-sm text-gray-400">{rewards.experience}/{rewards.nextLevelExp} XP</span>
                    </div>
                    <div className="h-2 bg-[#99BC85] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${Math.min(100, (rewards.experience % 100) * 100 / rewards.nextLevelExp)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#99BC85] p-3 rounded-lg">
                      <div className="text-black text-xs mb-1">Collection</div>
                      <div className="text-xl font-bold">{nfts.length} NFTs</div>
                    </div>
                    <div className="bg-[#99BC85] p-3 rounded-lg">
                      <div className="text-black text-xs mb-1">Voting Power</div>
                      <div className="text-xl font-bold">{rewards.votingPower}</div>
                    </div>
                    <div className="bg-[#99BC85] p-3 rounded-lg">
                      <div className="text-black text-xs mb-1">Voting Streak</div>
                      <div className="text-xl font-bold">{rewards.streak} Days</div>
                    </div>
                    <div className="bg-[#99BC85] p-3 rounded-lg">
                      <div className="text-black text-xs mb-1">Badges</div>
                      <div className="text-xl font-bold">{rewards.badges.length}</div>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className=" text-black">
                    <h3 className="font-medium mb-2 text-black">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {rewards.badges.map((badge, index) => (
                        <div 
                          key={index} 
                          className="flex items-center px-2 py-1 rounded text-xs font-medium" 
                          style={{ backgroundColor: badge.color || "bg-blue-500" }}
                        >
                          {badge.icon}
                          <span className="ml-1">{badge.name}</span>
                        </div>
                      ))}
                      
                      {rewards.badges.length === 0 && (
                        <p className="text-sm text-gray-400">No badges yet. Participate in more votes!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selected NFT Details */}
              {selectedNft && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">NFT Details</h2>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{selectedNft.metadata.name}</h3>
                    <p className="text-gray-400 mb-4">{selectedNft.metadata.description}</p>
                    
                    {/* Token URI Display - Added this section */}
                    <div className="mb-4 bg-gray-700 p-3 rounded-lg overflow-hidden">
                      <h4 className="font-medium mb-1 flex items-center">
                        <ExternalLink size={16} className="mr-1" /> Token URI
                      </h4>
                      <p className="text-xs text-gray-300 break-all">{selectedNft.tokenURI}</p>
                    </div>
                    
                    <h4 className="font-medium mb-2">Attributes</h4>
                    <div className="space-y-2 mb-4">
                      {selectedNft.metadata.attributes.map((attr, index) => (
                        <div key={index} className="flex justify-between bg-gray-700 p-2 rounded">
                          <span className="text-gray-400">{attr.trait_type}</span>
                          <span className="font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 flex items-start">
                      <Gift className="text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Rewards Unlocked</h4>
                        <p className="text-sm text-gray-400">
                          This NFT adds +{selectedNft.metadata.attributes.find(attr => attr.trait_type === "Voting Power")?.value || 0} to your voting power.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Incentives Card */}
              <div className="bg[#E4EFE7] border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-[#99BC85]">Unlock More Rewards</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex items-start">
                    <Trophy className="text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-[#99BC85]">Collect 10 NFTs</h3>
                      <p className="text-sm text-gray-600">Earn the "Democracy Champion" badge and +5 voting power</p>
                      <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${Math.min(100, nfts.length * 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Key className="text-purple-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-[#99BC85]">Reach Level 5</h3>
                      <p className="text-sm text-gray-600">Unlock exclusive voting themes and +2 dispute credits</p>
                      <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${Math.min(100, rewards.level * 20)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Star className="text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-[#99BC85]">Find a Legendary NFT</h3>
                      <p className="text-sm text-gray-600">Earn exclusive voting rights in premium elections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-8 border-t border-gray-800 p-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          ZK Vote NFT Dashboard • Secure and transparent voting through blockchain
        </div>
      </footer>
    </div>
  );
};

export default NFTManager;