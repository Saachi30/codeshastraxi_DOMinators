import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

const Login = ({ toggleAuth }) => {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('face');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // Camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // OTP state
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  
  // Initialize refs for OTP inputs
  useEffect(() => {
    otpRefs.current = Array(6).fill().map((_, i) => otpRefs.current[i] || React.createRef());
  }, []);
  
  // Start camera when face auth is selected
  useEffect(() => {
    if (authMethod === 'face' && !cameraActive) {
      startCamera();
    } else if (authMethod !== 'face' && cameraActive) {
      stopCamera();
    }
    
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [authMethod]);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setMessage("Camera access denied. Please enable camera or try another method.");
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  const captureFrame = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Return the canvas data URL
      return canvasRef.current.toDataURL('image/jpeg');
    }
    return null;
  };
  
  // For demo purposes, we'll simulate face verification success
  const simulateCompareFaces = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 80% chance of success for demo
        resolve(Math.random() > 0.2);
      }, 2000);
    });
  };
  
  const scanFace = async () => {
    // Check if email/password is provided
    if (!email || !password) {
      setMessage("Please enter your email and password to verify your identity");
      return;
    }
    
    setLoading(true);
    setMessage("Scanning face... Please remain still");
    
    // Simulate face scanning progress
    const incrementProgress = () => {
      setProgress(prev => {
        if (prev < 100) {
          setTimeout(incrementProgress, 20);
          return prev + 1;
        }
        return prev;
      });
    };
    
    incrementProgress();
    
    try {
      // Capture the frame
      const frameData = captureFrame();
      
      // Sign in with email/password
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the user's stored Aadhar image URL from Firestore
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Instead of face comparison, use simple simulated verification
        const isMatch = await simulateCompareFaces();
        
        if (isMatch) {
          setMessage("Face verification successful!");
          
          // Navigate to dashboard after short delay
          setTimeout(() => {
            navigate('/home');
          }, 1500);
        } else {
          setMessage("Face verification failed. Please try again or use another method.");
        }
      } else {
        setMessage("User profile not found.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };
  
  const verifySMSCode = () => {
    // Check if email/password is provided
    if (!email || !password) {
      setMessage("Please enter your email and password");
      return;
    }
    
    setLoading(true);
    setMessage("Verifying SMS code...");
    
    // Check if all OTP fields are filled
    const code = otpCode.join('');
    if (code.length !== 6) {
      setMessage("Please enter a complete 6-digit code");
      setLoading(false);
      return;
    }
    
    // Simulate SMS verification (in real app, this would verify with Firebase Auth or custom backend)
    const mockVerify = async () => {
      try {
        // First authenticate with email/password
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, password);
        
        // Then verify the SMS code (for demo, we'll use a fixed code)
        if (code === "123456") {
          setMessage("SMS verification successful!");
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setMessage("Invalid code. Please try again.");
        }
      } catch (error) {
        console.error("SMS verification error:", error);
        setMessage(error.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    };
    
    mockVerify();
  };
  
  const verifyHardware = () => {
    // Check if email/password is provided
    if (!email || !password) {
      setMessage("Please enter your email and password");
      return;
    }
    
    setLoading(true);
    setMessage("Waiting for hardware token...");
    
    // Simulate hardware token verification
    setTimeout(async () => {
      try {
        // First authenticate with email/password
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, password);
        
        // Then simulate hardware token verification
        setMessage("Hardware token verified!");
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (error) {
        console.error("Hardware verification error:", error);
        setMessage(error.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };
  
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Handle backspace for empty fields
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };
  
  const renderAuthMethod = () => {
    return (
      <>
        {/* Email/Password Fields (Common for all methods) */}
        <div className="w-full max-w-md mb-6 justify-center items-center mx-auto">
          <div className="space-y-4 justify-center items-center mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 text-black border border-gray-300 rounded-lg focus:ring-[#99BC85] focus:border-[#99BC85]"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 text-black py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-[#99BC85] focus:[#99BC85"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>
        
        {/* Method-specific UI */}
        {authMethod === 'face' && (
          <div className="flex flex-col items-center">
            <div className={`relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden ${loading ? 'pulse-border' : ''}`}>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                autoPlay 
                playsInline
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
              
              {/* Face alignment overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-3/4 h-3/4 mx-auto mt-6 border-2 border-dashed border-blue-400 rounded-full opacity-50" />
              </div>
              
              {/* Status indicator - simplified to always show active when camera is on */}
              <div className="absolute bottom-4 left-4 flex items-center">
                <div className={`w-3 h-3 rounded-full ${cameraActive ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                <span className="text-xs text-white">{cameraActive ? 'Camera Active' : 'Camera Inactive'}</span>
              </div>
              
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="w-full max-w-xs">
                    <div className="bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-blue-300">{message}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <p className="mb-4 text-blue-600">{message || "Center your face in the frame and click Verify."}</p>
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:text-gray-200"
                onClick={scanFace}
                disabled={loading || !cameraActive}
              >
                {loading ? "Verifying..." : "Verify Face"}
              </button>
            </div>
            
            {/* Help modal */}
            {showHelp && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full border border-blue-200">
                  <h3 className="text-xl font-bold mb-3 text-blue-600">Need Help?</h3>
                  <p className="text-gray-700 mb-4">
                    It looks like you might need some assistance with the face verification process.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    <li>Make sure your face is well-lit</li>
                    <li>Center your face in the frame</li>
                    <li>Remove glasses or face coverings</li>
                    <li>Try to maintain a neutral expression</li>
                    <li>Try a different authentication method if needed</li>
                  </ul>
                  <div className="flex justify-end">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setShowHelp(false)}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {authMethod === 'sms' && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-blue-600 mb-2">SMS Verification</h3>
              <p className="text-gray-700">Enter the 6-digit code sent to your registered phone</p>
              {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
            </div>
            
            <div className="flex justify-center gap-2 mb-6">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs.current[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-16 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:text-gray-200"
                onClick={verifySMSCode}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              
              <button 
                className="w-full py-2 bg-transparent border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Resend Code
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Demo hint: Use code "123456"
              </p>
            </div>
          </div>
        )}
        
        {authMethod === 'hardware' && (
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-blue-600 mb-2">Hardware Token</h3>
              <p className="text-gray-700">Connect your hardware security key to continue</p>
              {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-blue-100 border-2 border-blue-200 rounded-xl flex items-center justify-center">
                <div className={`text-5xl ${loading ? 'animate-pulse' : ''}`}>🔑</div>
              </div>
            </div>
            
            <button 
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:text-gray-200"
              onClick={verifyHardware}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect Token"}
            </button>
          </div>
        )}
      </>
    );
  };
  
  return (
    <motion.div 
      className="w-full max-w-3xl bg-white/90 backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-2xl border border-blue-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#99BC85]"> Login</h2>
      <p className="text-center text-gray-600 mb-6">Verify your identity to continue</p>
      
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${authMethod === 'face' ? 'bg-[#99BC85] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setAuthMethod('face')}
          >
            Face
          </button>
          {/* <button 
            className={`px-4 py-2 rounded-md transition-colors ${authMethod === 'sms' ? 'bg-[#99BC85] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setAuthMethod('sms')}
          >
            SMS
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${authMethod === 'hardware' ? 'bg-[#99BC85] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setAuthMethod('hardware')}
          >
            Hardware
          </button> */}
        </div>
      </div>
      
      {loading && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-blue-500">{message}</p>
        </div>
      )}
      
      {renderAuthMethod()}
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={toggleAuth}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;