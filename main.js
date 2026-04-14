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
            nav.style.background = 'rgba(250, 249, 246, 0.70)'; // Alabastro con más opacidad al bajar
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
        } else {
            nav.style.background = 'rgba(250, 249, 246, 0.35)'; // Alabastro casi transparente arriba
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
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        let particlesArray = [];
        
        // Ajustar Canvas al 100% de la ventana
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // No reiniciamos todo aquí para evitar parpadeos, 
            // pero si quieres que sea responsivo al 100%, puedes llamar a init()
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        let mouse = {
            x: null,
            y: null,
            radius: 120 // Un poco más grande para el lienzo total
        };

        // Escuchar el movimiento del mouse, pero limitar su efecto a la sección del Hero
        window.addEventListener('mousemove', function(event) {
            // Si el scroll ya bajó más del 100% de la pantalla, ignorar el mouse para las partículas
            if (window.scrollY <= window.innerHeight) {
                mouse.x = event.clientX;
                // Sumamos scrollY para que el mouse mapee exactamente la posición incluso si has bajado un poco
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
            // Lógica para posicionar el rostro en la parte DERECHA del lienzo total
            // Queremos que ocupe aprox el 40% del ancho y 90% del alto
            const targetAreaWidth = canvas.width * 0.45;
            const targetAreaHeight = canvas.height * 0.95;
            
            const scale = Math.min(targetAreaWidth / img.width, targetAreaHeight / img.height) * 1.1;
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            
            // Posicionamiento editorial: a la derecha con un poco de aire (margin) y ajuste de +50px
            const offsetX = (canvas.width - drawWidth - (canvas.width * 0.05)) + 50; 
            const offsetY = canvas.height - drawHeight; // Pegado a la base

            // Dibujar la imagen de forma invisible para escaneo
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
                // STEP 3: Balance perfecto entre alta resolución y rendimiento fluido 60 FPS
                const step = 3; 
                
                for (let y = 0, y2 = imageData.height; y < y2; y += step) {
                    for (let x = 0, x2 = imageData.width; x < x2; x += step) {
                        const index = (y * imageData.width + x) * 4;
                        const r = imageData.data[index];
                        const g = imageData.data[index+1];
                        const b = imageData.data[index+2];
                        const a = imageData.data[index+3];

                        // r > 10 captura cada pequeño fantasma de luz de tu foto original
                        if (r > 10 && a > 0) { 
                            // Transformamos mágicamente la data visual para que pinte Verde Oscuro (Oliva Oscuro)
                            const alpha = (a / 255) * 0.9; 
                            particlesArray.push(new Particle(x, y, `rgba(45, 60, 35, ${alpha})`));
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
            // Silencioso en producción
        };
    }
});
