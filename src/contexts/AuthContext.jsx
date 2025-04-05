import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authMethod, setAuthMethod] = useState(null);
  const [geoLocation, setGeoLocation] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Firebase auth instance
  const auth = getAuth();
  const db = getFirestore();
  // Create and export the context

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile data
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
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
    
    return () => unsubscribe();
  }, [auth, db]);
  
  // Register new user
  const register = async (userData, aadharImageUrl) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        age: userData.age,
        gender: userData.gender,
        location: userData.location,
        aadharCardUrl: aadharImageUrl,
        createdAt: new Date().toISOString()
      });
      
      setAuthMethod('registration');
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      await signInWithEmailAndPassword(auth, email, password);
      setAuthMethod('email');
      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify biometric authentication with basic email/password first
  const verifyBiometric = async (email, password, capturedImage) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // First authenticate with email/password
      await signInWithEmailAndPassword(auth, email, password);
      
      // In a real app, this would send the face data to your backend for verification
      // For demo purposes, we'll simulate successful verification
      setAuthMethod('biometric');
      
      // Check geo-fence if applicable
      if (!isWithinGeoFence()) {
        setAuthError("You are not eligible to vote in this region");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Biometric verification error:", error);
      setAuthError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify SMS authentication
  const verifySMS = async (email, password, code) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // First authenticate with email/password
      await signInWithEmailAndPassword(auth, email, password);
      
      // For demo purposes, we'll use "123456" as the valid code
      if (code === "123456") {
        setAuthMethod('sms');
        
        // Check geo-fence if applicable
        if (!isWithinGeoFence()) {
          setAuthError("You are not eligible to vote in this region");
          return false;
        }
        
        return true;
      } else {
        setAuthError("Invalid verification code");
        return false;
      }
    } catch (error) {
      console.error("SMS verification error:", error);
      setAuthError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify hardware token
  const verifyHardwareToken = async (email, password, tokenCode) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // First authenticate with email/password
      await signInWithEmailAndPassword(auth, email, password);
      
      // For demo purposes, we'll check if tokenCode starts with "HW-"
      if (tokenCode.startsWith("HW-")) {
        setAuthMethod('hardware');
        
        // Check geo-fence if applicable
        if (!isWithinGeoFence()) {
          setAuthError("You are not eligible to vote in this region");
          return false;
        }
        
        return true;
      } else {
        setAuthError("Invalid hardware token");
        return false;
      }
    } catch (error) {
      console.error("Hardware token verification error:", error);
      setAuthError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is within allowed geo-fence
  const isWithinGeoFence = () => {
    // This would implement actual geo-fencing logic
    // For demo purposes, we'll just return true
    return true;
  };
  
  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setAuthMethod(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  
  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    authMethod,
    geoLocation,
    register,
    signIn,
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