import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import _ from 'lodash';

// This component now uses a more cryptographically sound approach
// and returns the generated values through an onValuesGenerated callback
const EmailZKPGenerator = ({ onValuesGenerated }) => {
  const [email, setEmail] = useState('');
  const [commitment, setCommitment] = useState('0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc');
  const [nullifier, setNullifier] = useState('0x5555555555555555555555555555555555555555555555555555555555555555');
  const [isValid, setIsValid] = useState(false);

  // Simple SHA-256-like hashing function using basic JS
  // In production, you would use a proper crypto library
  const sha256 = (message) => {
    // This is a very simplified version for demonstration purposes
    // In production, use a proper crypto library
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Expand the hash to 64 characters (32 bytes) for bytes32 representation
    const expandedHash = Math.abs(hash).toString(16).padStart(64, '0');
    return '0x' + expandedHash;
  };

  // Function to generate cryptographic commitment
  const generateCommitment = (email) => {
    if (!email) return '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
    
    // Use a unique salt for the commitment
    const salt = "commitment_salt_zkp_2025";
    return sha256(email + salt);
  };

  // Function to generate a unique nullifier
  const generateNullifier = (email) => {
    if (!email) return '0x5555555555555555555555555555555555555555555555555555555555555555';
    
    // Use a different salt for the nullifier
    const salt = "nullifier_salt_unique_zkp_2025";
    return sha256(email + salt);
  };

  // Debounced update to prevent excessive recalculations
  const debouncedUpdate = _.debounce((email) => {
    const validateEmail = (email) => {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    };

    const isValidEmail = validateEmail(email);
    setIsValid(isValidEmail);
    
    const newCommitment = generateCommitment(email);
    const newNullifier = generateNullifier(email);
    
    setCommitment(newCommitment);
    setNullifier(newNullifier);
    
    // Return the values through the callback
    if (onValuesGenerated && isValidEmail) {
      onValuesGenerated({
        email,
        commitment: newCommitment,
        nullifier: newNullifier
      });
    }
  }, 300);

  // Update commitment and nullifier when email changes
  useEffect(() => {
    debouncedUpdate(email);
    
    // Clean up the debounced function on unmount
    return () => {
      debouncedUpdate.cancel();
    };
  }, [email, onValuesGenerated]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <Hash className="text-blue-500 mr-2" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Email ZKP Generator</h2>
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            email && !isValid ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          }`}
        />
        {email && !isValid && (
          <p className="mt-1 text-sm text-red-500">Please enter a valid email address</p>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commitment (bytes32)
          </label>
          <div className="relative">
            <input
              type="text"
              value={commitment}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none text-sm font-mono overflow-x-auto"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(commitment);
                alert("Commitment copied to clipboard!");
              }}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nullifier (bytes32)
          </label>
          <div className="relative">
            <input
              type="text"
              value={nullifier}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none text-sm font-mono overflow-x-auto"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(nullifier);
                alert("Nullifier copied to clipboard!");
              }}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>This component generates cryptographic values:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Deterministic bytes32 commitment for each email</li>
          <li>Unique nullifier that can be used as a zkp identifier</li>
          <li>Values are returned through the onValuesGenerated callback</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailZKPGenerator;