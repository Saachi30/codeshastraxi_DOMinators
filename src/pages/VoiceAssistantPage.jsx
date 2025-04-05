// src/pages/VoiceAssistantPage.jsx
import { useState } from 'react';
import CallRequestForm from '../components/CallRequestForm';
import { Link } from 'react-router-dom';

const VoiceAssistantPage = () => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Voice Assistant for Rural Voters</h1>
          <p className="text-lg mb-4">
            This service helps voters in rural areas access important voting information through a simple phone call,
            eliminating the need for internet access or smartphone technology.
          </p>
          
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showInfo ? 'Hide Information' : 'Learn More'}
          </button>
          
          {showInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-2 mb-4">
                <li>Enter your phone number in the form below</li>
                <li>Our system will call you within a few minutes</li>
                <li>The automated assistant will verify your identity</li>
                <li>You'll receive information about active elections in your area</li>
                <li>The assistant will tell you your designated polling center location</li>
                <li>You can request additional information using your phone's keypad</li>
              </ol>
              
              <p className="font-medium">
                This service is free and designed to make voting information accessible to everyone.
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <CallRequestForm />
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantPage;