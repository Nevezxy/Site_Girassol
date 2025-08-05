// Slider and Navigation Initialization
let currentSlide = 0;
let currentTeamSlide = 0;

// DOMContentLoaded para garantir que tudo foi carregado
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const teamPrevBtn = document.getElementById('teamPrevBtn');
    const teamNextBtn = document.getElementById('teamNextBtn');
    const sliderIndicators = document.getElementById('sliderIndicators');
    const teamIndicators = document.getElementById('teamIndicators');
    const slides = document.querySelectorAll('.slide');
    const teamSlides = document.querySelectorAll('.team-slide');

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        document.querySelectorAll('.indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    function showTeamSlide(index) {
        teamSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        document.querySelectorAll('.team-indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function nextTeamSlide() {
        currentTeamSlide = (currentTeamSlide + 1) % teamSlides.length;
        showTeamSlide(currentTeamSlide);
    }

    function prevTeamSlide() {
        currentTeamSlide = (currentTeamSlide - 1 + teamSlides.length) % teamSlides.length;
        showTeamSlide(currentTeamSlide);
    }

    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
    }

    function goToTeamSlide(index) {
        currentTeamSlide = index;
        showTeamSlide(currentTeamSlide);
    }

    // Criar indicadores
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        sliderIndicators.appendChild(indicator);
    });

    teamSlides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('team-indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToTeamSlide(index));
        teamIndicators.appendChild(indicator);
    });

    // Eventos dos botões
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (teamPrevBtn) teamPrevBtn.addEventListener('click', prevTeamSlide);
    if (teamNextBtn) teamNextBtn.addEventListener('click', nextTeamSlide);

    // Auto-play
    //setInterval(nextSlide, 5000);
    //setInterval(nextTeamSlide, 7000);

    // Swipe support
    let startX = 0;
    let endX = 0;

    const sliderContainer = document.querySelector('.slider-container');
    const teamSliderContainer = document.querySelector('.team-slider');

    sliderContainer?.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    sliderContainer?.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) nextSlide();
        else if (endX - startX > 50) prevSlide();
    });

    teamSliderContainer?.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    teamSliderContainer?.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) nextTeamSlide();
        else if (endX - startX > 50) prevTeamSlide();
    });

    // Mobile nav toggle
    navToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Scroll animation
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.mvv-card, .value-item, .team-content').forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });

    // Lazy loading
    document.querySelectorAll('img[data-src]').forEach(img => {
        const lazyObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    img.src = img.dataset.src;
                    lazyObserver.unobserve(img);
                }
            });
        });
        lazyObserver.observe(img);
    });

    // Scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Teclado
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});

// Preload critical images
['images/logo.svg', 'images/hero-bg-1.jpg', 'images/instituto-2012.jpg', 'images/instituto-2024.jpg']
    .forEach(src => {
        const img = new Image();
        img.src = src;
    });

// Back to top button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = newsletterForm.querySelector('input[type="email"]').value;

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