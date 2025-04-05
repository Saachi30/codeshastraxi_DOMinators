import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import Logo from '../components/Logo';
// import GlobeAnimation from '../components/GlobeAnimation';

const Welcome = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [showInfo, setShowInfo] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  const content = {
    en: {
      slogan: "Vote Smart. Vote Secure. Vote Verified.",
      beginBtn: "Begin Voting",
      howItWorksBtn: "How It Works",
      assistant: "Hey Vee, tell me about this platform"
    },
    hi: {
      slogan: "स्मार्ट वोट करें। सुरक्षित वोट करें। सत्यापित वोट करें।",
      beginBtn: "वोटिंग शुरू करें",
      howItWorksBtn: "यह कैसे काम करता है",
      assistant: "हे वी, मुझे इस प्लेटफॉर्म के बारे में बताएं"
    },
    bn: {
      slogan: "স্মার্ট ভোট দিন। নিরাপদ ভোট দিন। যাচাই করা ভোট দিন।",
      beginBtn: "ভোটিং শুরু করুন",
      howItWorksBtn: "এটা কিভাবে কাজ করে",
      assistant: "হে ভি, আমাকে এই প্ল্যাটফর্ম সম্পর্কে বলুন"
    },
    ta: {
      slogan: "ஸ்மார்ட் வாக்களியுங்கள். பாதுகாப்பாக வாக்களியுங்கள். சரிபார்க்கப்பட்ட வாக்களியுங்கள்.",
      beginBtn: "வாக்களிப்பைத் தொடங்கவும்",
      howItWorksBtn: "இது எப்படி செயல்படுகிறது",
      assistant: "ஹே வீ, இந்த தளம் பற்றி எனக்குச் சொல்லுங்கள்"
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        {/* <GlobeAnimation /> */}
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-4xl bg-black bg-opacity-30 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20">
        <div className="flex flex-col items-center text-center">
          {/* <Logo className="w-32 h-32 mb-6" /> */}
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            BlockVote
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-10 text-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {content[language].slogan}
          </motion.p>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full sm:w-auto">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/auth')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {content[language].beginBtn}
            </motion.button>
            
            <motion.button
              className="px-8 py-4 bg-purple-900/50 border border-purple-500/50 rounded-xl font-bold text-lg shadow-lg hover:bg-purple-800/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInfo(!showInfo)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {content[language].howItWorksBtn}
            </motion.button>
          </div>
          
          {/* Voice Assistant Button */}
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full mb-6 hover:bg-blue-500/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            {content[language].assistant}
          </motion.button>
          
          {/* Language Selector */}
          <div className="flex gap-2 mt-4">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`px-3 py-1 rounded-md transition-all ${language === lang.code 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                onClick={() => setLanguage(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* How it works modal */}
      {showInfo && (
        <motion.div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-purple-500/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-blue-300">How BlockVote Works</h2>
            <div className="space-y-4 text-gray-200">
              <p>🔐 <strong>Multi-Factor Authentication</strong>: Your identity is verified through biometrics, SMS codes, and optional hardware tokens.</p>
              <p>🗳️ <strong>Flexible Voting Methods</strong>: Choose from approval voting, ranked-choice, or quadratic voting based on the election type.</p>
              <p>📍 <strong>Geo-Fenced Access</strong>: Some elections may be restricted to specific locations to ensure only eligible voters participate.</p>
              <p>⚖️ <strong>Smart Contract Security</strong>: Blockchain technology ensures votes cannot be tampered with and disputes are resolved automatically.</p>
              <p>🏆 <strong>NFT Certificates</strong>: Receive a unique digital certificate as proof of your civic participation.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Welcome;