let currentSlide = 0;
let currentTeamSlide = 0;
let autoPlayMain, autoPlayTeam;
const autoPlayDelayMain = 3000; // 5 segundos
const autoPlayDelayTeam = 3000; // 7 segundos

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

    // ==== FUNÇÕES SLIDER PRINCIPAL ====
    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        document.querySelectorAll('.indicator').forEach((indicator, i) => indicator.classList.toggle('active', i === index));
    }
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
    }

    // ==== FUNÇÕES SLIDER EQUIPE ====
    function showTeamSlide(index) {
        teamSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        document.querySelectorAll('.team-indicator').forEach((indicator, i) => indicator.classList.toggle('active', i === index));
    }
    function nextTeamSlide() {
        currentTeamSlide = (currentTeamSlide + 1) % teamSlides.length;
        showTeamSlide(currentTeamSlide);
    }
    function prevTeamSlide() {
        currentTeamSlide = (currentTeamSlide - 1 + teamSlides.length) % teamSlides.length;
        showTeamSlide(currentTeamSlide);
    }
    function goToTeamSlide(index) {
        currentTeamSlide = index;
        showTeamSlide(currentTeamSlide);
    }

    // ==== AUTO-PLAY ====
    function startAutoPlayMain() {
        stopAutoPlayMain();
        autoPlayMain = setInterval(nextSlide, autoPlayDelayMain);
    }
    function stopAutoPlayMain() {
        clearInterval(autoPlayMain);
    }
    function startAutoPlayTeam() {
        stopAutoPlayTeam();
        autoPlayTeam = setInterval(nextTeamSlide, autoPlayDelayTeam);
    }
    function stopAutoPlayTeam() {
        clearInterval(autoPlayTeam);
    }

    // Criar indicadores
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => { stopAutoPlayMain(); goToSlide(index); });
        sliderIndicators.appendChild(indicator);
    });
    teamSlides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('team-indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => { stopAutoPlayTeam(); goToTeamSlide(index); });
        teamIndicators.appendChild(indicator);
    });

    // Eventos dos botões
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlayMain(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlayMain(); nextSlide(); });
    if (teamPrevBtn) teamPrevBtn.addEventListener('click', () => { stopAutoPlayTeam(); prevTeamSlide(); });
    if (teamNextBtn) teamNextBtn.addEventListener('click', () => { stopAutoPlayTeam(); nextTeamSlide(); });

    // Swipe mobile
    let startX = 0, endX = 0;
    const sliderContainer = document.querySelector('.slider-container');
    const teamSliderContainer = document.querySelector('.team-slider');

    sliderContainer?.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    sliderContainer?.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) { stopAutoPlayMain(); nextSlide(); }
        else if (endX - startX > 50) { stopAutoPlayMain(); prevSlide(); }
    });
    teamSliderContainer?.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    teamSliderContainer?.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) { stopAutoPlayTeam(); nextTeamSlide(); }
        else if (endX - startX > 50) { stopAutoPlayTeam(); prevTeamSlide(); }
    });

    // Inicia autoplay
    startAutoPlayMain();
    startAutoPlayTeam();

    // ==== MENU MOBILE ====
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

    // ==== ANIMAÇÕES DE SCROLL ====
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('loaded');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.mvv-card, .value-item, .team-content').forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });

    // ==== LAZY LOADING ====
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

    // ==== SCROLL SUAVE PARA LINKS ====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ==== NAVEGAÇÃO POR TECLADO ====
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { stopAutoPlayMain(); prevSlide(); }
        if (e.key === 'ArrowRight') { stopAutoPlayMain(); nextSlide(); }
    });
});

// ==== PRÉ-CARREGAMENTO DE IMAGENS ====
['images/logo.svg', 'images/hero-bg-1.jpg', 'images/instituto-2012.jpg', 'images/instituto-2024.jpg']
    .forEach(src => { const img = new Image(); img.src = src; });

// ==== BOTÃO VOLTAR AO TOPO ====
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('show', window.scrollY > 300);
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==== FORMULÁRIO NEWSLETTER ====
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

// ==== HEADER TRANSPARENTE NO SCROLL ====
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
