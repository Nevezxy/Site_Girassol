// Cabeçalho, "voltar ao topo", links internos e imagens quebradas ficam em
// js/comum.js, carregado antes deste arquivo.

// ======== Mobile Navigation Toggle ========
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle?.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Fecha menu ao clicar em links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Parallax do hero (js/comum.js): CSS ligado à rolagem, respeita menos movimento
IGDS.parallax('.hero-background', 0.5);

// ======== Tabs Functionality ========
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    if (!targetTab) return;

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    button.classList.add('active');
    document.getElementById(targetTab)?.classList.add('active');
  });
});

// ======== Image Carousel Class ========
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
        // Fatias fora de vista saem da leitura sequencial e do tab; o avanço
        // automático não anuncia, só a troca pedida por quem usa o site.
        this.slideVisibility = IGDS.slideVisibility(this.slides);

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
            indicator.addEventListener('click', () => {
                this.goToSlide(i, true);
                this.stopAutoPlay();
            });
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    updateCarousel(announce = false) {
        const translateX = -this.currentSlide * 100;
        this.track.style.transition = IGDS.reduzirMovimento() ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        this.track.style.transform = `translateX(${translateX}%)`;

        // Atualiza os indicadores
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        this.slideVisibility.set(this.currentSlide);
        if (announce) IGDS.announce(`Foto ${this.currentSlide + 1} de ${this.totalSlides}`);
    }

    nextSlide(announce = false) {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel(announce);
    }

    prevSlide(announce = false) {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel(announce);
    }

    goToSlide(slideIndex, announce = false) {
        this.currentSlide = slideIndex;
        this.updateCarousel(announce);
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => {
            this.nextSlide(true);
            this.stopAutoPlay();
        });
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide(true);
            this.stopAutoPlay();
        });

        // Suporte a toque/swipe. Passivo: o navegador não precisa esperar
        // este script para começar a rolar a página quando o dedo passa aqui.
        let startX = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            const diff = startX - e.changedTouches[0].clientX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide(true);
                } else {
                    this.prevSlide(true);
                }
                this.stopAutoPlay();
            }
        }, { passive: true });

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (!this.carousel.contains(document.activeElement)) return;
            if (e.key === 'ArrowLeft') {
                this.prevSlide(true);
                this.stopAutoPlay();
            }
            if (e.key === 'ArrowRight') {
                this.nextSlide(true);
                this.stopAutoPlay();
            }
        });
    }

    // Controle compartilhado (js/comum.js): botão pausar/retomar e pausa
    // com mouse, foco, fora da tela, aba oculta e menos movimento.
    startAutoPlay() {
        if (this.autoplay) return;
        this.autoplay = IGDS.autoplay({
            region: this.carousel,
            next: () => this.nextSlide(),
            delay: 5000
        });
    }

    stopAutoPlay() {
        this.autoplay?.stop();
    }
}

new ImageCarousel('imageCarousel');

// ======== Intersection Observer for Animations ========
// Cada elemento é observado só até aparecer
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section-title, .tab-panel, .carousel-container').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});
