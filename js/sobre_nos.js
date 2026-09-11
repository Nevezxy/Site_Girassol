let currentSlide = 0;
let currentTeamSlide = 0;
let autoPlayMain, autoPlayTeam;
const autoPlayDelayMain = 7000; // 7 segundos: os slides têm título e parágrafo para ler
const autoPlayDelayTeam = 7000; // 7 segundos

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
    // Fatias fora de vista saem da leitura sequencial e do tab; o avanço
    // automático não anuncia (evita interromper o leitor de tela a cada
    // 7s), só a troca pedida por quem usa o site.
    const slideVisibility = IGDS.slideVisibility(slides);
    const teamSlideVisibility = IGDS.slideVisibility(teamSlides);

    // ==== FUNÇÕES SLIDER PRINCIPAL ====
    function showSlide(index, announce = false) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        document.querySelectorAll('.indicator').forEach((indicator, i) => indicator.classList.toggle('active', i === index));
        slideVisibility.set(index);
        if (announce) {
            const heading = slides[index]?.querySelector('h1, h2');
            IGDS.announce(`${heading ? heading.textContent.trim() : 'Slide ' + (index + 1)} — slide ${index + 1} de ${slides.length}`);
        }
    }
    function nextSlide(announce = false) {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide, announce);
    }
    function prevSlide(announce = false) {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide, announce);
    }
    function goToSlide(index, announce = false) {
        currentSlide = index;
        showSlide(currentSlide, announce);
    }

    const teamImages = [
        "midia/img/Sobre/Equipe.webp",        // imagem do slide 1
        "midia/img/Sobre/Equipe2.webp",       // imagem do slide 2
        "midia/img/Sobre/Equipe3.webp",       // imagem do slide 3
        "midia/img/Sobre/Equipe4.webp"        // imagem do slide 4
    ];
    const teamImageElement = document.querySelector(".team-img");

    // ==== FUNÇÕES SLIDER EQUIPE ====
    function showTeamSlide(index, announce = false) {
        teamSlides.forEach((slide, i) =>
            slide.classList.toggle('active', i === index)
        );
        document.querySelectorAll('.team-indicator').forEach((indicator, i) =>
            indicator.classList.toggle('active', i === index)
        );
        teamSlideVisibility.set(index);
        if (announce) IGDS.announce(`Depoimento ${index + 1} de ${teamSlides.length}`);

        // troca a imagem de acordo com o slide
        if (teamImageElement) {
            teamImageElement.classList.add("fade-out");

            setTimeout(() => {
                teamImageElement.src = teamImages[index];
                teamImageElement.classList.remove("fade-out");
            }, 400); // metade do tempo da transição
        }
    }
    function nextTeamSlide(announce = false) {
        currentTeamSlide = (currentTeamSlide + 1) % teamSlides.length;
        showTeamSlide(currentTeamSlide, announce);
    }
    function prevTeamSlide(announce = false) {
        currentTeamSlide = (currentTeamSlide - 1 + teamSlides.length) % teamSlides.length;
        showTeamSlide(currentTeamSlide, announce);
    }
    function goToTeamSlide(index, announce = false) {
        currentTeamSlide = index;
        showTeamSlide(currentTeamSlide, announce);
    }

    // ==== AUTO-PLAY ====
    // Controle compartilhado (js/comum.js): botão pausar/retomar e pausa
    // com mouse, foco, fora da tela, aba oculta e menos movimento.
    function startAutoPlayMain() {
        if (autoPlayMain) return;
        autoPlayMain = IGDS.autoplay({
            region: document.querySelector('.hero-slider'),
            next: nextSlide,
            delay: autoPlayDelayMain
        });
    }
    function stopAutoPlayMain() {
        autoPlayMain?.stop();
    }
    function startAutoPlayTeam() {
        if (autoPlayTeam) return;
        autoPlayTeam = IGDS.autoplay({
            region: document.querySelector('.team-info'),
            mount: document.querySelector('.team-slider-controls'),
            inline: true,
            next: nextTeamSlide,
            delay: autoPlayDelayTeam
        });
    }
    function stopAutoPlayTeam() {
        autoPlayTeam?.stop();
    }

    // Criar indicadores
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => { stopAutoPlayMain(); goToSlide(index, true); });
        sliderIndicators.appendChild(indicator);
    });
    teamSlides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('team-indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => { stopAutoPlayTeam(); goToTeamSlide(index, true); });
        teamIndicators.appendChild(indicator);
    });

    // Eventos dos botões
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlayMain(); prevSlide(true); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlayMain(); nextSlide(true); });
    if (teamPrevBtn) teamPrevBtn.addEventListener('click', () => { stopAutoPlayTeam(); prevTeamSlide(true); });
    if (teamNextBtn) teamNextBtn.addEventListener('click', () => { stopAutoPlayTeam(); nextTeamSlide(true); });

    // Swipe mobile
    let startX = 0, endX = 0;
    const sliderContainer = document.querySelector('.slider-container');
    const teamSliderContainer = document.querySelector('.team-slider');

    sliderContainer?.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    sliderContainer?.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) { stopAutoPlayMain(); nextSlide(true); }
        else if (endX - startX > 50) { stopAutoPlayMain(); prevSlide(true); }
    });
    teamSliderContainer?.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    teamSliderContainer?.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) { stopAutoPlayTeam(); nextTeamSlide(true); }
        else if (endX - startX > 50) { stopAutoPlayTeam(); prevTeamSlide(true); }
    });

    // Estado inicial de acessibilidade (sem isso só a 1ª troca escondia as demais fatias)
    showSlide(currentSlide);
    showTeamSlide(currentTeamSlide);

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
    // Setas só movem o slider quando o foco está nele (antes sequestravam as setas da página toda)
    document.addEventListener('keydown', e => {
        if (!document.querySelector('.hero-slider')?.contains(document.activeElement)) return;
        if (e.key === 'ArrowLeft') { stopAutoPlayMain(); prevSlide(true); }
        if (e.key === 'ArrowRight') { stopAutoPlayMain(); nextSlide(true); }
    });
});

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
newsletterForm?.addEventListener('submit', (e) => {
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
