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
// script.js

// script.js

document.addEventListener('DOMContentLoaded', () => {

    // CRITICAL: This now points to your Vercel Serverless Function endpoint
    const BACKEND_URL = 'https://codesavvy.vercel.app/api/send-email'; 

    // ==========================================================
    // 2. DOM ELEMENTS
    // ==========================================================
    const contactForm = document.getElementById('contacts-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const statusMessage = document.getElementById('form-status'); 

    // ==========================================================
    // 3. EVENT LISTENER
    // ==========================================================

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.error("CRITICAL: The contact form element was not found!");
    }

    // ==========================================================
    // 4. HANDLER FUNCTION
    // ==========================================================

    async function handleFormSubmit(event) {
        event.preventDefault(); 
        
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
                
                headers: {
                    'Content-Type': 'application/json',
                },
                
                body: JSON.stringify(formData), 
            });

            // Use response.ok (status 200-299) for success check
            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    if (statusMessage) {
                        statusMessage.textContent = 'Message sent successfully! Thank you.';
                        statusMessage.style.color = 'green';
                    }
                    contactForm.reset(); 
                } else {
                    // Handle server-side errors (like missing fields or SendGrid auth failure)
                    if (statusMessage) {
                        statusMessage.textContent = `Error: ${data.message || 'Failed to send message.'}`;
                        statusMessage.style.color = 'red';
                    }
                }
            } else {
                // Handle non-OK responses (like 404 or 500 status codes)
                throw new Error(`HTTP Error: ${response.status}`);
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            if (statusMessage) {
                statusMessage.textContent = 'Network or server error. Please try again later.';
                statusMessage.style.color = 'red';
            }
        }
    }
});