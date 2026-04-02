document.addEventListener('DOMContentLoaded', () => {
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

    // Navbar scroll effect
    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(17, 16, 15, 0.95)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(17, 16, 15, 0.75)';
            nav.style.boxShadow = 'none';
        }
    });

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

    // PARTICLE PORTRAIT SYSTEM (Swarm Intelligence)
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        console.log("✅ Canvas 'particle-canvas' encontrado.");
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        let particlesArray = [];
        
        let mouse = {
            x: null,
            y: null,
            radius: 90 
        };

        // Escuchar el movimiento del mouse sobre el canvas
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouse.x = (event.clientX - rect.left) * scaleX;
            mouse.y = (event.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mouseleave', function() {
            mouse.x = null;
            mouse.y = null;
        });

        const img = new Image();
        img.src = canvas.getAttribute('data-src');
        console.log("🖼️ Intentando cargar imagen desde:", img.src);

        img.onload = function() {
            console.log("📸 Imagen cargada con éxito. Iniciando motor de partículas...");
            // Dimensiones internas fijas en formato retrato 3:4 para alinear con el mouse matemáticamente
            canvas.width = 600;
            canvas.height = 800;

            // Lógica para CENTRAR la imagen vertical y horizontalmente dentro del canvas (object-fit: contain nativo)
            // Agregamos el multiplicador * 1.1 para crecer la imagen un 10% extra
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 1.1;
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            const offsetX = (canvas.width - drawWidth) / 2;
            const offsetY = (canvas.height - drawHeight) / 2;

            // Dibujar la imagen de forma centrada
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            class Particle {
                constructor(x, y, color) {
                    // UX HACK: Inician perdidas aleatoriamente por todo el espacio
                    this.x = Math.random() * canvas.width; 
                    this.y = Math.random() * canvas.height;
                    this.baseX = x;
                    this.baseY = y;
                    this.color = color;
                    this.density = (Math.random() * 20) + 1;
                    this.size = 1.1; // Un poco más grandes para compensar la menor densidad
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
                    
                    // El radio de colisión ya no es un círculo perfecto, cada molécula siente el magnetismo distinto
                    let actualRadius = mouse.radius + this.wobble;
                    let force = (actualRadius - distance) / actualRadius;
                    
                    // Empuje dinámico afectado por la terquedad de cada partícula individual
                    // MULTIPLICADO X12 para una dispersión ultra agresiva y veloz
                    const dispersionSpeed = 12;
                    let directionX = forceDirectionX * force * this.density * this.resistance * dispersionSpeed;
                    let directionY = forceDirectionY * force * this.density * this.resistance * dispersionSpeed;

                    if (distance < actualRadius && mouse.x != null) {
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Elástico de retorno (regresan a velocidades ligeramente distintas creando orgánicidad)
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
                // STEP 3: Matemáticamente nos da unas ~40,000 partículas (200x266 puntos posibles)
                const step = 3; 
                
                for (let y = 0, y2 = imageData.height; y < y2; y += step) {
                    for (let x = 0, x2 = imageData.width; x < x2; x += step) {
                        const index = (y * imageData.width + x) * 4;
                        const r = imageData.data[index];
                        const g = imageData.data[index+1];
                        const b = imageData.data[index+2];
                        const a = imageData.data[index+3];

                        // r > 10 captura cada pequeño fantasma de luz de tu foto de alto contraste
                        if (r > 10 && a > 0) { 
                            particlesArray.push(new Particle(x, y, `rgba(${r}, ${g}, ${b}, ${a/255})`));
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
            
            init();
            animate();
        }

        img.onerror = function() {
            console.error("❌ ERROR: No se pudo cargar la imagen. Verifica que 'img/hero-portrait.png' exista en el servidor.");
        };
    } else {
        console.warn("⚠️ ADVERTENCIA: No se encontró el elemento '#particle-canvas'.");
    }
});
