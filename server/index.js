// // // server/index.js
// // // This would typically be in a separate Node.js server project
// // const express = require('express');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const twilio = require('twilio');
// // const admin = require('firebase-admin');

// // // Initialize Firebase Admin
// // const serviceAccount = require('./firebase-service-account.json');
// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount)
// // });
// // const db = admin.firestore();

// // // Initialize Twilio client
// // const twilioClient = twilio(
// //   "ACe657f3d0eca963e5a14a96f421b40a45",
// //   "4f5a678174a7430e84ee0e14090f0b0a"
// // );

// // const app = express();
// // app.use(cors());
// // app.use(bodyParser.urlencoded({ extended: false }));
// // app.use(bodyParser.json());

// // // Endpoint to initiate a call
// // app.post('/api/twilio/call', async (req, res) => {
// //   try {
// //     const { phoneNumber } = req.body;
    
// //     // Look up user data in Firebase
// //     const userQuery = await db.collection('users')
// //       .where('phoneNumber', '==', phoneNumber)
// //       .limit(1)
// //       .get();
    
// //     let userId = null;
    
// //     if (!userQuery.empty) {
// //       userId = userQuery.docs[0].id;
// //     }
    
// //     // Make the call using Twilio
// //     const call = await twilioClient.calls.create({
// //         url: `http://your-ngrok-url.ngrok.io/api/twilio/voice?userId=${userId || 'guest'}`,
// //         to: phoneNumber,
// //         from: '+19843685298' // Your Twilio number
// //       });
    
// //     res.json({ success: true, callSid: call.sid });
// //   } catch (error) {
// //     console.error('Error initiating call:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // });

// // // Endpoint to generate TwiML for the voice response
// // app.post('/api/twilio/voice', async (req, res) => {
// //   const userId = req.query.userId;
// //   const twiml = new twilio.twiml.VoiceResponse();
  
// //   // Get user data from Firebase if available
// //   let userData = null;
// //   let elections = [];
  
// //   if (userId && userId !== 'guest') {
// //     try {
// //       const userDoc = await db.collection('users').doc(userId).get();
// //       userData = userDoc.exists ? userDoc.data() : null;
      
// //       // Get active elections
// //       const electionsQuery = await db.collection('elections')
// //         .where('isActive', '==', true)
// //         .get();
      
// //       electionsQuery.forEach(doc => {
// //         elections.push({
// //           id: doc.id,
// //           ...doc.data()
// //         });
// //       });
// //     } catch (error) {
// //       console.error('Error fetching user data:', error);
// //     }
// //   }
  
// //   // Greeting
// //   twiml.say(
// //     { voice: 'alice' },
// //     `Welcome to the Voting Information System.${userData ? ` Hello ${userData.name}.` : ''}`
// //   );
  
// //   // Menu options
// //   const gather = twiml.gather({
// //     numDigits: 1,
// //     action: '/api/twilio/handle-input',
// //     method: 'POST'
// //   });
  
// //   gather.say(
// //     { voice: 'alice' },
// //     'To hear information about active elections, press 1. ' +
// //     'To find your polling center location, press 2. ' +
// //     'To request additional voting information, press 3.'
// //   );
  
// //   // If no input is received
// //   twiml.say('We didn\'t receive any input. Goodbye!');
// //   twiml.hangup();
  
// //   res.type('text/xml');
// //   res.send(twiml.toString());
// // });

// // // Handle user input
// // app.post('/api/twilio/handle-input', async (req, res) => {
// //   const userId = req.query.userId;
// //   const digit = req.body.Digits;
// //   const twiml = new twilio.twiml.VoiceResponse();
  
// //   // Get user data from Firebase
// //   let userData = null;
// //   let elections = [];
// //   let pollingCenter = null;
  
// //   try {
// //     if (userId && userId !== 'guest') {
// //       const userDoc = await db.collection('users').doc(userId).get();
// //       userData = userDoc.exists ? userDoc.data() : null;
      
// //       if (userData && userData.pollingCenterId) {
// //         const centerDoc = await db.collection('pollingCenters').doc(userData.pollingCenterId).get();
// //         pollingCenter = centerDoc.exists ? centerDoc.data() : null;
// //       }
// //     }
    
// //     // Get active elections
// //     const electionsQuery = await db.collection('elections')
// //       .where('isActive', '==', true)
// //       .get();
    
// //     electionsQuery.forEach(doc => {
// //       elections.push({
// //         id: doc.id,
// //         ...doc.data()
// //       });
// //     });
// //   } catch (error) {
// //     console.error('Error fetching data:', error);
// //   }
  
