// api/send-email.js

import nodemailer from 'nodemailer';
import cors from 'cors';

// --- 1. CORS Setup ---
const corsOptions = {
    origin: 'https://codesavvy.vercel.app', // MUST be your exact Vercel frontend URL
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};

const corsMiddleware = cors(corsOptions);

// --- 2. SendGrid Transporter Configuration ---
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net', 
    port: 587,                  
    secure: false,              
    requireTLS: true,           
    auth: {
        user: 'apikey', 
        // Vercel loads this from your Environment Variables
        pass: process.env.SENDGRID_API_KEY, 
    },
});


// --- 3. Main Exported Handler Function ---
export default async function handler(req, res) {
    // Run CORS middleware to handle preflight requests and set headers
    await new Promise((resolve, reject) => {
        corsMiddleware(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });

    // Handle the CORS preflight request (OPTIONS method)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Ensure the request method is POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Process the JSON body
    const { name, email, subject, message } = req.body;
    
    // CRITICAL: Must be a SendGrid verified sender
    const verifiedSenderEmail = 'hojoisaac85@gmail.com'; 
    // CRITICAL: The email address where you want to receive the form data
    const recipientEmail = 'testimonyojo86@gmail.com'; // <-- UPDATE THIS TO YOUR INBOX!

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // --- DEBUGGING LINE ADDED HERE ---
    console.log(`SENDGRID_API_KEY loaded? ${process.env.SENDGRID_API_KEY ? 'YES (Length: ' + process.env.SENDGRID_API_KEY.length + ')' : 'NO/UNDEFINED'}`);
    // ---------------------------------

    const mailOptions = {
        from: `"Contact Form Submission" <${verifiedSenderEmail}>`, 
        to: recipientEmail, 
        replyTo: email, // Set the submitter's email as the reply-to address
        subject: `Contact Form: ${subject}`,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
    };
    
    // Send Email
    try {
        const info = await transporter.sendMail(mailOptions);
        
        console.log("Email sent successfully:", info.messageId);
        
        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
        
    } catch (error) {
        // This is where the previous "Missing credentials" error was caught
        console.error("Error sending email:", error.message);
        
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to send message due to a server error. Check logs for details.'
        });
    }
}