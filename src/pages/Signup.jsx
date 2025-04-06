
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const Signup = ({ toggleAuth }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: 'male',
    location: '',
    aadharCard: null
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, aadharCard: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const pinataMetadata = JSON.stringify({
        name: `aadhar-${Date.now()}`,
      });
      formData.append('pinataMetadata', pinataMetadata);
      
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', pinataOptions);
      
      // Using XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.pinata.cloud/pinning/pinFileToIPFS');
        
        // Set headers
        xhr.setRequestHeader('pinata_api_key', '8c60abd9f27467cf2101');
        xhr.setRequestHeader('pinata_secret_api_key', 'd1f1282cb1531dcdd08f0b33e2dad886e908e878b8733571e5b9d4f36f90eae9');
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            // Return IPFS URL for the uploaded file
            resolve(`https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Upload failed'));
        };
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 90);
            setProgress(percentComplete);
          }
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload image to IPFS');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Creating your account...');
    
    try {
      // Validate inputs
      if (!formData.name || !formData.email || !formData.password || !formData.phone || 
          !formData.age || !formData.location || !formData.aadharCard) {
        throw new Error('Please fill all fields');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(formData.phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }
      
      // Validate age (18+ for voting)
      if (parseInt(formData.age) < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
      
      // Simulate progress
      let progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // 1. Upload Aadhar card to Pinata IPFS
      setMessage('Uploading your documents to IPFS...');
      const ipfsUrl = await uploadToPinata(formData.aadharCard);
      
      // 2. Create Firebase user account
      setMessage('Setting up your account...');
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // 3. Save user profile data to Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        location: formData.location,
        aadharCardUrl: ipfsUrl,
        createdAt: new Date().toISOString()
      });
      
      clearInterval(progressTimer);
      setProgress(100);
      setMessage('Account created successfully!');
      
      // Redirect or toggle to login after short delay
      setTimeout(() => {
        setLoading(false);
        toggleAuth();
      }, 1500);
      
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.message || "Registration failed. Please try again.");
      setLoading(false);
      setProgress(0);
    }
  };
  
  // Render document preview if a document is uploaded
  const renderDocumentPreview = () => {
    if (previewUrl) {
      return (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Document Preview:</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Aadhar Preview" 
              className="w-full max-h-40 object-contain"
            />
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <motion.div 
      className="w-full max-w-3xl bg-white/90 backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-2xl border border-blue-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#99BC85]">Create Account</h2>
      <p className="text-center text-gray-600 mb-6">Register to access secure voting</p>
      
      {loading && (
        <div className="mb-6 text-black">
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-blue-500">{message}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Create a password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your age"
                min="18"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="City, State"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card</label>
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-blue-100 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {formData.aadharCard ? 'Change File' : 'Upload Aadhar'}
                </button>
                {formData.aadharCard && (
                  <span className="ml-2 text-sm text-gray-600 truncate">
                    {formData.aadharCard.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Preview area */}
        {renderDocumentPreview()}
        
        {/* Submit button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#99BC85] rounded-lg font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:bg-[#E4EFE7]disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={toggleAuth}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Log in
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;