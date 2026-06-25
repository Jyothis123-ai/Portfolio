/* ==========================================================================
   Interstellar Gargantua Black Hole Theme JavaScript
   Author: Gorla Jyothiswar Reddy
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- DOM Elements ---
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
            threshold: 0.2,
            rootMargin: '-20% 0px -30% 0px'
        });

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // --- Interactive Contact Form (Bug Fixes Integrated) ---
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
                showFeedback(`Thank you, ${name}! Your message has been sent successfully. I will get back to you shortly.`, 'success');
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
                btnIcon.classList.add('animate-spin');
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
        
        formFeedback.style.display = ''; // Clear any inline display override (Bug Fix 2)
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


    // ==========================================================================
    // 🌌 ASTROPHYSICS ENGINE: GARGANTUA & LENSING STARFIELD
    // ==========================================================================

    // Global Mouse Position Tracking
    const mouse = { x: null, y: null, targetX: null, targetY: null };
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    // Smooth mouse interpolation
    const updateMouse = () => {
        if (mouse.targetX !== null && mouse.x === null) {
            mouse.x = mouse.targetX;
            mouse.y = mouse.targetY;
        } else if (mouse.targetX !== null) {
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;
        }
    };

    // --- Part 1: Background Starfield with Gravitational Lensing ---
    const spaceCanvas = document.getElementById('space-bg');
    if (spaceCanvas) {
        const spaceCtx = spaceCanvas.getContext('2d');
        let stars = [];
        const numStars = 180;
        
        const resizeSpaceCanvas = () => {
            spaceCanvas.width = window.innerWidth;
            spaceCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeSpaceCanvas);
        resizeSpaceCanvas();

        // Create initial star coordinates
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * spaceCanvas.width,
                y: Math.random() * spaceCanvas.height,
                size: Math.random() * 1.5 + 0.2,
                speedX: (Math.random() - 0.5) * 0.05,
                speedY: (Math.random() - 0.5) * 0.05,
                brightness: Math.random() * 0.5 + 0.5,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }

        const drawSpaceBg = (lensX, lensY, isLensActive) => {
            spaceCtx.fillStyle = 'rgba(2, 2, 4, 0.4)';
            spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);
            
            const lensRadiusSq = 4500; // Deflection parameter squared (R_lens^2)
            const shadowRadius = 45;

            stars.forEach(star => {
                // Move stars slowly
                star.x += star.speedX;
                star.y += star.speedY;

                // Loop stars when drifting out of bounds
                if (star.x < 0) star.x = spaceCanvas.width;
                if (star.x > spaceCanvas.width) star.x = 0;
                if (star.y < 0) star.y = spaceCanvas.height;
                if (star.y > spaceCanvas.height) star.y = 0;

                // Pulsate star brightness
                star.pulsePhase += star.pulseSpeed;
                const starBrightness = Math.max(0.2, star.brightness + Math.sin(star.pulsePhase) * 0.25);

                let drawX = star.x;
                let drawY = star.y;

                // Apply Gravitational Lensing warp if the lens coordinates are valid
                if (isLensActive && lensX !== null && lensY !== null) {
                    const dx = star.x - lensX;
                    const dy = star.y - lensY;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);

                    if (dist > shadowRadius) {
                        // Einstein Ring deflection approximation:
                        // r_lensed = r + R_lens^2 / r
                        const warpFactor = 1.0 + lensRadiusSq / (distSq + 200);
                        drawX = lensX + dx * warpFactor;
                        drawY = lensY + dy * warpFactor;
                    } else {
                        // Stars directly behind singularity shadow are blocked (absorbed)
                        return;
                    }
                }

                // Render star
                spaceCtx.beginPath();
                spaceCtx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
                spaceCtx.fillStyle = `rgba(255, 255, 255, ${starBrightness})`;
                spaceCtx.fill();
            });
        };

        // Render loop connection
        window.spaceBgRenderer = {
            render: (lensX, lensY, isLensActive) => {
                drawSpaceBg(lensX, lensY, isLensActive);
            }
        };
    }


    // --- Part 2: Black Hole Singularity & Ray-Lensed Accretion Disk ---
    const bhCanvas = document.getElementById('black-hole-canvas');
    if (bhCanvas) {
        const bhCtx = bhCanvas.getContext('2d');
        let particles = [];
        const numParticles = 650;
        
        let tilt = 82 * Math.PI / 180; // Stable inclination (Gargantua edge-on look is ~80 deg)
        let rotationAngle = 0;
        const singularityRadius = 55;

        const resizeBhCanvas = () => {
            const container = bhCanvas.parentElement;
            bhCanvas.width = container.clientWidth;
            bhCanvas.height = container.clientHeight;
        };
        window.addEventListener('resize', resizeBhCanvas);
        resizeBhCanvas();

        // Relativistic Accretion Disk Particle class
        class CosmicParticle {
            constructor() {
                // Spawn radius: outer bound is stable, inner bound is photon sphere
                this.r = singularityRadius * 1.25 + Math.random() * (singularityRadius * 3.5);
                this.theta = Math.random() * Math.PI * 2;
                
                // Keplerian velocity approximation: closer orbits spin faster
                this.speed = (0.008 + (0.5 / Math.sqrt(this.r))) * (0.8 + Math.random() * 0.4);
                this.size = Math.random() * 1.5 + 0.4;
                
                // Thermal Accretion Glow colors: bright white core to incandescent orange/red
                const colors = [
                    'rgba(255, 255, 255, ',  // White hot core
                    'rgba(255, 235, 180, ',  // Pale yellow
                    'rgba(255, 180, 50, ',   // Warm orange
                    'rgba(255, 120, 20, ',   // Searing amber
                    'rgba(240, 60, 10, '     // Deep red thermal boundary
                ];
                
                // Outer particles are cooler (red/orange), inner particles are hot (white/yellow)
                let colorIdx = Math.floor(Math.random() * colors.length);
                if (this.r > singularityRadius * 3.0) {
                    colorIdx = Math.max(3, colorIdx); // cool red/orange
                } else if (this.r < singularityRadius * 1.8) {
                    colorIdx = Math.min(2, colorIdx); // hot white/yellow
                }
                
                this.colorBase = colors[colorIdx];
                this.opacity = Math.random() * 0.6 + 0.35;
            }

            update() {
                this.theta += this.speed;
            }

            // Ray-lensing coordinate mapping
            draw(ctx, cx, cy, bhTilt, bhRotation) {
                // 1. Position on flat accretion disk orbiting around Y axis
                const x = this.r * Math.cos(this.theta);
                const y = 0;
                const z = this.r * Math.sin(this.theta);

                // 2. Tilted Orbit Projection (around X-axis)
                const cosT = Math.cos(bhTilt);
                const sinT = Math.sin(bhTilt);
                
                // Coordinates after orbital inclination tilt
                const xTilted = x;
                const yTilted = y * cosT - z * sinT;
                const zTilted = y * sinT + z * cosT; // positive is front, negative is back

                // 3. Apply Camera Rotation offset
                const cosR = Math.cos(bhRotation);
                const sinR = Math.sin(bhRotation);
                const x3d = xTilted * cosR - yTilted * sinR;
                const y3d = xTilted * sinR + yTilted * cosR;
                const z3d = zTilted;

                // Check distance
                const dist2d = Math.sqrt(x3d * x3d + y3d * y3d);

                if (z3d >= 0) {
                    // FRONT ACCRETION DISK: Appears in front of the black hole
                    // Minimal deflection warp is needed for the front component
                    const px = cx + x3d;
                    const py = cy + y3d;

                    // Do not render inside the event horizon shadow boundary
                    if (dist2d > singularityRadius * 0.95) {
                        ctx.beginPath();
                        ctx.arc(px, py, this.size, 0, Math.PI * 2);
                        ctx.fillStyle = this.colorBase + this.opacity + ')';
                        ctx.fill();
                    }
                } else {
                    // LENSED BACK ACCRETION DISK: Bends around the singularity
                    // Light from behind splits, forming the iconic Einstein ring halos
                    if (this.r > singularityRadius * 1.1) {
                        // Upper Halo Arc (Light deflected over the top)
                        // Warp factor pushes coordinates away from center vertically
                        const warpFactor1 = 1.0 + (singularityRadius * singularityRadius) / (dist2d * (dist2d - singularityRadius * 0.85) + 1);
                        const lensedR1 = dist2d * warpFactor1;
                        const angle1 = Math.atan2(y3d - lensedR1 * 0.55, x3d);
                        
                        const px1 = cx + lensedR1 * Math.cos(angle1);
                        const py1 = cy + lensedR1 * Math.sin(angle1);

                        ctx.beginPath();
                        ctx.arc(px1, py1, this.size * 0.85, 0, Math.PI * 2);
                        ctx.fillStyle = this.colorBase + (this.opacity * 0.65) + ')';
                        ctx.fill();

                        // Lower Halo Arc (Light deflected under the bottom)
                        // Generates the thinner lower ring
                        const warpFactor2 = 1.0 + (singularityRadius * singularityRadius) / (dist2d * (dist2d - singularityRadius * 0.9) + 50);
                        const lensedR2 = dist2d * warpFactor2 * 0.9;
                        const angle2 = Math.atan2(y3d + lensedR2 * 0.55, x3d);
                        
                        const px2 = cx + lensedR2 * Math.cos(angle2);
                        const py2 = cy + lensedR2 * Math.sin(angle2);

                        ctx.beginPath();
                        ctx.arc(px2, py2, this.size * 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = this.colorBase + (this.opacity * 0.35) + ')';
                        ctx.fill();
                    }
                }
            }
        }

        // Initialize accretion particles
        for (let i = 0; i < numParticles; i++) {
            particles.push(new CosmicParticle());
        }

        // Accretion disk animation loop
        const animate = () => {
            updateMouse();
            
            // Clear canvas with trace transparency for cinematic blur
            bhCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            bhCtx.fillRect(0, 0, bhCanvas.width, bhCanvas.height);

            const cx = bhCanvas.width / 2;
            const cy = bhCanvas.height / 2;

            // Interactive mouse parameters: adjusts accretion tilt and camera angle
            let targetTilt = 82 * Math.PI / 180;
            let targetRot = rotationAngle;

            if (mouse.x !== null) {
                // Map mouse position to minor tilts
                const dx = (mouse.x - window.innerWidth / 2) / window.innerWidth;
                const dy = (mouse.y - window.innerHeight / 2) / window.innerHeight;
                
                targetTilt = (82 + dy * 12) * Math.PI / 180;
                targetRot = dx * 0.4;
            }

            // Interpolate values smoothly
            tilt += (targetTilt - tilt) * 0.05;
            rotationAngle += (targetRot - rotationAngle) * 0.05;

            // Sort particles by depth (Render back, then singularity, then front)
            // This is crucial for proper occlusion
            particles.forEach(p => p.update());

            // 1. Draw lensed particles (the background halo elements)
            particles.forEach(p => {
                // Draw only back elements (depth is negative)
                const x = p.r * Math.cos(p.theta);
                const z = p.r * Math.sin(p.theta);
                const cosT = Math.cos(tilt);
                const sinT = Math.sin(tilt);
                const zTilted = z * cosT; // simple z representation for sort
                if (zTilted < 0) p.draw(bhCtx, cx, cy, tilt, rotationAngle);
            });

            // 2. Draw Photon Sphere boundary layer (glowing ring wrapping event horizon)
            const ringGlow = bhCtx.createRadialGradient(cx, cy, singularityRadius * 0.9, cx, cy, singularityRadius * 1.15);
            ringGlow.addColorStop(0, 'rgba(0, 0, 0, 1)');
            ringGlow.addColorStop(0.3, 'rgba(255, 140, 0, 0.9)');
            ringGlow.addColorStop(0.6, 'rgba(255, 90, 0, 0.4)');
            ringGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            bhCtx.beginPath();
            bhCtx.arc(cx, cy, singularityRadius * 1.25, 0, Math.PI * 2);
            bhCtx.fillStyle = ringGlow;
            bhCtx.fill();

            // 3. Draw Singularity Event Horizon Shadow (Pure Black Hole core)
            bhCtx.beginPath();
            bhCtx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
            bhCtx.fillStyle = '#000000';
            bhCtx.shadowBlur = 10;
            bhCtx.shadowColor = 'rgba(0, 0, 0, 1)';
            bhCtx.fill();
            
            // Reset shadows for particles
            bhCtx.shadowBlur = 0;

            // 4. Draw Front particles (appears in front of event horizon shadow)
            particles.forEach(p => {
                const x = p.r * Math.cos(p.theta);
                const z = p.r * Math.sin(p.theta);
                const cosT = Math.cos(tilt);
                const zTilted = z * cosT;
                if (zTilted >= 0) p.draw(bhCtx, cx, cy, tilt, rotationAngle);
            });

            // Get canvas screen position for background lensing syncing
            const rect = bhCanvas.getBoundingClientRect();
            const centerScreenX = rect.left + rect.width / 2;
            const centerScreenY = rect.top + rect.height / 2;

            // Run Space BG renderer synchronized
            if (window.spaceBgRenderer) {
                // If the black hole is visible on-screen, lens background stars around it.
                // Otherwise, lens stars around the mouse cursor position.
                const isBhOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
                if (isBhOnScreen) {
                    window.spaceBgRenderer.render(centerScreenX, centerScreenY, true);
                } else if (mouse.x !== null) {
                    window.spaceBgRenderer.render(mouse.x, mouse.y, true);
                } else {
                    window.spaceBgRenderer.render(null, null, false);
                }
            }

            requestAnimationFrame(animate);
        };

        // Start animation loop
        animate();
    } else {
        // Fallback: If no black hole canvas (other pages), still render space background if present
        const animateSpaceOnly = () => {
            updateMouse();
            if (window.spaceBgRenderer) {
                if (mouse.x !== null) {
                    window.spaceBgRenderer.render(mouse.x, mouse.y, true);
                } else {
                    window.spaceBgRenderer.render(null, null, false);
                }
            }
            requestAnimationFrame(animateSpaceOnly);
        };
        animateSpaceOnly();
    }
});
