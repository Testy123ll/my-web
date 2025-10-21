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


// --- Contact Form Submission Handler ---
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    // This is the URL where your Node.js server is running
    // If you deploy your backend, you'll change 'localhost:3000' to your domain/IP
    const BACKEND_URL = 'http://localhost:3000/send-email'; 

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop the default form submission (page reload)

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            const submitButton = contactForm.querySelector('.send-button');

            // 1. Show Loading State
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            formMessage.textContent = ''; // Clear previous messages
            formMessage.style.color = 'black';

            try {
                // 2. Send data to the backend API
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Tell the server we are sending JSON
                    },
                    body: JSON.stringify(data), // Convert JS object to JSON string
                });

                const result = await response.json();

                // 3. Handle response
                if (result.success) {
                    formMessage.textContent = result.message;
                    formMessage.style.color = 'green';
                    contactForm.reset(); // Clear the form on success
                } else {
                    formMessage.textContent = result.message || 'An unknown error occurred.';
                    formMessage.style.color = 'red';
                }

            } catch (error) {
                console.error('Submission Error:', error);
                formMessage.textContent = 'Network error. Please check the server connection.';
                formMessage.style.color = 'red';
            } finally {
                // 4. Reset button state
                submitButton.textContent = 'Send Message';
                submitButton.disabled = false;
            }
        });
    }

    // You can also place your other frontend JavaScript code here (like the mobile menu toggle, FAQ accordion, etc.)
    // ...
});