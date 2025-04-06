// // src/components/CallRequestForm.jsx
// import { useState } from 'react';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../services/firebase';

// const CallRequestForm = () => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState('');

//   // In CallRequestForm.jsx
// const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Add log to verify the submission process
//       console.log("Submitting phone number:", phoneNumber);
      
//       // Save to Firebase
//       const callRef = await addDoc(collection(db, "callRequests"), {
//         phoneNumber: phoneNumber,
//         status: "pending",
//         createdAt: serverTimestamp()
//       });
      
//       console.log("Call request saved with ID:", callRef.id);
//       setSubmitted(true);
//     } catch (error) {
//       console.error("Error submitting call request:", error);
//       alert("Error submitting your call request. Please try again.");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4">Request a Call for Voting Information</h2>
//       <p className="mb-4">
//         Enter your phone number below to receive a call with information about active elections and your voting center.
//       </p>
      
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
//             Phone Number
//           </label>
//           <input
//             type="tel"
//             id="phoneNumber"
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             placeholder="Enter your 10-digit phone number"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             required
//           />
//         </div>
        
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
//         >
//           {isSubmitting ? 'Submitting...' : 'Request Call'}
//         </button>
//       </form>
      
//       {message && (
//         <div className={`mt-4 p-3 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//           {message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CallRequestForm;

// src/components/CallRequestForm.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const CallRequestForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Request a Call</h2>
      
      {submitted ? (
        <div className="text-center">
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            <p className="font-medium">Your call request has been submitted!</p>
            <p className="text-sm mt-1">You will receive a call shortly.</p>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Request Another Call
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-2">
              Your Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 123-456-7890 or 1234567890
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Request Call'}
          </button>
        </form>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>
          Our voice assistant will call you to provide information about:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Active elections in your area</li>
          <li>Your nearest polling center</li>
          <li>Voting methods and requirements</li>
        </ul>
      </div>
    </div>
  );
};

export default CallRequestForm;