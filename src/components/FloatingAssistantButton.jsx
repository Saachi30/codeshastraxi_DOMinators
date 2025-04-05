import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (showCallForm && isOpen) {
      setShowCallForm(false);
    }
  };

  const handleCallClick = () => {
    setShowCallForm(true);
  };

  const handleChatClick = () => {
    // You can implement chatbot functionality later
    console.log("Chatbot clicked - to be implemented");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting call request for:", phoneNumber);
      
      // Format phone number to E.164 format for Twilio
      let formattedNumber = phoneNumber;
      // Remove any non-digit characters
      formattedNumber = formattedNumber.replace(/\D/g, '');
      
      // If number is 10 digits and starts with 7/8/9, add +91
      if (/^[789]\d{9}$/.test(formattedNumber)) {
        formattedNumber = '+91' + formattedNumber;
      } else {
        setError('Please enter a valid 10-digit Indian mobile number starting with 7, 8, or 9');
        setIsSubmitting(false);
        return;
      }
      
      // Import Firebase modules only when needed
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      
      // Save request to Firebase
      const callRef = await addDoc(collection(db, "callRequests"), {
        phoneNumber: formattedNumber,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      console.log("Call request saved with ID:", callRef.id);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting call request:", error);
      setError(`Failed to submit call request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Call Form Popup */}
      {showCallForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 w-72 text-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Request a Call</h3>
            <button 
              onClick={() => setShowCallForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {submitted ? (
            <div>
              <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-3">
                <p className="text-sm font-medium">Your call request has been submitted!</p>
                <p className="text-xs mt-1">You will receive a call shortly.</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Request Another Call
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="floatingPhoneNumber" className="block text-gray-700 text-sm font-medium mb-1">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  id="floatingPhoneNumber"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 10-digit Indian mobile number
                </p>
              </div>
              
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded-md mb-3 text-xs">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Request Call'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Menu Options */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-3 mb-3">
          <button
            onClick={handleChatClick}
            className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
            title="Chat with assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          
          <button
            onClick={handleCallClick}
            className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
            title="Request a call"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Main Button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingAssistantButton;