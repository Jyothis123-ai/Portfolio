/* ==========================================================================
   Cosmic Vortex Portal Transition JavaScript
   Author: Antigravity
   ========================================================================== */

(function () {
    // --- Configuration ---
    const CONFIG = {
        numParticles: 1200,
        numClouds: 8,
        singularityBaseRadius: 65,
        targetFPS: 60,
        warpInDuration: 600, // ms before we jump scroll position
        warpOutDelay: 200,   // ms we stay black/flashed before warping out
        warpOutDuration: 800 // ms of the scale/blur fade out
    };

    // --- State ---
    let canvas, ctx;
    let particles = [];
    let clouds = [];
    let animationFrameId = null;
    let isLoopRunning = false;
    let isTransitioning = false;
    let singularityRadius = CONFIG.singularityBaseRadius;
    let time = 0;
    
    // Mouse interaction in vortex
    const mouse = { x: null, y: null, active: false };

    // --- Particle Class ---
    class VortexParticle {
        constructor(isInitial = false) {
            this.reset(isInitial);
        }

        reset(isInitial = false) {
            // Set spawn coordinates in a spiral shape
            const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.9;
            const minRadius = singularityRadius * 1.1;

            if (isInitial) {
                // Spread particles across the vortex initially
                this.r = minRadius + Math.random() * (maxRadius - minRadius);
            } else {
                // Spawn new particles at the outer edge
                this.r = maxRadius * (0.8 + Math.random() * 0.2);
            }

            // Assign orbit side: 50% chance of fire (left-leaning), 50% ice (right-leaning)
            this.type = Math.random() < 0.5 ? 'fire' : 'ice';
            
            // Recreate fire/ice split from the user's reference image
            // Left side (pi) is fire, Right side (0/2pi) is ice
            if (this.type === 'fire') {
                this.theta = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8;
            } else {
                this.theta = (Math.random() - 0.5) * Math.PI * 0.8;
            }

            // Inward spiral speed (gravity pulls faster as it gets closer)
            this.baseRadialSpeed = Math.random() * 0.8 + 0.4;
            // Angular velocity (faster closer to the center)
            this.baseAngularSpeed = (Math.random() * 0.005 + 0.005);
            
            this.size = Math.random() * 1.5 + 0.3;
            this.alpha = 0;
            this.fadeInSpeed = Math.random() * 0.02 + 0.01;
            
            // Random particle color nuance
            this.colorVariance = Math.random() * 20 - 10;
        }

        update(speedMultiplier = 1.0) {
            // Accelerate radial speed as we approach singularity (gravity simulation)
            const gravityEffect = 120 / (this.r + 20);
            const radialSpeed = (this.baseRadialSpeed + gravityEffect) * speedMultiplier;
            this.r -= radialSpeed;

            // Kepler-like orbital speedup as radius decreases
            const orbitMultiplier = speedMultiplier * (1.0 + (singularityRadius * 1.5) / (this.r + 10));
            this.theta += this.baseAngularSpeed * orbitMultiplier;

            // Fade in initially, fade out when entering the event horizon
            if (this.r > singularityRadius * 1.5) {
                if (this.alpha < 1) this.alpha += this.fadeInSpeed;
            } else {
                // Fast fade near the event horizon boundary
                this.alpha = Math.max(0, (this.r - singularityRadius) / (singularityRadius * 0.5));
            }

            // Recycle if sucked into singularity or drifted out of screen
            if (this.r <= singularityRadius || this.alpha <= 0) {
                this.reset(false);
            }
        }

        draw() {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Render coordinates in spiral
            const px = cx + this.r * Math.cos(this.theta);
            const py = cy + this.r * Math.sin(this.theta);

            // Double check bounds to optimize drawing
            if (px < 0 || px > canvas.width || py < 0 || py > canvas.height) return;

            // Determine color palette based on type
            let color;
            if (this.type === 'fire') {
                // Inner particles are white hot, outer are deep orange-red
                const ratio = Math.min(1, (this.r - singularityRadius) / 300);
                const r = 255;
                const g = Math.floor(210 * (1 - ratio) + 50 * ratio + this.colorVariance);
                const b = Math.floor(255 * (1 - ratio) * 0.8);
                color = `rgba(${r}, ${g}, ${Math.max(0, b)}, ${this.alpha})`;
            } else {
                // Inner particles are bright cyan-white, outer are deep indigo/purple
                const ratio = Math.min(1, (this.r - singularityRadius) / 300);
                const r = Math.floor(100 * (1 - ratio) + 50 * ratio);
                const g = Math.floor(255 * (1 - ratio) + 20 * ratio);
                const b = 255;
                color = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
            }

            ctx.beginPath();
            ctx.arc(px, py, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    // --- Nebula Cloud Class (Volumetric Gas effect) ---
    class NebulaCloud {
        constructor() {
            this.reset();
        }

        reset() {
            this.type = Math.random() < 0.5 ? 'fire' : 'ice';
            this.angle = Math.random() * Math.PI * 2;
            this.dist = singularityRadius * 1.5 + Math.random() * (Math.max(window.innerWidth, window.innerHeight) * 0.4);
            this.radius = Math.random() * 150 + 120;
            this.speed = (Math.random() * 0.001 + 0.0005) * (Math.random() < 0.5 ? 1 : -1);
            
            // Set base cloud color with very low alpha for realistic blending
            if (this.type === 'fire') {
                // Soft warm red/orange/yellow
                const colors = [
                    'rgba(255, 68, 0, 0.07)',
                    'rgba(255, 120, 0, 0.05)',
                    'rgba(230, 30, 10, 0.06)'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            } else {
                // Soft cool cyan/blue
                const colors = [
                    'rgba(0, 180, 255, 0.06)',
                    'rgba(0, 229, 255, 0.05)',
                    'rgba(90, 0, 255, 0.04)'
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
        }

        update() {
            this.angle += this.speed;
        }

        draw() {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            const x = cx + this.dist * Math.cos(this.angle);
            const y = cy + this.dist * Math.sin(this.angle);

            // Draw large blurry radial gradient
            const grad = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
            grad.addColorStop(0, this.color);
            grad.addColorStop(0.5, this.color.replace(/[\d\.]+\)$/, '0.02)'));
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- Init Canvas and Particle Pool ---
    function initPortal() {
        const container = document.getElementById('entrance-portal');
        canvas = document.getElementById('entrance-portal-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        
        // Handle resizing
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Track mouse events
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', () => { mouse.active = false; });

        // Initialize particles
        particles = [];
        for (let i = 0; i < CONFIG.numParticles; i++) {
            particles.push(new VortexParticle(true));
        }

        // Initialize background clouds
        clouds = [];
        for (let i = 0; i < CONFIG.numClouds; i++) {
            clouds.push(new NebulaCloud());
        }

        // Start render loops
        startAnimation();
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Responsive singularity sizing
        const minDim = Math.min(canvas.width, canvas.height);
        singularityRadius = Math.max(CONFIG.singularityBaseRadius, minDim * 0.08);
    }

    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    }

    function startAnimation() {
        if (!isLoopRunning) {
            isLoopRunning = true;
            animatePortal();
        }
    }

    function stopAnimation() {
        isLoopRunning = false;
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // --- Main Canvas Render Loop ---
    function animatePortal() {
        if (!canvas || !ctx || !isLoopRunning) return;

        time++;
        
        // Cinematic motion blur effect (dark overlay trail)
        ctx.fillStyle = 'rgba(2, 2, 4, 0.16)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // 1. Draw Volumetric Nebula clouds
        clouds.forEach(cloud => {
            cloud.update();
            cloud.draw();
        });

        // 2. Accretion Disk Base Swirl (Outer fuzzy boundaries)
        const accretionGlow = ctx.createRadialGradient(cx, cy, singularityRadius * 1.1, cx, cy, singularityRadius * 4);
        accretionGlow.addColorStop(0, 'rgba(255, 100, 0, 0.12)');
        accretionGlow.addColorStop(0.3, 'rgba(0, 180, 255, 0.08)');
        accretionGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = accretionGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, singularityRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Draw Stars & Inward Vortex Particles
        // During warp transitions, increase the speed multiplier for the gravity effect
        const speedMultiplier = isTransitioning ? 2.5 : 1.0;
        particles.forEach(p => {
            p.update(speedMultiplier);
            p.draw();
        });

        // 4. Einstein Ring Halo Glow (Photon Sphere wrapping around black hole)
        const photonGlow = ctx.createRadialGradient(cx, cy, singularityRadius * 0.9, cx, cy, singularityRadius * 1.4);
        photonGlow.addColorStop(0, 'rgba(0, 0, 0, 1)');
        photonGlow.addColorStop(0.15, 'rgba(255, 255, 255, 0.95)');
        photonGlow.addColorStop(0.3, 'rgba(255, 120, 0, 0.7)');
        photonGlow.addColorStop(0.65, 'rgba(0, 229, 255, 0.35)');
        photonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(cx, cy, singularityRadius * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = photonGlow;
        ctx.fill();

        // 5. Draw Bottom Horizon Light (Recreating the planetary/star cloud lighting at the bottom)
        const bottomGlow = ctx.createRadialGradient(cx, canvas.height, 0, cx, canvas.height, canvas.width * 0.65);
        bottomGlow.addColorStop(0, 'rgba(255, 235, 210, 0.28)'); // White-gold warm glow
        bottomGlow.addColorStop(0.2, 'rgba(255, 100, 30, 0.15)'); // Fiery red shift
        bottomGlow.addColorStop(0.5, 'rgba(0, 150, 255, 0.07)');  // Indigo/cyan space fade
        bottomGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = bottomGlow;
        ctx.beginPath();
        ctx.arc(cx, canvas.height, canvas.width * 0.65, Math.PI, Math.PI * 2);
        ctx.fill();

        // 6. Draw central Black Hole core (The pure dark Singularity Shadow)
        ctx.beginPath();
        ctx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        animationFrameId = requestAnimationFrame(animatePortal);
    }

    // --- Transition Manager ---
    
    // Page Entrance (Starts active, fades out after loading)
    function playEntranceAnimation() {
        const portal = document.getElementById('entrance-portal');
        if (!portal) return;

        // Apply transitioning block to body so main content doesn't display fully
        document.body.classList.add('portal-transitioning');

        // Play for a set duration, then trigger warp-out
        setTimeout(() => {
            triggerWarpOut();
        }, 1600);
    }

    function triggerWarpOut() {
        const portal = document.getElementById('entrance-portal');
        const flash = portal ? portal.querySelector('.portal-flash') : null;
        
        if (flash) {
            flash.classList.add('active');
        }

        setTimeout(() => {
            if (portal) {
                portal.classList.add('warp-out');
            }
            if (flash) {
                flash.classList.remove('active');
            }
            document.body.classList.remove('portal-transitioning');
            
            // Once transition finishes fully, hide overlay DOM
            setTimeout(() => {
                if (portal) {
                    portal.classList.add('hidden');
                    portal.classList.remove('warp-out');
                }
                isTransitioning = false;
                stopAnimation();
            }, CONFIG.warpOutDuration);

        }, 300); // delay during the white flash peak
    }

    // Nav Link Interception & Transition triggers
    function setupLinkInterception() {
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        const portal = document.getElementById('entrance-portal');
        const flash = portal ? portal.querySelector('.portal-flash') : null;

        internalLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const targetElement = document.querySelector(href);
                if (!targetElement) return;

                // Stop default jump
                e.preventDefault();
                if (isTransitioning) return;

                isTransitioning = true;
                startAnimation();
                
                // Add warp-in styles
                document.body.classList.add('portal-transitioning');
                if (portal) {
                    portal.classList.remove('hidden', 'warp-out');
                    portal.classList.add('warp-in');
                }

                // Trigger centered flash peak
                setTimeout(() => {
                    if (flash) flash.classList.add('active');
                }, CONFIG.warpInDuration - 150);

                // Perform the scroll jump at the peak of the portal warp (when screen is obscured)
                setTimeout(() => {
                    // Temporarily disable smooth scroll behavior so the scroll jump is hidden
                    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
                    document.documentElement.style.scrollBehavior = 'auto';
                    
                    // Scroll to target element
                    const headerHeight = document.getElementById('main-header')?.offsetHeight || 70;
                    window.scrollTo({
                        top: targetElement.offsetTop - headerHeight,
                        behavior: 'auto'
                    });

                    // Restore original scroll behavior setting
                    document.documentElement.style.scrollBehavior = originalScrollBehavior;

                    // Trigger mobile menu close if open (safe fallback)
                    const navMenu = document.getElementById('nav-menu');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        const menuToggle = document.getElementById('menu-toggle');
                        const icon = menuToggle ? menuToggle.querySelector('i') : null;
                        if (icon && typeof lucide !== 'undefined') {
                            icon.setAttribute('data-lucide', 'menu');
                            lucide.createIcons();
                        }
                    }

                    // Warp Out sequence (fade/shrink back out to reveal target)
                    setTimeout(() => {
                        if (portal) {
                            portal.classList.remove('warp-in');
                            portal.classList.add('warp-out');
                        }
                        if (flash) flash.classList.remove('active');
                        document.body.classList.remove('portal-transitioning');

                        setTimeout(() => {
                            if (portal) {
                                portal.classList.add('hidden');
                                portal.classList.remove('warp-out');
                            }
                            isTransitioning = false;
                            stopAnimation();
                        }, CONFIG.warpOutDuration);

                    }, CONFIG.warpOutDelay);

                }, CONFIG.warpInDuration);
            });
        });
    }

    // --- Load listener ---
    window.addEventListener('DOMContentLoaded', () => {
        initPortal();
        playEntranceAnimation();
        setupLinkInterception();
    });

})();
