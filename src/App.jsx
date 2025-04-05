import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Context Providers
import { Web3Provider } from './contexts/Web3Context';
import { AuthProvider } from './contexts/AuthContext';
import { VotingProvider } from './contexts/VotingContext';

// Pages
import Welcome from './pages/Welcome';
import Authentication from './pages/Authentication';
import VotingDashboard from './pages/VotingDashboard';
import VoteCasting from './pages/VoteCasting';
import Confirmation from './pages/Confirmation';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminDispute from './pages/AdminDispute';
import NotFound from './pages/NotFound';
import DisputeManagement from './pages/Dispute';

// Components
import VoiceAssistant from './components/VoiceAssistant';
import LoadingScreen from './components/LoadingScreen';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC89Uh1pB6-7Xr3WyblV2_v556XttF0tTY",
  authDomain: "codeshashtra-2dc16.firebaseapp.com",
  projectId: "codeshashtra-2dc16",
  storageBucket: "codeshashtra-2dc16.firebaseapp.com",
  messagingSenderId: "285363200158",
  appId: "1:285363200158:web:ebeca10a7dcb9e1db21b8f"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setAuthChecked(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  if (!authChecked) {
    return <LoadingScreen />;
  }
  
  if (!authenticated) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Here you would check if the user has admin privileges
        // This is a placeholder - implement your admin verification logic
        // For example, check a user's role in Firestore
        setIsAdmin(true); // Replace with actual admin check
      }
      setAuthChecked(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  if (!authChecked) {
    return <LoadingScreen />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load face-api.js models if needed
    const loadFaceApiModels = async () => {
      const MODEL_URL = '/models';
      try {
        // Code to load face-api models would go here
        console.log("Face-API models loaded");
      } catch (error) {
        console.error("Error loading Face-API models:", error);
      }
    };
    
    // Set up any Firebase listeners or initial data loading
    const setupFirebase = async () => {
      try {
        // Any additional Firebase setup code
        console.log("Firebase initialized successfully");
      } catch (error) {
        console.error("Firebase initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFaceApiModels();
    setupFirebase();
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Web3Provider>
      <AuthProvider>
        <VotingProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white font-sans">
              <VoiceAssistant />
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/auth" element={<Authentication />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <VotingDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vote/:electionId" 
                  element={
                    <ProtectedRoute>
                      <VoteCasting />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/confirmation" 
                  element={
                    <ProtectedRoute>
                      <Confirmation />
                    </ProtectedRoute>
                  } 
                />
                   <Route 
                  path="/dispute"
                  element={
                    <ProtectedRoute>
                      <DisputeManagement />
                    </ProtectedRoute>
                  } 
                
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDispute />
                    </AdminRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </VotingProvider>
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;