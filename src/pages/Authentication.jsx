import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Authentication = () => {
  const navigate = useNavigate();
  const { verifyBiometric, verifySMS, verifyHardwareToken } = useAuth(); // Updated to use the correct functions
  const [authMethod, setAuthMethod] = useState('face');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [emotion, setEmotion] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [mfaVerified, setMfaVerified] = useState({
    face: false,
    sms: false,
    hardware: false
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
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
      
      // For demo purposes - return the canvas data URL
      return canvasRef.current.toDataURL('image/jpeg');
    }
    return null;
  };
  
  const scanFace = async () => {
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
      // Capture image data (not used in demo)
      const frameData = captureFrame();
      
      // Simulate AI verification with random emotions (in real app, this would be ML-based)
      setTimeout(() => {
        const emotions = ['neutral', 'confused', 'anxious', 'normal'];
        const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setEmotion(detectedEmotion);
        
        if (detectedEmotion === 'confused') {
          setShowHelp(true);
          setMessage("You seem confused. Would you like some help?");
          setLoading(false);
        } else if (detectedEmotion === 'anxious') {
          setMessage("Please relax and try again. Take a deep breath.");
          setLoading(false);
        } else {
          // Successfully recognized face
          setMfaVerified(prev => ({ ...prev, face: true }));
          setMessage("Face verification successful!");
          
          // Use verifyBiometric from context
          verifyBiometric(frameData).then(success => {
            setLoading(false);
            if (success) {
              navigate('/dashboard'); // Navigate to dashboard on success
            }
          });
        }
        
        setProgress(100);
      }, 2000);
      
    } catch (error) {
      console.error("Face verification failed:", error);
      setMessage("Face verification failed. Please try again or use a different method.");
      setLoading(false);
    }
  };
  
  const verifySMSCode = () => {
    setLoading(true);
    setMessage("Verifying SMS code...");
    
    // Check if all OTP fields are filled
    const code = otpCode.join('');
    if (code.length !== 6) {
      setMessage("Please enter a complete 6-digit code");
      setLoading(false);
      return;
    }
    
    // Use verifySMS from context
    const phone = '+1234567890'; // In a real app, this would be stored or entered by the user
    verifySMS(phone, code).then(success => {
      if (success) {
        setMfaVerified(prev => ({ ...prev, sms: true }));
        setMessage("SMS verification successful!");
        
        setTimeout(() => {
          setLoading(false);
          navigate('/dashboard'); // Navigate to dashboard
        }, 1000);
      } else {
        setMessage("Invalid code. Please try again.");
        setLoading(false);
      }
    });
  };
  
  const verifyHardware = () => {
    setLoading(true);
    setMessage("Waiting for hardware token...");
    
    // Use verifyHardwareToken from context
    const tokenCode = 'HW-12345'; // In a real app, this would come from the hardware token
    verifyHardwareToken(tokenCode).then(success => {
      if (success) {
        setMfaVerified(prev => ({ ...prev, hardware: true }));
        setMessage("Hardware token verified!");
        
        setTimeout(() => {
          setLoading(false);
          navigate('/dashboard'); // Navigate to dashboard
        }, 1000);
      } else {
        setMessage("Hardware token verification failed. Please try again.");
        setLoading(false);
      }
    });
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
    switch (authMethod) {
      case 'face':
        return (
          <div className="flex flex-col items-center">
            <div className={`relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden ${loading ? 'pulse-border' : ''}`}>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                autoPlay 
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face alignment overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-3/4 h-3/4 mx-auto mt-6 border-2 border-dashed border-blue-400 rounded-full opacity-50" />
              </div>
              
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="w-full max-w-xs">
                    <div className="bg-gray-800 rounded-full h-2 mb-2">
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
              <p className="mb-4 text-blue-200">{message || "Align your face with the frame and blink once to begin."}</p>
              <button
                className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={scanFace}
                disabled={loading}
              >
                {loading ? "Scanning..." : "Scan Face"}
              </button>
            </div>
            
            {/* Emotion detection help modal */}
            {showHelp && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-blue-500/30">
                  <h3 className="text-xl font-bold mb-3 text-blue-300">Need Help?</h3>
                  <p className="text-gray-200 mb-4">
                    It looks like you might need some assistance with the verification process.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-200 mb-4">
                    <li>Make sure your face is well-lit</li>
                    <li>Center your face in the frame</li>
                    <li>Remove glasses or face coverings</li>
                    <li>Try a different authentication method if needed</li>
                  </ul>
                  <div className="flex justify-end">
                    <button 
                      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setShowHelp(false)}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'sms':
        return (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-blue-300 mb-2">SMS Verification</h3>
              <p className="text-gray-300">Enter the 6-digit code sent to your registered phone</p>
              {message && <p className="mt-2 text-sm text-blue-400">{message}</p>}
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
                  className="w-12 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
                onClick={verifySMSCode}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              
              <button 
                className="w-full py-2 bg-transparent border border-gray-600 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Resend Code
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Demo hint: Use code "123456"
              </p>
            </div>
          </div>
        );
      
      case 'hardware':
        return (
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-blue-300 mb-2">Hardware Token</h3>
              <p className="text-gray-300">Connect your hardware security key to continue</p>
              {message && <p className="mt-2 text-sm text-blue-400">{message}</p>}
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-blue-900/40 border-2 border-blue-500/50 rounded-xl flex items-center justify-center">
                <div className={`text-5xl ${loading ? 'animate-pulse' : ''}`}>🔑</div>
              </div>
            </div>
            
            <button 
              className="w-full py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
              onClick={verifyHardware}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect Token"}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const renderProgressSteps = () => {
    const steps = [
      { name: "Face", completed: mfaVerified.face },
      { name: "SMS", completed: mfaVerified.sms },
      { name: "Token", completed: mfaVerified.hardware }
    ];
    
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div 
              className={`flex flex-col items-center ${step > i+1 || s.completed ? 'text-blue-400' : 'text-gray-500'}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm mb-1
                  ${step === i+1 ? 'bg-blue-600 text-white' : ''}
                  ${step > i+1 || s.completed ? 'bg-blue-900 text-blue-200' : 'bg-gray-800 text-gray-400'}`}
              >
                {s.completed ? '✓' : i+1}
              </div>
              <span className="text-xs">{s.name}</span>
            </div>
            
            {i < steps.length - 1 && (
              <div 
                className={`w-16 h-px mx-2 ${step > i+1 ? 'bg-blue-500' : 'bg-gray-700'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div 
        className="w-full max-w-3xl bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-2xl border border-blue-900/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-blue-300">Authentication Required</h2>
        <p className="text-center text-gray-400 mb-6">Please verify your identity to continue</p>
        
        {renderProgressSteps()}
        
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${authMethod === 'face' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setAuthMethod('face')}
            >
              Face
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${authMethod === 'sms' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setAuthMethod('sms')}
            >
              SMS
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${authMethod === 'hardware' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setAuthMethod('hardware')}
            >
              Hardware
            </button>
          </div>
        </div>
        
        {renderAuthMethod()}
      </motion.div>
      
      <div className="mt-6 text-gray-400 text-sm">
        Having trouble? <button className="text-blue-400 hover:underline">Contact Support</button>
      </div>
    </div>
  );
};

export default Authentication;