// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // To allow the frontend to communicate with the backend

const app = express();
const port = 3000; // The port the server will run on

// Middleware
// We need to allow requests from your frontend HTML page (CORS)
app.use(cors()); 
// For parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// For parsing application/json (though we'll send form data)
app.use(bodyParser.json()); 

// --- Nodemailer Transporter Configuration ---
// This is the object that knows how to send the email.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' for a Gmail account
    auth: {
        user: process.env.EMAIL_USER, // Your sending email address (from .env)
        pass: process.env.EMAIL_PASS, // Your App Password (from .env)
    }
});

// --- API Endpoint for Contact Form Submission ---
app.post('/send-email', async (req, res) => {
    console.log('Received contact form submission:', req.body);
    
    // Destructure data from the form
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please fill in all fields.' 
        });
    }

    // Construct the email content
    const mailOptions = {
        from: `"${name}" <${email}>`, // Sender is the user who filled the form
        to: process.env.RECEIVING_EMAIL, // Your professional email to receive the message
        subject: `[New Contact] ${subject}`,
        text: `You have received a new message from your portfolio contact form.

Name: ${name}
Email: ${email}
Subject: ${subject}
Message:
---
${message}
---
`,
        html: `
            <p>You have received a new message from your portfolio contact form.</p>
            <h3>Contact Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Subject:</strong> ${subject}</li>
            </ul>
            <h3>Message:</h3>
            <p>${message}</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        
        // Success response
        res.status(200).json({ 
            success: true, 
            message: 'Message sent successfully! I will get back to you shortly.' 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Error response
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again or email directly.' 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});