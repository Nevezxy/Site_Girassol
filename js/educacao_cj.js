// ======== Utils ========
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

// ======== Header Scroll Effect (com debounce) ========
const header = document.querySelector('.header');

const handleHeaderScroll = () => {
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.backdropFilter = 'blur(10px)';
  } else {
    header.style.background = 'var(--white)';
    header.style.backdropFilter = 'none';
  }
};

window.addEventListener('scroll', debounce(handleHeaderScroll, 10));

// ======== Back to Top Button ========
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) backToTopBtn.classList.add('show');
  else backToTopBtn.classList.remove('show');
});

backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ======== Newsletter Form Handling ========
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm?.addEventListener('submit', e => {
  e.preventDefault();

  const emailInput = newsletterForm.querySelector('input[type="email"]');
  const email = emailInput?.value.trim();

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

// ======== Smooth Scrolling for Anchor Links (considerando header) ========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();

    const targetId = anchor.getAttribute('href');
    if (!targetId) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = target.offsetTop - headerHeight;

    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  });
});

// ======== Parallax Effect Hero Background ========
const heroBackground = document.querySelector('.hero-background');
window.addEventListener('scroll', () => {
  if (heroBackground) {
    const scrolled = window.pageYOffset;
    heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

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
        this.autoPlayInterval = null;
        this.autoPlayActive = true; // controla se o autoplay está ativo

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
                this.goToSlide(i);
                this.stopAutoPlay();
            });
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    updateCarousel() {
        const translateX = -this.currentSlide * 100;
        this.track.style.transition = 'transform 0.5s ease'; // transição suave
        this.track.style.transform = `translateX(${translateX}%)`;

        // Atualiza os indicadores
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
        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.stopAutoPlay();
        });
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.stopAutoPlay();
        });

        // Suporte a toque/swipe
        let startX = 0;
        let endX = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                this.stopAutoPlay();
            }
        });

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.stopAutoPlay();
            }
            if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.stopAutoPlay();
            }
        });
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return; // não iniciar múltiplos timers
        this.autoPlayActive = true;
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 1500);
    }

    stopAutoPlay() {
        if (!this.autoPlayActive) return;
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
        this.autoPlayActive = false;
    }
}

// Inicializa carousel no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new ImageCarousel('imageCarousel');
});

// ======== Intersection Observer for Animations ========
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.section-title, .tab-panel, .carousel-container');
  animatedElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
});

// ======== Lazy Loading Images ========
const imageObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('loading');
        imageObserver.unobserve(img);
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    img.classList.add('loading');
    imageObserver.observe(img);
  });
});

// ======== Error Handling for Images ========
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function () {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuXHUwMGUzbyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==';
      this.alt = 'Imagem não encontrada';
    });
  });
});
