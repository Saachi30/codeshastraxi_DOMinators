
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Login from './Login';
import Signup from './Signup';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-950 bg-opacity-90 bg-gradient-to-b from-gray-900 to-blue-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>
      
      {/* App logo/title */}
      <div className="mb-8 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Secure<span className="text-blue-400">Vote</span>
          </h1>
          <p className="text-gray-300 text-lg">Multi-factor authentication for secure voting</p>
        </motion.div>
      </div>
      
      {/* Authentication component */}
      <motion.div 
        key={isLogin ? 'login' : 'signup'}
        initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl relative z-10"
      >
        {isLogin ? (
          <Login toggleAuth={toggleAuth} />
        ) : (
          <Signup toggleAuth={toggleAuth} />
        )}
      </motion.div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-sm relative z-10">
        <p>© 2025 SecureVote · <a href="#" className="hover:text-blue-400">Privacy</a> · <a href="#" className="hover:text-blue-400">Terms</a></p>
      </div>
    </div>
  );
};

export default Authentication;