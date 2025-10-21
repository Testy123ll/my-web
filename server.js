// server.js
// Required for ES Module syntax (as confirmed by Render logs)
import express from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config'; // To load environment variables if you are using a .env file locally

const app = express();
// SendGrid will communicate on a port defined in Render environment (defaulting to 3000/10000)
const PORT = process.env.PORT || 3000; 

// ==========================================================
// 1. SENDGRID TRANSPORTER CONFIGURATION
// ==========================================================
// Nodemailer uses the API key method for SendGrid
const transporter = nodemailer.createTransport({
    service: 'sendgrid', 
    auth: {
        // For SendGrid via Nodemailer, the user is always 'apikey'
        user: 'apikey', 
        // API Key loaded from Render Environment Variable
        pass: process.env.SENDGRID_API_KEY, 
    },
});

// ==========================================================
// 2. MIDDLEWARE
// ==========================================================
// Middleware to parse JSON body data from the frontend
app.use(express.json()); 

// ==========================================================
// 3. EMAIL SENDING LOGIC
// ==========================================================

app.post('/send-email', async (req, res) => {
    // Destructure data received from the frontend form submission
    const { name, email, subject, message } = req.body;
    
    // Construct the email content
    const mailOptions = {
        // *** CRITICAL: This FROM address MUST be verified in your SendGrid account ***
        from: `"Ojo Isaac Testimony" <hojoisaac85@gmail.com>`, 
        
        // The 'To' address is the destination email (for testing, you can set this manually here or use the form data)
        to: 'recipient_email@example.com', // <-- CHANGE THIS TO THE EMAIL YOU WANT TO RECEIVE THE CONTACT FORM SUBMISSIONS AT!
        
        subject: `Contact Form Submission: ${subject}`,
        html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
    };
    
    // --- Execution ---
    try {
        // Send the email using the configured transporter
        const info = await transporter.sendMail(mailOptions);
        
        console.log("Received contact form submission:", req.body);
        console.log("Email sent successfully:", info.messageId);
        
        // Respond to the frontend successfully
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
        
    } catch (error) {
        // Log the specific error from Nodemailer/SendGrid
        console.error("Error sending email:", error);
        
        // Respond to the frontend with an error status
        // The error here is likely the 535 login issue if you haven't fixed it yet!
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message due to server error.',
            // Uncomment the line below for detailed debugging, but be careful not to expose secrets
            // detailedError: error.message 
        });
    }
});

// ==========================================================
// 4. START SERVER
// ==========================================================

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});