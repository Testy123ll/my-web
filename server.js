// server.js

import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors'; // <-- 1. Import the CORS package
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000; 

// --- CORS CONFIGURATION ---
// Define allowed origins. Crucially, you must include your Vercel frontend URL.
const corsOptions = {
    origin: 'https://codesavvy.vercel.app', // <-- YOUR LIVE VERCEL FRONTEND URL
    methods: ['GET', 'POST'], // Allow POST method for form submission
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Content-Type'],
    preflightContinue: true // Helpful for preflight checks
};

// Apply CORS middleware using the configuration
app.use(cors(corsOptions)); 
// --- END CORS CONFIGURATION ---


//// In server.js (Replace the current transporter setup)

const transporter = nodemailer.createTransport({
    // Explicitly set the SendGrid host to prevent defaulting to 127.0.0.1
    host: 'smtp.sendgrid.net', 
    
    // Explicitly set the standard port for SendGrid (usually 587 or 25)
    port: 587, 
    
    // Set secure to false and requireTLS to true for port 587 (STARTTLS)
    secure: false,     
    requireTLS: true,
    
    auth: {
        // user should be 'apikey' and pass should be the API Key
        user: 'apikey', 
        pass: process.env.SENDGRID_API_KEY, 
    },
});

// Remove 'service: sendgrid' as we are defining host/port manually
// ...

// Middleware to parse JSON body data from the frontend
app.use(express.json()); 

// ==========================================================
// 3. EMAIL SENDING LOGIC (Must be *after* app.use(express.json()))
// ==========================================================

app.post('/send-email', async (req, res) => {
    // ... (Your request body destructuring) ...
    const { name, email, subject, message } = req.body;

    // ... (Your mailOptions setup) ...
    const mailOptions = {
        from: `"Ojo Isaac Testimony" <hojoisaac85@gmail.com>`, 
        to: 'recipient_email@example.com', // <-- MAKE SURE THIS IS SET CORRECTLY!
        subject: `Contact Form Submission: ${subject}`,
        html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    };

    // --- Execution ---
    try {
        const info = await transporter.sendMail(mailOptions);
        
        console.log("Received contact form submission:", req.body);
        console.log("Email sent successfully:", info.messageId);
        
        // Respond to the frontend successfully
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
        
    } catch (error) {
        console.error("Error sending email:", error);
        
        // IMPORTANT: When a backend error happens, we send a 500 status
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message due to server error.'
        });
    }
});

// ==========================================================
// 4. START SERVER
// ==========================================================

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});