// 1. IMPORT NECESSARY MODULES (ES Module Syntax)
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
// This line loads your .env file variables into process.env
import 'dotenv/config'; 

// --- Configuration Variables ---
const app = express();
// Use the PORT provided by the hosting service (Render), or default to 3000 locally
const PORT = process.env.PORT || 3000; 

// --- Middleware Setup ---
// Allow the frontend (Vercel) to talk to the backend (Render)
app.use(cors()); 
// Parse incoming request bodies as JSON
app.use(bodyParser.json()); 
// Parse URL-encoded data (sometimes sent by forms)
app.use(bodyParser.urlencoded({ extended: true })); 

// --- Nodemailer Transporter Setup ---
// This configures the service that will send the email (Gmail)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,         // Use port 465 for secure SSL connection
    secure: true,      // Must be true for port 465
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// --- API Route: Handling Contact Form Submission ---
app.post('/send-email', async (req, res) => {
    // Log the receipt of the request on the server (VERY IMPORTANT FOR DEBUGGING)
    console.log('Received contact form submission:', req.body); 

    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        // Return a 400 Bad Request if required fields are missing
        return res.status(400).json({ success: false, message: 'Missing required fields: name, email, or message.' });
    }
    
    // Construct the email content
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender (your Gmail address)
        to: process.env.RECEIVING_EMAIL, // Recipient (where you want to get the emails)
        subject: `Contact Form Submission: ${subject || 'No Subject'}`,
        html: `
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
    };

    try {
        // Attempt to send the email
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        
        // Success response to the frontend
        res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        // Log the actual error on the server
        console.error('Nodemailer Error:', error.message);

        // If Nodemailer fails (e.g., 401/AUTH error), send a generic 500 response to the frontend
        res.status(500).json({ success: false, message: 'Failed to send email due to server error.' });
    }
});


// --- Fallback Route for general requests ---
app.get('/', (req, res) => {
    res.send('Backend server is running.');
});
// --- Fallback Route for general requests ---
app.get('/', (req, res) => {
    // Send a friendly message confirming the server is operational
    res.send('Backend server is running and ready to handle POST /send-email requests.');
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});