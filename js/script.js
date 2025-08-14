// ===== MOBILE NAVIGATION TOGGLE =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--white)';
        header.style.backdropFilter = 'none';
    }
});

// ===== BACK TO TOP BUTTON =====
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== NEWSLETTER FORM HANDLING =====
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = newsletterForm.querySelector('input[type="email"]').value.trim();

    if (!email) {
        alert('Por favor, insira seu e-mail.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    alert('Obrigado por se inscrever em nossa newsletter!');
    newsletterForm.reset();
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (isNaN(target)) return;

        const increment = target / 100;
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    });
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Trigger counter animation when stats section is visible
            if (entry.target.classList.contains('stats')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.value-item, .project-card, .stats').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== PARALLAX EFFECT FOR HERO SECTION =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
    }
});

// ===== INITIAL SETUP AFTER DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
    }

    // Hover effect on project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Ripple effect on buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// ===== RIPPLES CSS INJECTION =====
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== CAROUSEL SETUP =====
document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("carouselTrack");
    const originalSlides = Array.from(track.children);
    const nextButton = document.getElementById("nextBtn");
    const prevButton = document.getElementById("prevBtn");
    const dotsNav = document.getElementById("carouselDots"); // se não usar dots, pode remover

    let slidesPerPage;
    let currentIndex;
    let allSlides;
    let totalSlides;
    let totalPages;
    let autoPlayInterval = null;
    let autoPlayActive = true;

    function getSlidesPerPage() {
        const width = window.innerWidth;
        if (width < 576) return 1;
        if (width < 992) return 2;
        return 3;
    }

    function setupCarousel() {
        // Limpa clones antigos
        track.innerHTML = "";

        slidesPerPage = getSlidesPerPage();
        currentIndex = slidesPerPage;

        // Cria clones para efeito infinito
        const clonesStart = originalSlides.slice(-slidesPerPage).map(s => s.cloneNode(true));
        const clonesEnd = originalSlides.slice(0, slidesPerPage).map(s => s.cloneNode(true));

        clonesStart.forEach(clone => clone.classList.add("clone"));
        clonesEnd.forEach(clone => clone.classList.add("clone"));

        clonesStart.forEach(clone => track.appendChild(clone));
        originalSlides.forEach(slide => track.appendChild(slide.cloneNode(true)));
        clonesEnd.forEach(clone => track.appendChild(clone));

        allSlides = Array.from(track.children);
        totalSlides = allSlides.length;
        totalPages = Math.ceil(originalSlides.length / slidesPerPage);

        updateCarousel(false);
        startAutoPlay();
    }

    function updateCarousel(animate = true) {
        const slideWidth = allSlides[0].getBoundingClientRect().width;
        const offset = -slideWidth * currentIndex;

        track.style.transition = animate ? "transform 0.5s ease-in-out" : "none";
        track.style.transform = `translateX(${offset}px)`;
    }

    function nextSlide() {
        if (currentIndex >= totalSlides - slidesPerPage) return; // prevenir overflow até o loop
        currentIndex += slidesPerPage;
        updateCarousel();
    }

    function prevSlide() {
        if (currentIndex <= 0) return; // prevenir underflow até o loop
        currentIndex -= slidesPerPage;
        updateCarousel();
    }

    function startAutoPlay() {
        if (autoPlayInterval) return;
        autoPlayActive = true;
        autoPlayInterval = setInterval(() => {
            nextSlide();
        }, 1500);
    }

    function stopAutoPlay() {
        if (!autoPlayActive) return;
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        autoPlayActive = false;
    }

    // Eventos botões
    nextButton.addEventListener("click", () => {
        stopAutoPlay();
        nextSlide();
    });

    prevButton.addEventListener("click", () => {
        stopAutoPlay();
        prevSlide();
    });

    // Loop infinito (transição "clones")
    track.addEventListener("transitionend", () => {
        if (currentIndex >= totalSlides - slidesPerPage) {
            currentIndex = slidesPerPage;
            updateCarousel(false);
        }

        if (currentIndex < slidesPerPage) {
            currentIndex = totalSlides - slidesPerPage * 2;
            updateCarousel(false);
        }
    });

    // Reconfigura no resize
    window.addEventListener("resize", () => {
        stopAutoPlay();
        setupCarousel();
    });

    // Inicializa tudo
    setupCarousel();
});

// ===== HERO BACKGROUND IMAGE SLIDER =====
const images = [
    "midia/img/Entrada.webp",
];

const heroBg = document.querySelector('.hero-background');
let bgCurrentIndex = 0;

function changeBackground() {
    if (!heroBg) return;
    heroBg.style.backgroundImage = `url('${images[bgCurrentIndex]}')`;
    bgCurrentIndex = (bgCurrentIndex + 1) % images.length;
}

// Troca a imagem a cada 5 segundos
changeBackground();
setInterval(changeBackground, 1500);
