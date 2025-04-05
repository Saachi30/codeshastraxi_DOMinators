import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVoting } from '../contexts/VotingContext';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser } = useAuth();
  const { elections } = useVoting();
  const location = useLocation();
  const navigate = useNavigate();
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  
  // Initialize voice recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleVoiceCommand(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    // Welcome message based on page
    const welcomeMessage = getWelcomeMessage();
    if (welcomeMessage) {
      setTimeout(() => {
        speakMessage(welcomeMessage);
      }, 1000);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [location.pathname]);
  
  const getWelcomeMessage = () => {
    switch (location.pathname) {
      case '/':
        return "Welcome to the secure voting platform. I'm Vee, your voting assistant. How can I help you today?";
      case '/auth':
        return "I'll help you authenticate. You can use face verification, SMS, or a hardware token.";
      case '/dashboard':
        return "Here's your voting dashboard. Say 'show elections' to see available elections.";
      case '/confirmation':
        return "Your vote is being processed. I'll confirm once it's securely registered.";
      default:
        if (location.pathname.includes('/vote/')) {
          return "Ready to cast your vote. Say 'explain voting method' if you need help understanding how to vote.";
        }
        return null;
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setTranscript('');
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        setAssistantMessage("Speech recognition not supported in this browser.");
        speakMessage("Speech recognition not supported in this browser.");
      }
    }
  };
  
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Help command
    if (lowerCommand.includes('help')) {
      const helpMessage = "I can help you navigate the voting platform. Try commands like 'explain voting methods', 'go to dashboard', or 'how does authentication work'.";
      setAssistantMessage(helpMessage);
      speakMessage(helpMessage);
      return;
    }
    
    // Navigation commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
      if (lowerCommand.includes('home') || lowerCommand.includes('welcome')) {
        navigate('/');
        return;
      } else if (lowerCommand.includes('auth') || lowerCommand.includes('authentication')) {
        navigate('/auth');
        return;
      } else if (lowerCommand.includes('dashboard')) {
        navigate('/dashboard');
        return;
      } else if (lowerCommand.includes('analytics')) {
        navigate('/analytics');
        return;
      }
    }
    
    // Election commands
    if (lowerCommand.includes('show election') || lowerCommand.includes('list election')) {
      if (elections && elections.length > 0) {
        const electionsList = `Available elections: ${elections.map(e => e.title).join(', ')}`;
        setAssistantMessage(electionsList);
        speakMessage(electionsList);
      } else {
        const message = "There are no active elections at the moment.";
        setAssistantMessage(message);
        speakMessage(message);
      }
      return;
    }
    
    // Explanation commands
    if (lowerCommand.includes('explain') || lowerCommand.includes('how does')) {
      if (lowerCommand.includes('voting method') || lowerCommand.includes('voting system')) {
        explainVotingMethods();
        return;
      } else if (lowerCommand.includes('auth') || lowerCommand.includes('biometric')) {
        explainAuthentication();
        return;
      } else if (lowerCommand.includes('quadratic')) {
        explainQuadraticVoting();
        return;
      } else if (lowerCommand.includes('ranked')) {
        explainRankedChoice();
        return;
      } else if (lowerCommand.includes('approval')) {
        explainApprovalVoting();
        return;
      } else if (lowerCommand.includes('blockchain') || lowerCommand.includes('secure')) {
        explainBlockchainSecurity();
        return;
      }
    }
    
    // User account commands
    if (lowerCommand.includes('my account') || lowerCommand.includes('profile')) {
      if (currentUser) {
        const message = `You are logged in as ${currentUser.email || currentUser.displayName || 'a verified user'}.`;
        setAssistantMessage(message);
        speakMessage(message);
      } else {
        const message = "You are not logged in. Please authenticate to access your profile.";
        setAssistantMessage(message);
        speakMessage(message);
      }
      return;
    }
    
    // Voting commands
    if (lowerCommand.includes('cast') || lowerCommand.includes('submit') || lowerCommand.includes('confirm')) {
      if (location.pathname.includes('/vote/')) {
        const message = "To confirm your vote, please use the submit button when you've made your selections.";
        setAssistantMessage(message);
        speakMessage(message);
        return;
      }
    }
    
    // Fallback response
    const fallbackMessage = "I didn't understand that command. Try asking for help to see what I can do.";
    setAssistantMessage(fallbackMessage);
    speakMessage(fallbackMessage);
  };
  
  const explainVotingMethods = () => {
    const message = "There are several voting methods available. Approval voting lets you select multiple options you approve of. Ranked choice lets you rank options in order of preference. Quadratic voting lets you express preference intensity by assigning vote credits.";
    setAssistantMessage(message);
    speakMessage(message);
  };
  
  const explainAuthentication = () => {
    const message = "This platform uses multi-factor authentication for security. You can verify your identity using facial recognition, a one-time SMS code, or a hardware security token.";
    setAssistantMessage(message);
    speakMessage(message);
  };
  
  const explainQuadraticVoting = () => {
    const message = "Quadratic voting allows you to express how strongly you feel about each option. You have a budget of vote credits to distribute, but the cost increases quadratically. One vote costs 1 credit, two votes costs 4 credits, three votes costs 9 credits, and so on.";
    setAssistantMessage(message);
    speakMessage(message);
  };
  
  const explainRankedChoice = () => {
    const message = "Ranked choice voting lets you rank candidates in order of preference. If no candidate has a majority, the lowest-ranked candidate is eliminated and their votes are redistributed based on the next preference.";
    setAssistantMessage(message);
    speakMessage(message);
  };
  
  const explainApprovalVoting = () => {
    const message = "In approval voting, you can vote for as many candidates as you approve of. The candidate with the most approvals wins.";
    setAssistantMessage(message);
    speakMessage(message);
  };

  const explainBlockchainSecurity = () => {
    const message = "This platform uses blockchain technology to ensure votes are immutable and verifiable. Each vote is cryptographically secured and added to a distributed ledger, preventing tampering while maintaining voter privacy.";
    setAssistantMessage(message);
    speakMessage(message);
  };
  
  const speakMessage = (message) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      synthRef.current.speak(utterance);
      setAssistantMessage(message);
    }
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const clearConversation = () => {
    setTranscript('');
    setAssistantMessage('');
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };
  
  return (
    <div 
      className={`fixed bottom-6 right-6 bg-indigo-800 text-white rounded-lg shadow-lg transition-all duration-300 z-50 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-indigo-700">
        <button 
          onClick={toggleExpand}
          className="p-1 rounded-full hover:bg-indigo-700 transition-colors"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        {isExpanded && <span className="font-medium">Vee Assistant</span>}
        <button 
          onClick={toggleListening}
          className={`p-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-indigo-600'} hover:brightness-110 transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          {assistantMessage && (
            <div className="mb-3 p-2 bg-indigo-700 rounded-lg">
              <p className="text-sm">{assistantMessage}</p>
            </div>
          )}
          
          {isListening && (
            <div className="flex items-center justify-center my-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-2"></div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
          )}
          
          {transcript && (
            <div className="mb-3">
              <p className="text-xs text-indigo-300">You said:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
          
          <div className="text-xs text-indigo-300 mt-2">
            Try saying: "Explain voting methods" or "Go to dashboard"
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={clearConversation}
              className="text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded transition-colors"
            >
              Clear
            </button>
            
            {!currentUser && (
              <button
                onClick={() => navigate('/auth')}
                className="text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {!isExpanded && isListening && (
        <div className="absolute -top-2 -right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;