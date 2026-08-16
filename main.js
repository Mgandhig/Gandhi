document.addEventListener('DOMContentLoaded', () => {
    // Preloader dismiss (duración extendida para apreciar la animación)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 900);
        });
        // Fallback safety timeout if load event already fired
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 1600);
    }
    // Scroll reveal animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToObserve = document.querySelectorAll('.observer-item');
    elementsToObserve.forEach(el => observer.observe(el));

    // Navbar fija con color verde militar constante (sin mutación por scroll)

    // Smooth scroll for anchor links
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle
    const mobileMenu = document.querySelector('#mobile-menu');
    const navLinksList = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinksList) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navLinksList.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-active');
                navLinksList.classList.remove('active');
            });
        });
    }

    // PARTICLE PORTRAIT SYSTEM (Swarm Intelligence - Pinned to RIGHT)
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        let particlesArray = [];
        let resetPortrait = null;
        
        let resizeTimer;
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        function onResize() {
            resizeCanvas();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (typeof resetPortrait === 'function') resetPortrait();
            }, 300);
        }
        window.addEventListener('resize', onResize);
        resizeCanvas();
        
        let mouse = {
            x: null,
            y: null,
            radius: 120
        };

        window.addEventListener('mousemove', function(event) {
            if (window.scrollY <= window.innerHeight) {
                mouse.x = event.clientX;
                mouse.y = event.clientY + window.scrollY; 
            } else {
                mouse.x = null;
                mouse.y = null;
            }
        });

        window.addEventListener('mouseleave', function() {
            mouse.x = null;
            mouse.y = null;
        });

        const img = new Image();
        img.src = canvas.getAttribute('data-src');

        img.onload = function() {
            let imageData;

            function buildImageData() {
                // Escala prominente en la parte DERECHA del lienzo total
                const targetAreaWidth = canvas.width * 0.48;
                const targetAreaHeight = canvas.height * 0.88;
                
                const scale = Math.min(targetAreaWidth / img.width, targetAreaHeight / img.height) * 1.15;
                const drawWidth = img.width * scale;
                const drawHeight = img.height * scale;
                
                // Alineado al borde derecho con 2% de margen y pegado a la base
                const offsetX = (canvas.width - drawWidth) - (canvas.width * 0.02); 
                const offsetY = canvas.height - drawHeight;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            class Particle {
                constructor(x, y, color) {
                    this.x = Math.random() * canvas.width; 
                    this.y = Math.random() * canvas.height;
                    this.baseX = x;
                    this.baseY = y;
                    this.color = color;
                    this.density = (Math.random() * 20) + 1;
                    this.size = 1.1; 
                    this.resistance = Math.random() * 0.7 + 0.3; 
                    this.wobble = Math.random() * 40 - 20; 
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
                update() {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    let actualRadius = mouse.radius + this.wobble;
                    let force = (actualRadius - distance) / actualRadius;
                    
                    const dispersionSpeed = 12;
                    let directionX = forceDirectionX * force * this.density * this.resistance * dispersionSpeed;
                    let directionY = forceDirectionY * force * this.density * this.resistance * dispersionSpeed;

                    if (distance < actualRadius && mouse.x != null) {
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx / (5 / this.resistance); 
                        }
                        if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy / (5 / this.resistance);
                        }
                    }
                }
            }

            function init() {
                particlesArray = [];
                const step = 3; 
                
                for (let y = 0, y2 = imageData.height; y < y2; y += step) {
                    for (let x = 0, x2 = imageData.width; x < x2; x += step) {
                        const index = (y * imageData.width + x) * 4;
                        const r = imageData.data[index];
                        const g = imageData.data[index+1];
                        const b = imageData.data[index+2];
                        const a = imageData.data[index+3];

                        if (r > 10 && a > 0) { 
                            const alpha = (a / 255) * 0.9; 
                            // Mezcla dual-tone: 70% verde oliva militar + 30% acentos naranja cálido
                            const isOrangeAccent = Math.random() < 0.30;
                            const color = isOrangeAccent 
                                ? `rgba(224, 109, 59, ${alpha * 0.95})`    /* Naranja Cálido de Resalte */
                                : `rgba(38, 50, 28, ${alpha})`;             /* Verde Oliva Militar */
                            particlesArray.push(new Particle(x, y, color));
                        }
                    }
                }
            }
            
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < particlesArray.length; i++) {
                    particlesArray[i].draw();
                    particlesArray[i].update();
                }
                requestAnimationFrame(animate);
            }
            
            resetPortrait = function() {
                buildImageData();
                init();
            };
            
            resetPortrait();
            animate();
        }

        img.onerror = function() {
            // Silencioso en producción
        };
    }
});