// //   switch (digit) {
// //     case '1':
// //       // Information about active elections
// //       if (elections.length > 0) {
// //         let electionInfo = 'Here are the active elections: ';
        
// //         elections.forEach((election, index) => {
// //           electionInfo += `Election ${index + 1}: ${election.name}. `;
// //           electionInfo += `This is a ${election.type} election. `;
// //           electionInfo += `Voting is scheduled for ${election.date}. `;
          
// //           if (index < elections.length - 1) {
// //             electionInfo += 'Next, ';
// //           }
// //         });
        
// //         twiml.say({ voice: 'alice' }, electionInfo);
// //       } else {
// //         twiml.say({ voice: 'alice' }, 'There are currently no active elections in your area.');
// //       }
// //       break;
      
// //     case '2':
// //       // Polling center location
// //       if (pollingCenter) {
// //         twiml.say(
// //           { voice: 'alice' },
// //           `Your designated polling center is ${pollingCenter.name} located at ${pollingCenter.address}. ` +
// //           `The polling center will be open from ${pollingCenter.openTime} to ${pollingCenter.closeTime}.`
// //         );
// //       } else {
// //         twiml.say(
// //           { voice: 'alice' },
// //           'We could not find your designated polling center. ' +
// //           'Please contact your local election office for assistance.'
// //         );
// //       }
// //       break;
      
// //     case '3':
// //       // Additional voting information
// //       twiml.say(
// //         { voice: 'alice' },
// //         'For additional voting information, please have your voter ID ready and ' +
// //         'contact the election help desk at 1-800-123-4567.'
// //       );
// //       break;
      
// //     default:
// //       twiml.say(
// //         { voice: 'alice' },
// //         'Invalid selection. Please try again.'
// //       );
// //   }
  
// //   // End call
// //   twiml.say({ voice: 'alice' }, 'Thank you for using our voting information system. Goodbye!');
// //   twiml.hangup();
  
// //   res.type('text/xml');
// //   res.send(twiml.toString());
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });
// // server/index.js
// import express from 'express';
// import cors from 'cors';
// import twilio from 'twilio';
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import { readFile } from 'fs/promises';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// const __dirname = dirname(fileURLToPath(import.meta.url));

// // Initialize Firebase Admin
// let serviceAccount;
// try {
//   const serviceAccountPath = join(__dirname, '../scripts/firebase-service-account.json');
//   const data = await readFile(serviceAccountPath, 'utf8');
//   serviceAccount = JSON.parse(data);
// } catch (error) {
//   console.error(`Error reading service account file: ${error.message}`);
//   process.exit(1);
// }

// initializeApp({
//   credential: cert(serviceAccount)
// });

// const db = getFirestore();

// // Initialize Twilio client
// const twilioClient = twilio(
//        "ACe657f3d0eca963e5a14a96f421b40a45",
//        "4f5a678174a7430e84ee0e14090f0b0a"
//      );

// const app = express();
// app.use(cors());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// // Endpoint to initiate a call
// // app.post('/api/twilio/call', async (req, res) => {
// //   try {
// //     const { phoneNumber } = req.body;
    
// //     // Look up user data in Firebase
// //     const userQuery = await db.collection('users')
// //       .where('phoneNumber', '==', phoneNumber)
// //       .limit(1)
// //       .get();
    
// //     let userId = null;
    
// //     if (!userQuery.empty) {
// //       userId = userQuery.docs[0].id;
// //     }
    
// //     // Make the call using Twilio
// //     const call = await twilioClient.calls.create({
// //                  url: `http://your-ngrok-url.ngrok.io/api/twilio/voice?userId=${userId || 'guest'}`,
// //                  to: phoneNumber,
// //                  from: '+19843685298' // Your Twilio number
// //                });
    
// //     res.json({ success: true, callSid: call.sid });
// //   } catch (error) {
// //     console.error('Error initiating call:', error);
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // });
// // In server/index.js
// app.post('/api/twilio/call', async (req, res) => {
//     try {
//       const { phoneNumber, userId } = req.body;
      
//       console.log(`Initiating call to ${phoneNumber} for user ${userId || 'guest'}`);
      
//       if (!phoneNumber) {
//         return res.status(400).json({ error: 'Phone number is required' });
//       }
      
//       // Make the call using Twilio
//       const call = await twilioClient.calls.create({
//         url: `${process.env.BASE_URL || 'http://your-server-domain.com'}/api/twilio/voice?userId=${userId || 'guest'}`,
//         to: phoneNumber,
//         from: process.env.TWILIO_PHONE_NUMBER || '+19843685298' // Your Twilio number
//       });
      
