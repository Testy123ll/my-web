// === Testimonial Manual Navigation ===
const testimonials = document.querySelectorAll('.testimonial');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let currentIndex = 0;

function showTestimonial(index) {
  testimonials.forEach((item, i) => {
    item.classList.remove('active');
    if (i === index) item.classList.add('active');
  });
}

// Show first testimonial by default
showTestimonial(currentIndex);

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % testimonials.length;
  showTestimonial(currentIndex);
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
  showTestimonial(currentIndex);
});


// Select all FAQ question buttons
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const faqAnswer = question.nextElementSibling;

        // Check if this FAQ is already open
        const isOpen = faqAnswer.style.maxHeight && faqAnswer.style.maxHeight !== '0px';

        // Close all FAQ answers
        document.querySelectorAll('.faq-answer').forEach(answer => {
            answer.style.maxHeight = null;
            answer.parentElement.classList.remove('open');
        });

        // Toggle current FAQ if it was previously closed
        if (!isOpen) {
            faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
            faqItem.classList.add('open');
        }
    });
});


// ===== Contact Section JS =====

// Animate floating light beams randomly
document.querySelectorAll('.contact-section .light-beam').forEach((beam) => {
    // Random horizontal starting position
    beam.style.left = Math.random() * 100 + '%';
    // Random animation delay
    beam.style.animationDelay = Math.random() * 5 + 's';
});

// Animate info items, form, and social links on scroll
const observerOptions = {
    threshold: 0.2
};

const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate once
        }
    });
};

const observer = new IntersectionObserver(animateOnScroll, observerOptions);

// Target elements to animate
const targets = document.querySelectorAll(
    '.contact-info .info-item, .contact-form, .social-links'
);

targets.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
});

// Optional: Smooth fade-in for animated elements
const style = document.createElement('style');
style.innerHTML = `
    .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: all 0.8s ease-out;
    }
`;
document.head.appendChild(style);

// Optional: Form submission feedback
const form = document.querySelector('.contact-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.send-button');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate sending delay
    setTimeout(() => {
        btn.textContent = 'Sent!';
        btn.style.backgroundColor = '#00ffea';
        setTimeout(() => {
            btn.textContent = 'Send Message';
            btn.disabled = false;
            btn.style.backgroundColor = '#00aaff';
            form.reset();
        }, 2000);
    }, 1500);
});


/// ==========================================================
// 1. CONFIGURATION
// ==========================================================

// CRITICAL: Replace 'YOUR-RENDER-BACKEND-URL' with the actual live URL 
// provided by Render, including the /send-email endpoint.
const BACKEND_URL = 'https://codesavvy-hx46.onrender.com/send-email'; 

// ==========================================================
// 2. DOM ELEMENTS
// ==========================================================
const contactForm = document.getElementById('contacts-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');
const statusMessage = document.getElementById('form-status'); // Assuming you have an element to display feedback

// ==========================================================
// 3. EVENT LISTENER
// ==========================================================

if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
}

// ==========================================================
// 4. HANDLER FUNCTION
// ==========================================================

async function handleFormSubmit(event) {
    // Prevent the default form submission behavior (page reload)
    event.preventDefault(); 
    
    // Clear previous status message
    if (statusMessage) {
        statusMessage.textContent = 'Sending...';
        statusMessage.style.color = 'orange';
    }

    const formData = {
        name: nameInput.value,
        email: emailInput.value,
        subject: subjectInput.value,
        message: messageInput.value,
    };

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            
            // CRITICAL HEADER: Tells the backend the data is JSON
            headers: {
                'Content-Type': 'application/json',
            },
            
            // Convert JavaScript object to JSON string for the body
            body: JSON.stringify(formData), 
        });

        const data = await response.json();

        // Handle success (HTTP 200) or server-side error (HTTP 500)
        if (response.ok && data.success) {
            if (statusMessage) {
                statusMessage.textContent = 'Message sent successfully!';
                statusMessage.style.color = 'green';
            }
            contactForm.reset(); // Clear the form on success
        } else {
            // Handle specific server-side errors (e.g., missing field validation from server.js)
            if (statusMessage) {
                statusMessage.textContent = `Error: ${data.message || 'Failed to send message.'}`;
                statusMessage.style.color = 'red';
            }
        }
    } catch (error) {
        // Handle network errors (e.g., server offline, CORS block, wrong URL)
        console.error('Fetch Error:', error);
        if (statusMessage) {
            statusMessage.textContent = 'Network error. Please try again later.';
            statusMessage.style.color = 'red';
        }
    }
}