import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Lottie from 'lottie-react';
import votingAnimation from '../components/vote.json';

const contractAddress = "0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC";

const VotingDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [topics, setTopics] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [firebaseTopics, setFirebaseTopics] = useState([]);
  const { topicId } = useParams();
  const contractABI = [
    {
      "inputs": [],
      "name": "topicCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "topicId", "type": "uint256"}],
      "name": "getTopicDetails",
      "outputs": [
        {"internalType": "string", "name": "name", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string[]", "name": "choices", "type": "string[]"},
        {"internalType": "enum ZKVote.VotingMethod", "name": "method", "type": "uint8"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "string", "name": "location", "type": "string"},
        {"internalType": "uint256", "name": "minVotingPower", "type": "uint256"},
        {"internalType": "bool", "name": "isVotingOpen", "type": "bool"},
        {"internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Get the user's email from Firebase auth
        const auth = getAuth();
        if (auth.currentUser) {
          setUserEmail(auth.currentUser.email);
        } else {
          navigate('/login');
          return;
        }
        
        await initializeContract();
        setLoading(false);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        setErrorMessage("Failed to connect to wallet");
        setLoading(false);
      }
    } else {
      setErrorMessage("MetaMask is not installed");
      setLoading(false);
    }
  };

  const initializeContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const zkVoteContract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(zkVoteContract);
      await loadTopics(zkVoteContract);
    } catch (error) {
      console.error("Error initializing contract:", error);
      setErrorMessage("Failed to initialize contract");
    }
  };

  const fetchFirebaseTopics = async () => {
    try {
      if (!userEmail) return;
      
      const db = getFirestore();
      const topicsCollection = collection(db, "elections");
      
      // Get all elections (we'll filter manually for better debugging)
      const querySnapshot = await getDocs(topicsCollection);
      
      const allTopics = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
  
      // Normalize user email for comparison
      const normalizedUserEmail = userEmail.toLowerCase().trim();
      
      // Filter topics where user is participant or topic is open to all
      const accessibleTopics = allTopics.filter(topic => {
        const isParticipant = topic.participants?.some(participantEmail => 
          participantEmail.toLowerCase().trim() === normalizedUserEmail
        );
        
        console.log(
          `Topic ${topic.topicId} (${topic.name}):`,
          `User ${userEmail} is participant:`, isParticipant,
          `All participants:`, topic.participants
        );
        
        return topic.allowAllUsers || isParticipant;
      });
      
      setFirebaseTopics(accessibleTopics);
    } catch (error) {
      console.error("Error fetching Firebase topics:", error);
    }
  };
  useEffect(() => {
    if (userEmail) {
      fetchFirebaseTopics();
    }
  }, [userEmail]);

  const loadTopics = async (contractInstance) => {
    try {
      const contract = contractInstance || contract;
      if (!contract) return;
      
      const topicCount = await contract.topicCount();
      const count = topicCount.toNumber();
      const loadedTopics = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const topicDetails = await contract.getTopicDetails(i);
          
          let topicCategory = "other";
          const nameAndDesc = (topicDetails.name + " " + topicDetails.description).toLowerCase();
          
          if (nameAndDesc.includes("government") || nameAndDesc.includes("election")) {
            topicCategory = "government";
          } else if (nameAndDesc.includes("society") || nameAndDesc.includes("community")) {
            topicCategory = "society";
          } else if (nameAndDesc.includes("college") || nameAndDesc.includes("university")) {
            topicCategory = "college";
          }
          
          const topic = {
            id: i,
            title: topicDetails.name,
            description: topicDetails.description,
            status: topicDetails.isVotingOpen ? "active" : (new Date() > new Date(topicDetails.endTime.toNumber() * 1000) ? "completed" : "upcoming"),
            endDate: new Date(topicDetails.endTime.toNumber() * 1000),
            startDate: new Date(topicDetails.startTime.toNumber() * 1000),
            votingMethod: getVotingMethodName(topicDetails.method),
            choices: topicDetails.choices,
            participants: topicDetails.voteCounts.reduce((sum, count) => sum + count.toNumber(), 0),
            geoFenced: topicDetails.location !== "",
            location: topicDetails.location,
            category: topicCategory,
            topicId: i.toString()
          };
          console.log(`Topic ${i} participants:`, topic.participants);
          loadedTopics.push(topic);
        } catch (error) {
          console.warn(`Error loading topic ${i}:`, error.message);
        }
      }
      
      processTopics(loadedTopics);
    } catch (error) {
      console.error("Error loading topics:", error);
      setErrorMessage("Failed to load topics from contract");
    }
  };

  const processTopics = (loadedTopics) => {
    if (!userEmail || !firebaseTopics.length) {
      // For government topics, show all. For non-government, only show global ones
      const filteredTopics = loadedTopics.filter(topic => 
        topic.category === 'government' || topic.category === 'other'
      );
      setTopics(filteredTopics);
      return;
    }

    // Map topicIds from Firebase to a set for fast lookup
    const userTopicIds = new Set(firebaseTopics.map(topic => topic.topicId));
    
    // Filter blockchain topics to only show those the user can participate in
    const filteredTopics = loadedTopics.filter(topic => {
      // Government and global topics are always shown
      if (topic.category === 'government' || topic.category === 'other') {
        return true;
      }
      
      // For non-government topics, check if the user is in the participants list
      return userTopicIds.has(topic.topicId.toString());
    });

    // Enhance topics with Firebase data
    const enhancedTopics = filteredTopics.map(topic => {
      const firebaseTopic = firebaseTopics.find(ft => ft.topicId === topic.topicId.toString());
      if (firebaseTopic) {
        return {
          ...topic,
          uniqueCode: firebaseTopic.uniqueCode,
          pincode: firebaseTopic.pincode,
          creatorEmail: firebaseTopic.creatorEmail,
          type: firebaseTopic.type,
          allowAllUsers: firebaseTopic.allowAllUsers,
          isParticipant: firebaseTopic.participants?.includes(userEmail) || firebaseTopic.allowAllUsers
        };
      }
      
      return topic;
    });
    
    setTopics(enhancedTopics);
  };

  useEffect(() => {
    if (contract && firebaseTopics.length > 0) {
      loadTopics(contract);
    }
  }, [firebaseTopics]);

  const getVotingMethodName = (methodId) => {
    const methods = ["standard", "approval", "ranked", "quadratic", "community"];
    return methods[methodId] || "standard";
  };
  useEffect(() => {
    console.log('Topic ID from URL:', topicId);
    if (topicId) {
      fetchTopicDetails();
    }
  }, [topicId]);
  const handleElectionSelect = (election) => {
    navigate(`/vote/${election.topicId}`);
  };
  const votingMethods = {
    standard: { name: "Standard Voting", icon: "📝" },
    approval: { name: "Approval Voting", icon: "✓" },
    ranked: { name: "Ranked Choice", icon: "🔢" },
    quadratic: { name: "Quadratic Voting", icon: "🧮" },
    community: { name: "Community Vote", icon: "🌐" }
  };
  
  const categories = {
   
    society: { name: "Society", icon: "🏙️", color: "#A7C4BC" },
    college: { name: "College", icon: "🎓", color: "#BDBB99" },
    other: { name: "Global", icon: "🌍", color: "#E4D1B9" }
  };

  const getDaysLeft = (endDate) => {
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  const filteredTopics = topics.filter(topic => {
    const matchesTab = activeTab === 'all' || activeTab === topic.category;
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const governmentTopics = filteredTopics.filter(topic => topic.category === 'government');
  const nonGovernmentTopics = filteredTopics.filter(topic => topic.category !== 'government');

  return (
    <div className="min-h-screen bg-[#FDFAF6] pt-24">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-12 text-center bg-[#FAF1E6] p-8 md:p-12 rounded-3xl shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#99BC85] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#99BC85] rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className='flex flex-col md:flex-row items-center justify-between mb-6'>
            <div className='text-left justify-center mt-10'>
              <h1 className="text-3xl md:text-4xl font-bold text-[#3c4e3c] mb-4 tracking-tight relative">
                Revolutionizing the way India votes
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#99BC85] rounded-full animate-pulse"></span>
              </h1>
            
              <p className="text-[#7c9177] text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                <span className="font-medium block mt-1">Ensures every citizen's voice is heard through a tamper-proof, decentralized voting system.</span>
                Built for fairness. Secured by blockchain. Designed for democracy.
              </p>
            </div>
            <div className='md:w-1/2 w-full max-w-md'>
              <Lottie animationData={votingAnimation} loop={true} />
            </div>
          </div>
          
          {!account ? (
            <div className="mb-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between border border-[#E4EFE7] transition-all hover:shadow-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#3c4e3c]" fill="none" stroke="currentColor">
                    <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                    <path d="M12 14v2m0 0v2m0-2h-2m2 0h2" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <h3 className="font-bold text-[#3c4e3c] text-xl">Connect Your Wallet</h3>
                </div>
                <p className="text-[#5a7056]">Connect your wallet to view and participate in elections</p>
                {errorMessage && <p className="text-red-600 mt-2 font-medium">{errorMessage}</p>}
              </div>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-6 py-3 bg-[#99BC85] text-white rounded-lg hover:bg-[#88ab74] transition-all disabled:opacity-50 shadow-md font-medium flex items-center gap-2 group"
              >
                <span className="group-hover:translate-x-1 transition-transform">
                  {loading ? "Connecting..." : "Connect Wallet"}
                </span>
                {!loading && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="mb-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between border border-[#E4EFE7] transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-[#3c4e3c]">Wallet Connected</span>
                </div>
                <p className="text-[#5a7056] font-mono bg-[#f5f5f5] py-1 px-2 rounded inline-block text-sm">{account}</p>
                {userEmail && (
                  <p className="text-[#5a7056] mt-1">Email: {userEmail}</p>
                )}
              </div>
              <div className="text-sm text-[#5a7056] flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Contract: <span className="font-mono bg-[#f5f5f5] py-0.5 px-1 rounded">{contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#3c4e3c] mb-6">Voting Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E4EFE7]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#3c4e3c]">Active Elections</h3>
                <div className="w-12 h-12 rounded-full bg-[#E4EFE7] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#3c4e3c]">
                {topics.filter(topic => topic.status === 'active').length}
              </div>
              <p className="text-[#5a7056] text-sm mt-2">Currently active elections</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E4EFE7]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#3c4e3c]">Total Voters</h3>
                <div className="w-12 h-12 rounded-full bg-[#E4EFE7] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#3c4e3c]">
                {topics.reduce((sum, topic) => sum + topic.participants, 0).toLocaleString()}
              </div>
              <p className="text-[#5a7056] text-sm mt-2">Total participants across all elections</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E4EFE7]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#3c4e3c]">Completed Elections</h3>
                <div className="w-12 h-12 rounded-full bg-[#E4EFE7] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#3c4e3c]">
                {topics.filter(topic => topic.status === 'completed').length}
              </div>
              <p className="text-[#5a7056] text-sm mt-2">Elections that have concluded</p>
            </div>
          </div>
        </div>

        {account && (
          <>
            <div className="relative w-full md:w-1/3 mb-4">
                <input
                  type="text"
                  placeholder="Search for topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E4EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99BC85]"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

            {/* Government Elections Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <h2 className="text-2xl font-bold text-[#3c4e3c]">Government Elections</h2>
                </div>
                <div className="bg-[#E4EFE7] text-[#3c4e3c] text-sm font-medium px-3 py-1 rounded-lg">
                  Vote Only
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center p-12 bg-white rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#99BC85] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-[#99BC85] rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                    <div className="w-3 h-3 bg-[#99BC85] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    <span className="text-[#3c4e3c] ml-2">Loading elections...</span>
                  </div>
                </div>
              ) : governmentTopics.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#E4EFE7]">
                  <div className="text-6xl mb-4">🏛️</div>
                  <h3 className="text-xl font-medium text-[#3c4e3c] mb-2">No Government Elections Available</h3>
                  <p className="text-[#5a7056]">There are currently no government elections matching your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {governmentTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => handleElectionSelect(topic)}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition border border-[#E4EFE7] cursor-pointer group"
                    >
                      <div className="h-32 bg-[#99BC85] relative">
                        <div className="absolute inset-0 bg-[#99BC85] bg-opacity-90"></div>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-30 text-white">🏛️</span>
                        </div>
                        
                        {topic.status === 'active' && (
                          <div className="absolute top-3 right-3 bg-green-500 text-xs text-white font-medium px-2 py-1 rounded-full">
                            Active
                          </div>
                        )}
                        
                        {topic.status === 'upcoming' && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-xs text-white font-medium px-2 py-1 rounded-full">
                            Upcoming
                          </div>
                        )}
                        
                        {topic.status === 'completed' && (
                          <div className="absolute top-3 right-3 bg-gray-500 text-xs text-white font-medium px-2 py-1 rounded-full">
                            Completed
                          </div>
                        )}
                        
                        {topic.geoFenced && (
                          <div className="absolute top-3 left-3 bg-white text-xs text-[#3c4e3c] font-medium px-2 py-1 rounded-full">
                            Geo-fenced
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-[#3c4e3c] mb-2 line-clamp-2">{topic.title}</h3>
                        <p className="text-[#5a7056] text-sm mb-4 line-clamp-2">{topic.description}</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{votingMethods[topic.votingMethod].icon}</span>
                          <span className="text-sm font-medium text-[#3c4e3c]">{votingMethods[topic.votingMethod].name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm mt-4 pt-3 border-t border-[#E4EFE7]">
                          <div className="flex flex-col">
                            <span className="text-[#5a7056]">End Date</span>
                            <span className="font-medium text-[#3c4e3c]">{formatDate(topic.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 bg-[#FAF1E6] px-3 py-1 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-[#3c4e3c]">{topic.participants}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                          <div className="px-4 py-2 bg-[#99BC85] text-white rounded-lg text-sm group-hover:bg-[#88ab74] transition-colors w-full text-center">
                            Cast Your Vote
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Community Elections Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-2xl font-bold text-[#3c4e3c]">Community Elections</h2>
                </div>
                <button
                  onClick={() => navigate('/create-topic')}
                  className="px-4 py-2 bg-[#99BC85] text-white rounded-lg hover:bg-[#88ab74] transition-colors shadow-md flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Topic
                </button>
              </div>
              {/* Search and Tab Navigation */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              
              <div className="flex overflow-x-auto gap-2 my-4 w-full md:w-auto my-6">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'all' 
                    ? 'bg-[#99BC85] text-white' 
                    : 'bg-[#FAF1E6] text-[#3c4e3c] hover:bg-[#E4EFE7]'}`}
                >
                  All Categories
                </button>
                {Object.entries(categories).map(([key, value]) => (
                  <button 
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap transition-colors ${activeTab === key 
                      ? 'bg-[#99BC85] text-white' 
                      : 'bg-[#FAF1E6] text-[#3c4e3c] hover:bg-[#E4EFE7]'}`}
                  >
                    <span>{value.icon}</span> {value.name}
                  </button>
                ))}
              </div>
            </div>
              {loading ? (
                <div className="flex items-center justify-center p-12 bg-white rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#99BC85] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-[#99BC85] rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                    <div className="w-3 h-3 bg-[#99BC85] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    <span className="text-[#3c4e3c] ml-2">Loading topics...</span>
                  </div>
                </div>
              ) : nonGovernmentTopics.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#E4EFE7]">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-medium text-[#3c4e3c] mb-2">No Community Topics Available</h3>
                  <p className="text-[#5a7056]">Create a new topic for your community or organization!</p>
                  <button
                    onClick={() => navigate('/create-topic')}
                    className="mt-4 px-6 py-2 bg-[#99BC85] text-white rounded-lg hover:bg-[#88ab74] transition-colors shadow-md"
                  >
                    Create New Topic
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nonGovernmentTopics.map((topic) => {
                    const categoryColor = categories[topic.category]?.color || "#E4D1B9";
                    
                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleElectionSelect(topic)}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition border border-[#E4EFE7] cursor-pointer group"
                      >
                        <div className="h-32" style={{ backgroundColor: categoryColor, position: 'relative' }}>
                          <div className="absolute inset-0 bg-opacity-90" style={{ backgroundColor: categoryColor }}></div>
                          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-30 text-white">{categories[topic.category]?.icon || "📊"}</span>
                          </div>
                          
                          {topic.status === 'active' && (
                            <div className="absolute top-3 right-3 bg-green-500 text-xs text-white font-medium px-2 py-1 rounded-full">
                              Active
                            </div>
                          )}
                          
                          {topic.status === 'upcoming' && (
                            <div className="absolute top-3 right-3 bg-yellow-500 text-xs text-white font-medium px-2 py-1 rounded-full">
                              Upcoming
                            </div>
                          )}
                          
                          {topic.status === 'completed' && (
                            <div className="absolute top-3 right-3 bg-gray-500 text-xs text-white font-medium px-2 py-1 rounded-full">
                              Completed
                            </div>
                          )}
                          
                          <div className="absolute top-3 left-3 bg-white text-xs text-[#3c4e3c] font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <span>{categories[topic.category]?.icon || "📊"}</span>
                            <span>{categories[topic.category]?.name || "Other"}</span>
                          </div>
                          
                          {topic.allowAllUsers && (
                            <div className="absolute bottom-3 left-3 bg-white text-xs text-[#3c4e3c] font-medium px-2 py-1 rounded-full">
                              Open to All
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-[#3c4e3c] mb-2 line-clamp-2">{topic.title}</h3>
                          <p className="text-[#5a7056] text-sm mb-4 line-clamp-2">{topic.description}</p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{votingMethods[topic.votingMethod].icon}</span>
                            <span className="text-sm font-medium text-[#3c4e3c]">{votingMethods[topic.votingMethod].name}</span>
                          </div>
                          
                          {topic.geoFenced && (
                            <div className="mb-3 flex items-center gap-1 text-sm text-[#5a7056]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Location restricted</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-sm mt-4 pt-3 border-t border-[#E4EFE7]">
                            <div className="flex flex-col">
                              <span className="text-[#5a7056]">End Date</span>
                              <span className="font-medium text-[#3c4e3c]">{formatDate(topic.endDate)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 bg-[#FAF1E6] px-3 py-1 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-[#3c4e3c]">{topic.participants}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-center">
                            <div className="px-4 py-2 bg-[#99BC85] text-white rounded-lg text-sm group-hover:bg-[#88ab74] transition-colors w-full text-center">
                              {topic.status === 'active' ? 'Cast Your Vote' : topic.status === 'upcoming' ? 'View Details' : 'View Results'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {nonGovernmentTopics.length > 0 && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => navigate('/create-topic')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#E4EFE7] text-[#3c4e3c] rounded-lg hover:bg-[#d6e6d9] transition-colors shadow-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Topic
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    
    </div>
  );
};

export default VotingDashboard;