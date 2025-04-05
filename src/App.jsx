import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Voice Assistant
import VoiceAssistant from './components/VoiceAssistant';

function App() {
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
                <Route path="/dashboard" element={<VotingDashboard />} />
                <Route path="/vote/:electionId" element={<VoteCasting />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/admin" element={<AdminDispute />} />
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