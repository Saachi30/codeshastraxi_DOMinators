import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authMethod, setAuthMethod] = useState(null);
  const [geoLocation, setGeoLocation] = useState(null);
  
  // Mock voter database - in a real app this would be a backend service
  const voterDatabase = [
    { id: 1, name: 'John Doe', face_id: 'face123', phone: '+1234567890', eligible_regions: ['NY', 'CA'] },
    { id: 2, name: 'Jane Smith', face_id: 'face456', phone: '+0987654321', eligible_regions: ['TX', 'FL'] },
  ];
  
  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    // Get geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    }
    
    setLoading(false);
  }, []);
  
  // Verify biometric authentication (face recognition)
  const verifyBiometric = async (faceData) => {
    try {
      setLoading(true);
      // This would call your face recognition API
      // For demo purposes, we'll just simulate a successful match
      
      const matchedUser = voterDatabase.find(user => user.face_id === 'face123');
      
      if (matchedUser) {
        // Check geo-fence if applicable
        if (!isWithinGeoFence(matchedUser)) {
          setAuthError("You are not eligible to vote in this region");
          setLoading(false);
          return false;
        }
        
        setCurrentUser(matchedUser);
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        setAuthMethod('biometric');
        setLoading(false);
        return true;
      } else {
        setAuthError("Face not recognized");
        setLoading(false);
        return false;
      }
    } catch (error) {
      setAuthError("Authentication failed");
      setLoading(false);
      return false;
    }
  };
  
  // Verify SMS authentication
  const verifySMS = async (phone, code) => {
    try {
      setLoading(true);
      // This would call your SMS verification API
      // For demo purposes, we'll just simulate a successful match if code is "123456"
      
      if (code === "123456") {
        const matchedUser = voterDatabase.find(user => user.phone === phone);
        
        if (matchedUser) {
          // Check geo-fence if applicable
          if (!isWithinGeoFence(matchedUser)) {
            setAuthError("You are not eligible to vote in this region");
            setLoading(false);
            return false;
          }
          
          setCurrentUser(matchedUser);
          localStorage.setItem('currentUser', JSON.stringify(matchedUser));
          setAuthMethod('sms');
          setLoading(false);
          return true;
        } else {
          setAuthError("Phone number not registered");
          setLoading(false);
          return false;
        }
      } else {
        setAuthError("Invalid verification code");
        setLoading(false);
        return false;
      }
    } catch (error) {
      setAuthError("Authentication failed");
      setLoading(false);
      return false;
    }
  };
  
  // Verify hardware token
  const verifyHardwareToken = async (tokenCode) => {
    try {
      setLoading(true);
      // This would call your hardware token verification API
      // For demo purposes, we'll just simulate a successful match if tokenCode starts with "HW-"
      
      if (tokenCode.startsWith("HW-")) {
        // Find a mock user for demo
        const matchedUser = voterDatabase[0]; 
        
        // Check geo-fence if applicable
        if (!isWithinGeoFence(matchedUser)) {
          setAuthError("You are not eligible to vote in this region");
          setLoading(false);
          return false;
        }
        
        setCurrentUser(matchedUser);
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        setAuthMethod('hardware');
        setLoading(false);
        return true;
      } else {
        setAuthError("Invalid hardware token");
        setLoading(false);
        return false;
      }
    } catch (error) {
      setAuthError("Authentication failed");
      setLoading(false);
      return false;
    }
  };
  
  // Check if user is within allowed geo-fence
  const isWithinGeoFence = (user) => {
    // This would implement actual geo-fencing logic
    // For demo purposes, we'll just return true
    return true;
  };
  
  // Sign out
  const signOut = () => {
    setCurrentUser(null);
    setAuthMethod(null);
    localStorage.removeItem('currentUser');
  };
  
  const value = {
    currentUser,
    loading,
    authError,
    authMethod,
    geoLocation,
    verifyBiometric,
    verifySMS,
    verifyHardwareToken,
    signOut
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};