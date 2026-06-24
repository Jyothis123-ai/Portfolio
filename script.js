/* ==========================================================================
   Premium Light-Themed Portfolio JavaScript
   Author: Gorla Jyothiswar Reddy
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- Dom Elements ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const backToTopBtn = document.getElementById('back-to-top');
    const contactForm = document.getElementById('portfolio-contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('btn-submit-message');

    // --- Mobile Navigation Toggle ---
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons(); // Re-render the toggled icon
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // --- Header Scroll Effect & Back-to-Top Button Visibility ---
    const handleScroll = () => {
        const scrollPos = window.scrollY;

        // Sticky nav bg change
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back-to-top visibility
        if (scrollPos > 500) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.pointerEvents = 'auto';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.pointerEvents = 'none';
            backToTopBtn.style.transform = 'translateY(10px)';
        }
    };

    // Initial state setup for Back-to-Top
    if (backToTopBtn) {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.pointerEvents = 'none';
        backToTopBtn.style.transform = 'translateY(10px)';
        backToTopBtn.style.transition = 'all 0.3s ease';
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on load

    // --- Reveal on Scroll Animation ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }

    // --- Active Link Highlight on Scroll ---
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-20% 0px -60% 0px' // Focus on center-top scroll area
        });

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // --- Interactive Contact Form ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Form inputs
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !subject || !message) {
                showFeedback('Please fill out all fields.', 'error');
                return;
            }

            // Disable form during submission
            toggleSubmitState(true);

            // Simulate form submission to backend (API call)
            setTimeout(() => {
                toggleSubmitState(false);
                showFeedback('Thank you, Gorla! Your message has been sent successfully. I will get back to you shortly.', 'success');
                contactForm.reset();
            }, 1800);
        });
    }

    function toggleSubmitState(isLoading) {
        if (!submitBtn) return;
        
        const btnText = submitBtn.querySelector('span');
        const btnIcon = submitBtn.querySelector('i');

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';
            submitBtn.style.cursor = 'not-allowed';
            if (btnText) btnText.textContent = 'Sending Message...';
            if (btnIcon) {
                btnIcon.setAttribute('data-lucide', 'loader');
                btnIcon.classList.add('animate-spin'); // Custom spin animation can be added via JS
                lucide.createIcons();
            }
        } else {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            if (btnText) btnText.textContent = 'Send Message';
            if (btnIcon) {
                btnIcon.setAttribute('data-lucide', 'send');
                btnIcon.classList.remove('animate-spin');
                lucide.createIcons();
            }
        }
    }

    function showFeedback(text, type) {
        if (!formFeedback) return;
        
        formFeedback.textContent = text;
        formFeedback.className = 'form-feedback'; // Reset classes
        formFeedback.classList.add(type);
        
        // Auto scroll feedback into view if not visible
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Fade out message after 6 seconds if success
        if (type === 'success') {
            setTimeout(() => {
                formFeedback.style.transition = 'opacity 0.5s ease';
                formFeedback.style.opacity = '0';
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                    formFeedback.style.opacity = '1'; // Reset opacity for next call
                }, 500);
            }, 6000);
        }
    }
});
