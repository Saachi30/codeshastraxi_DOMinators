import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoting } from '../contexts/VotingContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const VoteCasting = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentElection, fetchElection, castVote } = useVoting();
  
  const [loading, setLoading] = useState(true);
  const [votingMethod, setVotingMethod] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [credits] = useState(16);
  const [showBiasInfo, setShowBiasInfo] = useState(false);
  const [userEmotion, setUserEmotion] = useState('neutral');
  const [showHelp, setShowHelp] = useState(false);
  
  const [approvalVotes, setApprovalVotes] = useState({});
  const [rankedVotes, setRankedVotes] = useState([]);
  const [quadraticVotes, setQuadraticVotes] = useState({});
  const [remainingCredits, setRemainingCredits] = useState(16);
  
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  
  useEffect(() => {
    const loadElectionData = async () => {
      if (!currentElection || currentElection.id !== electionId) {
        try {
          const election = await fetchElection(electionId);
          setVotingMethod(election.votingMethod);
          setCandidates(election.candidates);
        } catch (error) {
          console.error("Error fetching election:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setVotingMethod(currentElection.votingMethod);
        setCandidates(currentElection.candidates);
        setLoading(false);
      }
    };
    
    loadElectionData();
    
    const emotionInterval = setInterval(() => {
      const emotions = ['neutral', 'confused', 'interested', 'uncertain'];
      const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setUserEmotion(newEmotion);
      
      if (newEmotion === 'confused' && Math.random() > 0.7) {
        setShowHelp(true);
      }
    }, 5000);
    
    return () => clearInterval(emotionInterval);
  }, [electionId, currentElection, fetchElection]);
  
  useEffect(() => {
    if (votingMethod === 'quadratic') {
      let used = 0;
      Object.values(quadraticVotes).forEach(votes => {
        used += votes * votes;
      });
      setRemainingCredits(credits - used);
    }
  }, [quadraticVotes, credits, votingMethod]);
  
  const handleApprovalVote = (candidateId) => {
    setApprovalVotes(prev => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
  };
  
  const handleRankedVote = (candidateId, rank) => {
    const newRanked = [...rankedVotes.filter(c => c !== candidateId)];
    if (rank >= 0 && rank < candidates.length) {
      newRanked.splice(rank, 0, candidateId);
      setRankedVotes(newRanked);
    }
  };
  
  const handleQuadraticVote = (candidateId, direction) => {
    const currentVotes = quadraticVotes[candidateId] || 0;
    let newVotes = currentVotes;
    
    if (direction === 'increase') {
      const costToIncrease = (currentVotes + 1) * (currentVotes + 1) - currentVotes * currentVotes;
      if (costToIncrease <= remainingCredits) {
        newVotes = currentVotes + 1;
      }
    } else if (direction === 'decrease' && currentVotes > 0) {
      newVotes = currentVotes - 1;
    }
    
    setQuadraticVotes(prev => ({
      ...prev,
      [candidateId]: newVotes
    }));
  };
  
  const handleSubmitVote = async () => {
    let voteData;
    
    switch(votingMethod) {
      case 'approval':
        voteData = Object.keys(approvalVotes).filter(id => approvalVotes[id]).map(id => parseInt(id));
        break;
      case 'ranked':
        voteData = rankedVotes.reduce((acc, candidateId, index) => {
          acc[candidateId] = index + 1;
          return acc;
        }, {});
        break;
      case 'quadratic':
        voteData = quadraticVotes;
        break;
      default:
        voteData = {};
    }
    
    try {
      await castVote(electionId, voteData);
      navigate(`/confirmation/${electionId}`);
    } catch (error) {
      console.error("Error casting vote:", error);
      alert("Failed to cast vote. Please try again.");
    }
  };
  
  const activateVoiceAssistant = () => {
    setVoiceActive(true);
    setVoiceMessage("Hi, I'm Vee! How can I help with your voting process today?");
    
    setTimeout(() => {
      setVoiceActive(false);
    }, 5000);
  };
  
  const renderVotingInterface = () => {
    switch(votingMethod) {
      case 'approval':
        return (
          <div className="space-y-4">
            <h2 className="text-xl text-white font-medium mb-4">Select all candidates you approve of:</h2>
            {candidates.map(candidate => (
              <motion.div 
                key={candidate.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApprovalVote(candidate.id)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  approvalVotes[candidate.id] ? 'bg-green-600' : 'bg-white/20'
                }`}
              >
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{candidate.name}</h3>
                    <p className="text-blue-200 text-sm">{candidate.description}</p>
                  </div>
                  <div className="ml-auto">
                    {approvalVotes[candidate.id] ? (
                      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-white/50"></div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
        
      case 'ranked':
        return (
          <div className="space-y-4">
            <h2 className="text-xl text-white font-medium mb-4">Rank candidates by preference (drag to reorder):</h2>
            <div className="bg-white/10 rounded-lg p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-2 text-blue-200">Rank</th>
                    <th className="px-4 py-2 text-blue-200">Candidate</th>
                    <th className="px-4 py-2 text-blue-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => {
                    const rank = rankedVotes.indexOf(candidate.id);
                    return (
                      <tr key={candidate.id} className={`${rank >= 0 ? 'bg-blue-900/30' : ''}`}>
                        <td className="px-4 py-3 text-white">
                          {rank >= 0 ? rank + 1 : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                              {candidate.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{candidate.name}</h3>
                              <p className="text-blue-200 text-xs">{candidate.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            {[...Array(candidates.length)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => handleRankedVote(candidate.id, i)}
                                className={`h-8 w-8 rounded-full ${rank === i ? 'bg-green-500' : 'bg-white/20'} flex items-center justify-center text-xs font-medium`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            {rank >= 0 && (
                              <button
                                onClick={() => handleRankedVote(candidate.id, -1)}
                                className="h-8 w-8 rounded-full bg-red-500/70 flex items-center justify-center"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'quadratic':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-white font-medium">Allocate your voting power:</h2>
              <div className="bg-blue-800 text-white px-4 py-2 rounded-lg">
                <span className="font-bold">{remainingCredits}</span> credits remaining
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg mb-4">
              <p className="text-blue-200 text-sm">
                In quadratic voting, the cost of votes increases quadratically. 
                1 vote costs 1 credit, 2 votes cost 4 credits, 3 votes cost 9 credits, and so on.
                This lets you express intensity of preference.
              </p>
            </div>
            
            {candidates.map(candidate => {
              const voteCount = quadraticVotes[candidate.id] || 0;
              const voteCost = voteCount * voteCount;
              
              return (
                <motion.div 
                  key={candidate.id}
                  className="bg-white/20 rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{candidate.name}</h3>
                        <p className="text-blue-200 text-sm">{candidate.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => handleQuadraticVote(candidate.id, 'decrease')}
                        disabled={voteCount === 0}
                        className={`h-10 w-10 rounded-full ${voteCount === 0 ? 'bg-gray-600/50' : 'bg-red-500/70'} flex items-center justify-center text-white`}
                      >
                        −
                      </button>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-white">{voteCount}</div>
                        <div className="text-xs text-blue-200">
                          Cost: {voteCost} credits
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleQuadraticVote(candidate.id, 'increase')}
                        disabled={(voteCount + 1) * (voteCount + 1) - voteCost > remainingCredits}
                        className={`h-10 w-10 rounded-full ${(voteCount + 1) * (voteCount + 1) - voteCost > remainingCredits ? 'bg-gray-600/50' : 'bg-green-500'} flex items-center justify-center text-white`}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="mt-3 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${(voteCount / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
        
      default:
        return (
          <div className="text-center p-8 text-white/70">
            Voting method not supported.
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-white text-xl">Loading voting interface...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{currentElection?.title}</h1>
              <p className="text-blue-200">{currentElection?.description}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={activateVoiceAssistant}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </motion.button>
          </div>
          
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/80 p-4 rounded-lg mb-6"
            >
              <div className="flex items-start">
                <div className="bg-blue-600 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Need help with {votingMethod} voting?</h3>
                  <p className="text-blue-200 text-sm">
                    {votingMethod === 'approval' && "Select all candidates you approve of. You can vote for multiple candidates."}
                    {votingMethod === 'ranked' && "Rank candidates in order of preference. #1 is your most preferred choice."}
                    {votingMethod === 'quadratic' && "Allocate votes based on how strongly you feel. Each additional vote costs more credits."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-white/70 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
          
          {voiceActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-8 right-8 bg-purple-700 text-white p-4 rounded-lg shadow-lg max-w-sm"
            >
              <div className="flex items-start">
                <div className="mr-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white">{voiceMessage}</p>
                </div>
                <button 
                  onClick={() => setVoiceActive(false)}
                  className="text-white/70 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
          
          {showBiasInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-900/90 p-5 rounded-lg mb-6"
            >
              <div className="flex items-start mb-3">
                <div className="bg-yellow-500 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">Be aware of voting biases</h3>
                  <p className="text-blue-200 text-sm">
                    Common biases in voting include name-order effects, proximity bias, and emotional decision-making. 
                    Take your time to consider each candidate's qualifications objectively.
                  </p>
                </div>
                <button 
                  onClick={() => setShowBiasInfo(false)}
                  className="text-white/70 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-800/50 p-3 rounded">
                  <h4 className="font-medium text-white">Name-Order Effect</h4>
                  <p className="text-blue-200">Candidates listed first often receive more votes regardless of merit.</p>
                </div>
                <div className="bg-blue-800/50 p-3 rounded">
                  <h4 className="font-medium text-white">Bandwagon Effect</h4>
                  <p className="text-blue-200">Tendency to support candidates who appear popular or likely to win.</p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="mt-6">
            {renderVotingInterface()}
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setShowBiasInfo(!showBiasInfo)}
              className="text-blue-200 hover:text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Bias information
            </button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitVote}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-medium flex items-center"
            >
              Submit Vote
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </motion.div>       
      </div>
    </div>
  );
};

export default VoteCasting;