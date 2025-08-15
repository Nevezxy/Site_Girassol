// ================= CACHE DE ELEMENTOS =================
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const header = document.querySelector('.header');
const backToTopBtn = document.getElementById('backToTop');
const newsletterForm = document.querySelector('.newsletter-form');
const heroBackground = document.querySelector('.hero-background');
const heroContent = document.querySelector('.hero-content');
const projectCards = document.querySelectorAll('.project-card');
const valueItems = document.querySelectorAll('.value-item');
const statsSection = document.querySelector('.stats');
const counters = document.querySelectorAll('.stat-number');
const carouselTrack = document.getElementById('carouselTrack');
const nextButton = document.getElementById('nextBtn');
const prevButton = document.getElementById('prevBtn');

// ================= MOBILE NAV TOGGLE =================
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

// ================= SCROLL EFFECT & BACK TO TOP =================
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            // Header
            if (header) {
                header.style.background = scrollY > 100 ? 'rgba(255, 255, 255, 0.95)' : 'var(--white)';
                header.style.backdropFilter = scrollY > 100 ? 'blur(10px)' : 'none';
            }

            // Hero Parallax
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrollY * 0.5}px)`;
            }

            // Back to top button
            if (backToTopBtn) {
                if (scrollY > 300) backToTopBtn.classList.add('show');
                else backToTopBtn.classList.remove('show');
            }

            ticking = false;
        });
        ticking = true;
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ================= NEWSLETTER FORM =================
newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value.trim();
    if (!email) return alert('Por favor, insira seu e-mail.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Por favor, insira um e-mail válido.');
    alert('Obrigado por se inscrever em nossa newsletter!');
    newsletterForm.reset();
});

// ================= SMOOTH SCROLL =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const targetPosition = target.offsetTop - header.offsetHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ================= COUNTERS =================
function animateCounters() {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (isNaN(target)) return;

        let startTime = null;
        const duration = 2000;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            counter.textContent = Math.floor(progress * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}

// ================= INTERSECTION OBSERVER =================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            if (entry.target.classList.contains('stats')) animateCounters();
        }
    });
}, observerOptions);

[...valueItems, ...projectCards].forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ================= HERO LOADING =================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    if (heroContent) {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
    }
});

// ================= PROJECT CARD HOVER =================
projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-10px) scale(1.02)');
    card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
});

// ================= BUTTON RIPPLE EFFECT =================
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size/2}px`;
        ripple.style.top = `${e.clientY - rect.top - size/2}px`;
        ripple.classList.add('ripple');
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// ================= RIPPLE CSS =================
const style = document.createElement('style');
style.textContent = `
.btn { position: relative; overflow: hidden; }
.ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: ripple-animation 0.6s linear; pointer-events: none; }
@keyframes ripple-animation { to { transform: scale(4); opacity: 0; } }
`;
document.head.appendChild(style);

// ================= CAROUSEL INFINITO =================
let originalSlides = Array.from(carouselTrack.children);
let slidesPerPage = 3;
let currentIndex = slidesPerPage;
let allSlides = [];
let autoPlayInterval = null;

function getSlidesPerPage() {
    const width = window.innerWidth;
    if (width < 576) return 1;
    if (width < 992) return 2;
    return 3;
}

function setupCarousel() {
    carouselTrack.innerHTML = "";
    slidesPerPage = getSlidesPerPage();
    currentIndex = slidesPerPage;

    const clonesStart = originalSlides.slice(-slidesPerPage).map(s => s.cloneNode(true));
    const clonesEnd = originalSlides.slice(0, slidesPerPage).map(s => s.cloneNode(true));
    clonesStart.forEach(clone => clone.classList.add("clone"));
    clonesEnd.forEach(clone => clone.classList.add("clone"));

    clonesStart.forEach(clone => carouselTrack.appendChild(clone));
    originalSlides.forEach(slide => carouselTrack.appendChild(slide.cloneNode(true)));
    clonesEnd.forEach(clone => carouselTrack.appendChild(clone));

    allSlides = Array.from(carouselTrack.children);
    updateCarousel(false);
    startAutoPlay();
}

function updateCarousel(animate = true) {
    const slideWidth = allSlides[0].getBoundingClientRect().width;
    const offset = -slideWidth * currentIndex;
    carouselTrack.style.transition = animate ? "transform 0.5s ease-in-out" : "none";
    carouselTrack.style.transform = `translateX(${offset}px)`;
}

function nextSlide() {
    if (currentIndex >= allSlides.length - slidesPerPage) return;
    currentIndex += slidesPerPage;
    updateCarousel();
}

function prevSlide() {
    if (currentIndex <= 0) return;
    currentIndex -= slidesPerPage;
    updateCarousel();
}

function startAutoPlay() {
    if (autoPlayInterval) return;
    autoPlayInterval = setInterval(nextSlide, 4000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
}

nextButton.addEventListener("click", () => { stopAutoPlay(); nextSlide(); });
prevButton.addEventListener("click", () => { stopAutoPlay(); prevSlide(); });

carouselTrack.addEventListener("transitionend", () => {
    if (currentIndex >= allSlides.length - slidesPerPage) {
        currentIndex = slidesPerPage;
        updateCarousel(false);
    }
    if (currentIndex < slidesPerPage) {
        currentIndex = allSlides.length - slidesPerPage * 2;
        updateCarousel(false);
    }
});

window.addEventListener("resize", () => {
    stopAutoPlay();
    setupCarousel();
});

// Inicialização
setupCarousel();
