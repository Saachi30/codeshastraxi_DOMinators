import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-b from-[#99BC85]  to-[#7FA56D] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-black">Loading SecureVote</h2>
        <p className="text-blue-200 mt-2">Setting up your secure voting environment...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;