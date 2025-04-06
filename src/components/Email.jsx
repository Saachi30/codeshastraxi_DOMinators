
// import { Resend } from 'resend';

// const resend = new Resend('re_bPWcD3zZ_B9PMcSu4PhRReQDuvV4RS72w');

// export const sendElectionInvitations = async (electionData) => {
//   try {
//     const { name, description, creatorEmail, participants, uniqueCode } = electionData;

//     if (!participants || participants.length === 0) {
//       console.log("No participants to email");
//       return { success: true, message: "No participants to email" };
//     }

//     // Prepare the email content
//     const emailSubject = `Invitation to Vote: ${name}`;
//     const emailHtml = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
//         <h2 style="color: #2c3e50;">You're Invited to Vote!</h2>
//         <p>You have been invited to participate in the following election:</p>
        
//         <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
//           <h3 style="margin-top: 0; color: #99BC85;">${name}</h3>
//           <p>${description}</p>
//         </div>
        
//         <p>This election was created by ${creatorEmail}.</p>
        
//         <p style="font-weight: bold;">Your unique access code: <span style="color: #99BC85;">${uniqueCode}</span></p>
        
//         <p>Please visit our platform to cast your vote.</p>
        
//         <a href="http://localhost:5173/" 
//            style="display: inline-block; background-color: #99BC85; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">
//           Go to Voting Platform
//         </a>
        
//         <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
//           If you believe you received this email by mistake, please ignore it.
//         </p>
//       </div>
//     `;

//     // Send emails to all participants
//     const emailPromises = participants.map(email => {
//       return resend.emails.send({
//         from: 'Voting Platform <khushi.parekh22@spit.ac.in>',
//         to: email,
//         subject: emailSubject,
//         html: emailHtml
//       });
//     });

//     await Promise.all(emailPromises);
    
//     return { success: true, message: "Invitations sent successfully" };
//   } catch (error) {
//     console.error("Error sending election invitations:", error);
//     return { success: false, message: error.message };
//   }
// };

import emailjs from '@emailjs/browser';

// Initialize EmailJS with your service ID and public key
emailjs.init('rSdjiBZUGQRvxrwS-');

/**
 * Send election invitation emails to participants
 * @param {Object} params - Email parameters
 * @param {string} params.electionName - Name of the election
 * @param {string} params.electionDescription - Description of the election
 * @param {string} params.creatorEmail - Email of the election creator
 * @param {string} params.uniqueCode - Unique code for the election
 * @param {Array<string>} params.participants - Array of participant emails
 * @returns {Promise<Array<{email: string, status: string}>>} - Array of email sending results
 */
export const sendElectionInvitations = async ({
  electionName,
  electionDescription,
  creatorEmail,
  uniqueCode,
  participants
}) => {
  if (!participants || participants.length === 0) {
    console.log('No participants to send emails to');
    return [];
  }

  try {
    const results = await Promise.all(
      participants.map(async (email) => {
        try {
          const templateParams = {
            to_email: email,
            election_name: electionName,
            election_description: electionDescription,
            creator_email: creatorEmail,
            unique_code: uniqueCode,
            reply_to: creatorEmail
          };

          const response = await emailjs.send(
            'service_en5e2pc', // Service ID
            'template_s6yntqt', // Template ID - you'll need to create this in EmailJS
            templateParams
          );

          return {
            email,
            status: 'success',
            message: 'Email sent successfully',
            response
          };
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return {
            email,
            status: 'failed',
            message: error.message || 'Failed to send email'
          };
        }
      })
    );

    console.log('Email sending results:', results);
    return results;
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
};