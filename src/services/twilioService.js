// src/services/twilioService.js
import axios from 'axios';

/**
 * Initiates a call to the specified phone number using Twilio
 * @param {string} phoneNumber - The phone number to call (format: +1XXXXXXXXXX)
 * @param {string} userId - Optional user ID for call tracking
 * @returns {Promise} - Response from the Twilio API
 */
export const initiateCall = async (phoneNumber, userId = null) => {
  try {
    console.log(`Initiating call to ${phoneNumber}`);
    
    // Ensure phone number is properly formatted
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = `+${phoneNumber}`;
    }
    
    // Call the server API endpoint
    const response = await axios.post('/api/twilio/call', {
      phoneNumber: formattedNumber,
      userId: userId || 'guest'
    });
    
    console.log('Call initiated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw new Error(`Failed to initiate call: ${error.message}`);
  }
};

/**
 * Gets the status of a call
 * @param {string} callSid - The Twilio call SID
 * @returns {Promise} - Response with call status
 */
export const getCallStatus = async (callSid) => {
  try {
    const response = await axios.get(`/api/twilio/call-status/${callSid}`);
    return response.data;
  } catch (error) {
    console.error('Error getting call status:', error);
    throw new Error(`Failed to get call status: ${error.message}`);
  }
};