//       console.log("Call initiated with SID:", call.sid);
      
//       res.json({ success: true, callSid: call.sid });
//     } catch (error) {
//       console.error("Error initiating Twilio call:", error);
//       res.status(500).json({ error: error.message });
//     }
//   });

// // Endpoint to generate TwiML for the voice response
// app.post('/api/twilio/voice', async (req, res) => {
//   const userId = req.query.userId;
//   const twiml = new twilio.twiml.VoiceResponse();
  
//   // Get user data from Firebase if available
//   let userData = null;
//   let elections = [];
  
//   if (userId && userId !== 'guest') {
//     try {
//       const userDoc = await db.collection('users').doc(userId).get();
//       userData = userDoc.exists ? userDoc.data() : null;
      
//       // Get active elections
//       const electionsQuery = await db.collection('elections')
//         .where('isActive', '==', true)
//         .get();
      
//       electionsQuery.forEach(doc => {
//         elections.push({
//           id: doc.id,
//           ...doc.data()
//         });
//       });
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   }
  
//   // Greeting
//   twiml.say(
//     { voice: 'alice' },
//     `Welcome to the Voting Information System.${userData ? ` Hello ${userData.name}.` : ''}`
//   );
  
//   // Menu options
//   const gather = twiml.gather({
//     numDigits: 1,
//     action: '/api/twilio/handle-input',
//     method: 'POST'
//   });
  
//   gather.say(
//     { voice: 'alice' },
//     'To hear information about active elections, press 1. ' +
//     'To find your polling center location, press 2. ' +
//     'To request additional voting information, press 3.'
//   );
  
//   // If no input is received
//   twiml.say('We didn\'t receive any input. Goodbye!');
//   twiml.hangup();
  
//   res.type('text/xml');
//   res.send(twiml.toString());
// });

// // Handle user input
// app.post('/api/twilio/handle-input', async (req, res) => {
//   const userId = req.query.userId;
//   const digit = req.body.Digits;
//   const twiml = new twilio.twiml.VoiceResponse();
  
//   // Get user data from Firebase
//   let userData = null;
//   let elections = [];
//   let pollingCenter = null;
  
//   try {
//     if (userId && userId !== 'guest') {
//       const userDoc = await db.collection('users').doc(userId).get();
//       userData = userDoc.exists ? userDoc.data() : null;
      
//       if (userData && userData.pollingCenterId) {
//         const centerDoc = await db.collection('pollingCenters').doc(userData.pollingCenterId).get();
//         pollingCenter = centerDoc.exists ? centerDoc.data() : null;
//       }
//     }
    
//     // Get active elections
//     const electionsQuery = await db.collection('elections')
//       .where('isActive', '==', true)
//       .get();
    
//     electionsQuery.forEach(doc => {
//       elections.push({
//         id: doc.id,
//         ...doc.data()
//       });
//     });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
  
//   switch (digit) {
//     case '1':
//       // Information about active elections
//       if (elections.length > 0) {
//         let electionInfo = 'Here are the active elections: ';
        
//         elections.forEach((election, index) => {
//           electionInfo += `Election ${index + 1}: ${election.name}. `;
//           electionInfo += `This is a ${election.type} election. `;
//           electionInfo += `Voting is scheduled for ${election.date}. `;
          
//           if (index < elections.length - 1) {
//             electionInfo += 'Next, ';
//           }
//         });
        
//         twiml.say({ voice: 'alice' }, electionInfo);
//       } else {
//         twiml.say({ voice: 'alice' }, 'There are currently no active elections in your area.');
//       }
//       break;
      
//     case '2':
//       // Polling center location
//       if (pollingCenter) {
//         twiml.say(
//           { voice: 'alice' },
//           `Your designated polling center is ${pollingCenter.name} located at ${pollingCenter.address}. ` +
//           `The polling center will be open from ${pollingCenter.openTime} to ${pollingCenter.closeTime}.`
//         );
//       } else {
//         twiml.say(
//           { voice: 'alice' },
//           'We could not find your designated polling center. ' +
//           'Please contact your local election office for assistance.'
//         );
//       }
//       break;
      
//     case '3':
//       // Additional voting information
//       twiml.say(
//         { voice: 'alice' },
//         'For additional voting information, please have your voter ID ready and ' +
//         'contact the election help desk at 1-800-123-4567.'
//       );
//       break;
      
