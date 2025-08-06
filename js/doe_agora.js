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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
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

// Copy PIX functions
function copyPix() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    pixCode.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(pixCode.value).then(() => {
        showCopyMessage('Código PIX copiado!');
    });
}

function copyPixKey() {
    const pixKey = 'igds@igds.org.br';
    navigator.clipboard.writeText(pixKey).then(() => {
        showCopyMessage('Chave PIX copiada!');
    });
}

function showCopyMessage(message) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 2000);
}

// Expandable content toggle
function toggleContent() {
    const expandedText = document.getElementById('expanded-text');
    const button = document.querySelector('.btn-expand');
    
    if (expandedText.classList.contains('active')) {
        expandedText.classList.remove('active');
        button.textContent = 'Leia Mais';
    } else {
        expandedText.classList.add('active');
        button.textContent = 'Leia Menos';
    }
}

// Carousel functionality
document.addEventListener("DOMContentLoaded", () => {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    const dotsContainer = document.getElementById('carousel-dots');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const track = document.getElementById('carousel-track');

    let autoPlayInterval;
    let autoPlayActive = true;

    // Define altura inicial do track para evitar que a página colapse
    function updateTrackHeight() {
        const activeSlide = slides[currentSlide];
        track.style.height = activeSlide.offsetHeight + "px";
    }

    window.addEventListener("resize", updateTrackHeight);

    // Criar dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            stopAutoPlay();
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });

    function updateCarousel() {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        updateTrackHeight();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    function startAutoPlay() {
        autoPlayActive = true;
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (!autoPlayActive) return;
        clearInterval(autoPlayInterval);
        autoPlayActive = false;
    }

    nextBtn.addEventListener("click", () => {
        stopAutoPlay();
        nextSlide();
    });

    prevBtn.addEventListener("click", () => {
        stopAutoPlay();
        prevSlide();
    });

    // Inicializa
    slides[0].classList.add('active');
    updateTrackHeight();
    startAutoPlay();
});


// Statistics counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current) + "+";
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + "+";
            }
        };
        
        updateCounter();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('statistics-section')) {
                animateCounters();
                observer.unobserve(entry.target);
            }
            
            // Add fade-in animation
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize animations
function initAnimations() {
    const animatedElements = document.querySelectorAll('.donation-section, .impact-carousel, .team-section, .statistics-section');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Form validation (if needed for future contact forms)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initLazyLoading();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const handleScroll = debounce(() => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}, 10);

window.addEventListener('scroll', handleScroll);

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = '/placeholder.svg?height=400&width=600&text=Imagem+não+encontrada';
        this.alt = 'Imagem não encontrada';
    });
});

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Add focus management for mobile menu
navToggle.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
        // Focus first menu item when menu opens
        setTimeout(() => {
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        }, 100);
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