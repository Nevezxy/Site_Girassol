// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Header scroll effect
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

// Back to top button
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('show', window.scrollY > 300);
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    if (!email) return alert('Por favor, insira seu e-mail.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert('Por favor, insira um e-mail válido.');
    alert('Obrigado por se inscrever em nossa newsletter!');
    newsletterForm.reset();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Tabs Functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Image Carousel with Autoplay & Stop on Interaction
class ImageCarousel {
    constructor(carouselId) {
        this.carousel = document.getElementById(carouselId);
        this.track = this.carousel.querySelector('.carousel-track');
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicatorsContainer = document.getElementById('indicators');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 1500; // 5s
        this.init();
    }

    init() {
        this.createIndicators();
        this.updateCarousel();
        this.bindEvents();
        this.startAutoPlay();
    }

    createIndicators() {
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => { this.stopAutoPlay(); this.goToSlide(i); });
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    updateCarousel() {
        this.track.style.transform = `translateX(${-this.currentSlide * 100}%)`;
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }

    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateCarousel();
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => { this.stopAutoPlay(); this.nextSlide(); });
        this.prevBtn.addEventListener('click', () => { this.stopAutoPlay(); this.prevSlide(); });

        // Touch/swipe
        let startX = 0;
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        this.carousel.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                this.stopAutoPlay();
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { this.stopAutoPlay(); this.prevSlide(); }
            if (e.key === 'ArrowRight') { this.stopAutoPlay(); this.nextSlide(); }
        });
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
    }

    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageCarousel('imageCarousel');
});

// Intersection Observer for animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, observerOptions);
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section-title, .tab-panel, .carousel-container').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Lazy loading for images
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.dataset.src) {
            entry.target.src = entry.target.dataset.src;
            entry.target.classList.remove('loading');
            imageObserver.unobserve(entry.target);
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });
});

// Error handling for images
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            this.src = 'data:image/svg+xml;base64,...'; // Placeholder base64
            this.alt = 'Imagem não encontrada';
        });
    });
});

// Debounce scroll
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
window.addEventListener('scroll', debounce(() => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--white)';
        header.style.backdropFilter = 'none';
    }
}, 10));