//     default:
//       twiml.say(
//         { voice: 'alice' },
//         'Invalid selection. Please try again.'
//       );
//   }
  
//   // End call
//   twiml.say({ voice: 'alice' }, 'Thank you for using our voting information system. Goodbye!');
//   twiml.hangup();
  
//   res.type('text/xml');
//   res.send(twiml.toString());
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// server/index.js (partial - just the Twilio endpoint)
import express from 'express';
import twilio from 'twilio';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'ACe657f3d0eca963e5a14a96f421b40a45', // Replace with your SID
  process.env.TWILIO_AUTH_TOKEN || "4f5a678174a7430e84ee0e14090f0b0a" // Your auth token from .env
);

// Twilio call endpoint
app.post('/api/twilio/call', async (req, res) => {
  try {
    const { phoneNumber, userId } = req.body;
    
    console.log(`Server: Initiating call to ${phoneNumber} for user ${userId || 'guest'}`);
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Ensure phone number is properly formatted
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = `+${phoneNumber}`;
    }
    
    // Make the call using Twilio
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL || 'https://8e7e-14-139-125-231.ngrok-free.app'}/api/twilio/voice?userId=${userId || 'guest'}`,
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER || '+19843685298'  // Your Twilio number
    });
    
    console.log("Server: Call initiated with SID:", call.sid);
    
    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error("Server: Error initiating Twilio call:", error);
    res.status(500).json({ error: error.message });
  }
});

// TwiML endpoint for voice instructions
app.post('/api/twilio/voice', (req, res) => {
  const userId = req.query.userId || 'guest';
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  // Create the response
  response.say(
    { voice: 'alice' },
    'Welcome to our election information system. Press 1 to hear about active elections, or press 2 to find your polling center.'
  );
  
  response.gather({
    numDigits: 1,
    action: `/api/twilio/handle-input?userId=${userId}`,
    method: 'POST'
  });
  
  // If no input received, repeat the message
  response.say(
    { voice: 'alice' },
    'We did not receive your selection. Goodbye.'
  );
  
  res.type('text/xml');
  res.send(response.toString());
});

// Handle user input during call
app.post('/api/twilio/handle-input', (req, res) => {
  const userId = req.query.userId || 'guest';
  const Digits = req.body.Digits;
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  if (Digits === '1') {
    response.say(
      { voice: 'alice' },
      'There are currently two active elections. The presidential election on November 5th, and the local county election on October 12th. To learn more, visit our website or press 9 to speak with a representative.'
    );
  } else if (Digits === '2') {
    response.say(
      { voice: 'alice' },
      'To find your polling center, please visit our website and enter your address. Your nearest polling center will be displayed along with operating hours. Press 9 if you need assistance from a representative.'
    );
  } else {
    response.say(
      { voice: 'alice' },
      'Invalid selection. Please try again.'
    );
  }
  
  // Add options to repeat or end call
  response.gather({
    numDigits: 1,
    action: `/api/twilio/handle-follow-up?userId=${userId}`,
    method: 'POST'
  });
  
  response.say(
    { voice: 'alice' },
    'Thank you for using our election information system. Goodbye.'
  );
  
  res.type('text/xml');
  res.send(response.toString());
});

// Follow-up options
app.post('/api/twilio/handle-follow-up', (req, res) => {
  const Digits = req.body.Digits;
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  if (Digits === '9') {
    response.say(
      { voice: 'alice' },
      'We are connecting you to a representative. Please hold.'
    );
    // In a real system, you might transfer to a call center here
    response.say(
      { voice: 'alice' },
      'Our representatives are currently unavailable. Please call back during business hours from 9 AM to 5 PM.'
    );
  } else {
    response.say(
      { voice: 'alice' },
      'Thank you for using our election information system. Goodbye.'
    );
  }
  
  res.type('text/xml');
  res.send(response.toString());
});

// WhatsApp message sending endpoint
app.post('/api/twilio/send-whatsapp', async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      console.log(`Server: Sending WhatsApp message to ${phoneNumber}`);
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }
      
      // Ensure phone number is properly formatted for WhatsApp
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('whatsapp:+')) {
        formattedNumber = `whatsapp:+${phoneNumber.replace(/^\+/, '')}`;
      }
      
      // Send the WhatsApp message using Twilio
      const messageSent = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: formattedNumber
      });
      
      console.log("Server: WhatsApp message sent with SID:", messageSent.sid);
      
      res.json({ success: true, messageSid: messageSent.sid });
    } catch (error) {
      console.error("Server: Error sending WhatsApp message:", error);
      res.status(500).json({ error: error.message });
    }
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

