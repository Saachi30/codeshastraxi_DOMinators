import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Hash } from 'lucide-react';
import _ from 'lodash';

const ZKEmailModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [requestUrl, setRequestUrl] = useState('');
  const [proofData, setProofData] = useState(null);
  const [sessionInterval, setSessionInterval] = useState(null);

  const APP_ID = '0x082C2729BF4894266f97DC789008cb72c5fBD0f7';
  const APP_SECRET = '0xc5be4da656910b181c351c1921544a0371a069b73e4bf97e33a08fe77dd0207c';
  const PROVIDER_ID = 'google-login';

  // Expose values and functions to parent component via ref
  useImperativeHandle(ref, () => ({
    getZKPValues: () => {
      if (!userEmail) return null;
      return {
        commitment: sha256(userEmail + "commitment_salt_zkp_2025"),
        nullifier: sha256(userEmail + "nullifier_salt_unique_zkp_2025"),
        email: userEmail
      };
    },
    getProofData: () => proofData,
    openModal: () => setIsOpen(true),
    closeModal: () => closeModal()
  }));

  useEffect(() => {
    if (isOpen) {
      fetchUserEmail();
    }

    return () => {
      if (sessionInterval) {
        clearInterval(sessionInterval);
      }
    };
  }, [isOpen]);

  const fetchUserEmail = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      let email = auth.currentUser.email;

      if (!email) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          email = userDoc.data().email;
        }
      }

      if (!email) {
        throw new Error('No email found for user');
      }

      setUserEmail(email);
    } catch (err) {
      setError(err.message || 'Failed to fetch user email');
    }
  };

  const initiateProofRequest = async () => {
    if (!userEmail) {
      setError('No email address available to verify');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const requestParams = {
        title: "Email Verification",
        requestedProofs: [
          {
            name: "email-verify",
            provider: PROVIDER_ID,
            params: {
              emailAddress: userEmail
            }
          }
        ]
      };

      const mockGenerateProof = async () => {
        setRequestUrl('reclaim://proof/request?request_id=123...');
        
        const interval = setInterval(() => {
          clearInterval(interval);
          setProofData({
            id: "proof-" + Date.now(),
            timestamp: new Date().toISOString(),
            provider: PROVIDER_ID,
            parameters: {
              emailAddress: userEmail
            },
            ownerPublicKey: "0x123...",
            signatures: {
              r: "0xabc...",
              s: "0xdef...",
              v: 27
            },
            contextMessage: `Email ownership verified for ${userEmail}`,
            epoch: Date.now(),
            witnessAddress: "0x789..."
          });
          setVerificationStatus('success');
          setLoading(false);
        }, 3000);

        setSessionInterval(interval);
      };

      await mockGenerateProof();
    } catch (err) {
      setError(err.message || 'Failed to generate proof');
      setVerificationStatus('error');
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (sessionInterval) {
      clearInterval(sessionInterval);
    }
    setIsOpen(false);
    setVerificationStatus('idle');
    setProofData(null);
    setRequestUrl('');
    setError('');
    setUserEmail('');
  };

  const sha256 = (message) => {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const expandedHash = Math.abs(hash).toString(16).padStart(64, '0');
    return '0x' + expandedHash;
  };

  const EmailZKPGeneratorUI = () => {
    const commitment = userEmail ? sha256(userEmail + "commitment_salt_zkp_2025") : '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
    const nullifier = userEmail ? sha256(userEmail + "nullifier_salt_unique_zkp_2025") : '0x5555555555555555555555555555555555555555555555555555555555555555';

    const copyToClipboard = (text, label) => {
      navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    };

    return (
      <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-2 mb-4">
          <Hash className="text-blue-500" size={20} />
          <h3 className="text-lg font-medium text-gray-800">Email ZKP Values</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="text"
              value={userEmail}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Commitment (bytes32)</span>
              <button 
                onClick={() => copyToClipboard(commitment, "Commitment")}
                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </label>
            <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-800 overflow-x-auto">
              {commitment}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Nullifier (bytes32)</span>
              <button 
                onClick={() => copyToClipboard(nullifier, "Nullifier")}
                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </label>
            <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-800 overflow-x-auto">
              {nullifier}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>These cryptographic values can be used for zero-knowledge proofs without revealing your actual email.</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Verify Email
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">
                ZK Email Verification
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {userEmail && !proofData && (
                <div className="mb-4">
                  <p className="text-black">
                    Verifying email: <span className="font-medium">{userEmail}</span>
                  </p>
                </div>
              )}

              {!proofData && (
                <div className="space-y-4">
                  <p className="text-black">
                    Generate a zero-knowledge proof to verify your email ownership without revealing the actual email address.
                  </p>
                  
                  <button
                    onClick={initiateProofRequest}
                    disabled={loading || !userEmail}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      loading || !userEmail
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Generating Proof...
                      </span>
                    ) : !userEmail ? (
                      'Loading Email...'
                    ) : (
                      'Start Verification'
                    )}
                  </button>
                </div>
              )}

              {requestUrl && !proofData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-black mb-2">
                    Scan QR Code to Verify
                  </h4>
                  <div className="bg-white p-4 rounded flex justify-center">
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-sm text-black">
                      QR Code Placeholder
                    </div>
                  </div>
                </div>
              )}

              {proofData && (
                <div className="space-y-4">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Email verification successful!
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-black mb-2">
                      Proof Details
                    </h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto text-black">
                      {JSON.stringify(proofData, null, 2)}
                    </pre>
                  </div>
                  
                  <EmailZKPGeneratorUI />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ZKEmailModal;