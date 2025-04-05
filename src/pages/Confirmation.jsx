import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { FaCheckCircle, FaShareAlt, FaLinkedin, FaTwitter, FaDownload, FaSmile, FaMeh, FaFrown } from 'react-icons/fa';
// import { AuthContext } from '../contexts/AuthContext';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 

const VoteConfirmation = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);
  const [nftGenerated, setNftGenerated] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  const voteData = {
    timestamp: new Date().toLocaleString(),
    electionName: "Community Development Initiative",
    electionId: "election-1",
    voterLevel: "Gold Participant",
    transactionHash: "0x8a39f5d7b79dfe9b3c2f26fd7d7e48871fc8f36f9e66d1e8",
    alignmentScore: 87,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setNftGenerated(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    navigate('/analytics');
  };

  const downloadCertificate = () => {
    alert("Certificate downloading...");
  };

  const submitFeedback = async () => {
    if (!selectedSentiment || !feedbackText.trim()) {
      alert("Please select a sentiment and provide feedback");
      return;
    }

    setIsSubmittingFeedback(true);
    
    try {
      // Send feedback to your Flask API
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: feedbackText,
          userId: currentUser?.uid,
          electionId: voteData.electionId
        }),
      });

      const result = await response.json();
      
      // Store in Firebase
      if (currentUser) {
        const db = getFirestore();
        await setDoc(doc(db, "sentiments", `${currentUser.uid}_${Date.now()}`), {
          text: feedbackText,
          sentiment: result.sentiment,
          confidence: result.confidence,
          electionId: voteData.electionId,
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
          modelAnalysis: result
        });
      }

      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center px-4 py-12">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Successfully Cast!</h1>
          <p className="text-gray-600 mb-6">Your voice has been securely recorded on the blockchain</p>
          
          {/* Vote details section */}
          <div className="border-t border-b border-gray-200 py-4 my-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">Timestamp:</span>
              <span>{voteData.timestamp}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">Election:</span>
              <span>{voteData.electionName}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">Transaction:</span>
              <span className="truncate w-32">{voteData.transactionHash}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">Policy Alignment:</span>
              <span>{voteData.alignmentScore}% with eco-progressive policies</span>
            </div>
          </div>
          
          {/* NFT Certificate section */}
          {nftGenerated ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-3">Voter Certificate NFT</h2>
              <div className="relative mx-auto w-64 h-64 rounded-lg overflow-hidden border-4 border-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  <div>
                    <div className="text-xs opacity-80">Verified Voter</div>
                    <div className="text-lg font-bold">{voteData.voterLevel}</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2">
                      <span className="text-3xl text-indigo-600">✓</span>
                    </div>
                    <div className="text-sm text-center font-medium">{voteData.electionName}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs opacity-80">#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
                    <div className="text-xs">{voteData.timestamp.split(',')[0]}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-lg text-gray-600">Generating your certificate...</p>
            </div>
          )}
          
          {/* Feedback Section */}
          {!feedbackSubmitted && nftGenerated && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Share your voting experience</h3>
              
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setSelectedSentiment('positive')}
                  className={`p-3 rounded-full ${selectedSentiment === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  <FaSmile className="text-2xl" />
                  <span className="text-xs mt-1 block">Positive</span>
                </button>
                <button
                  onClick={() => setSelectedSentiment('neutral')}
                  className={`p-3 rounded-full ${selectedSentiment === 'neutral' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  <FaMeh className="text-2xl" />
                  <span className="text-xs mt-1 block">Neutral</span>
                </button>
                <button
                  onClick={() => setSelectedSentiment('negative')}
                  className={`p-3 rounded-full ${selectedSentiment === 'negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  <FaFrown className="text-2xl" />
                  <span className="text-xs mt-1 block">Negative</span>
                </button>
              </div>
              
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your voting experience..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                rows="3"
              />
              
              <button
                onClick={submitFeedback}
                disabled={isSubmittingFeedback}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </motion.div>
          )}
          
          {feedbackSubmitted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg"
            >
              Thank you for your feedback! Your response helps improve the voting experience.
            </motion.div>
          )}
        </div>
        
        {nftGenerated && (
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <button 
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={() => alert("Sharing to LinkedIn...")}
              >
                <FaLinkedin className="mr-2" /> Share
              </button>
              <button 
                className="flex items-center px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition"
                onClick={() => alert("Sharing to Twitter...")}
              >
                <FaTwitter className="mr-2" /> Share
              </button>
              <button 
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={downloadCertificate}
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
            
            <button 
              onClick={handleGoToDashboard}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              View Live Analytics Dashboard
            </button>
          </div>
        )}
      </motion.div>
      
      <div className="mt-6 text-white text-sm text-center">
        <p>Your vote has been recorded with transaction ID: {voteData.transactionHash.substring(0, 10)}...</p>
        <p className="mt-1">Participation NFT minted to your wallet and is transferable</p>
      </div>
    </div>
  );
};

export default VoteConfirmation;