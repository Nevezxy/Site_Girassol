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
// Navegadores internos (Instagram, Facebook) e páginas sem HTTPS podem negar a
// área de transferência. Nesse caso tentamos o método antigo e, se ainda
// falhar, deixamos o texto selecionado e explicamos como copiar à mão.
function copyText(text, fieldToSelect) {
    const fallback = () => {
        let copied = false;
        const field = fieldToSelect || Object.assign(document.createElement('textarea'), {
            value: text,
            readOnly: true
        });
        if (!fieldToSelect) {
            field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
            document.body.appendChild(field);
        }
        field.focus();
        field.select();
        field.setSelectionRange(0, text.length);
        try {
            copied = document.execCommand('copy');
        } catch (e) {
            copied = false;
        }
        if (!fieldToSelect) field.remove();
        return copied;
    };

    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => true, () => fallback());
    }
    return Promise.resolve(fallback());
}

function copyPix() {
    const pixCode = document.getElementById('pix-code');
    copyText(pixCode.value, pixCode).then((ok) => {
        if (ok) {
            showCopyMessage('Código PIX copiado! Agora é só colar no app do seu banco.', 'success');
        } else {
            pixCode.focus();
            pixCode.select();
            showCopyMessage('Não foi possível copiar automaticamente. O código está selecionado: toque nele e escolha "Copiar".', 'error');
        }
    });
}

function copyPixKey() {
    const pixKey = 'igds@igds.org.br';
    copyText(pixKey).then((ok) => {
        showCopyMessage(ok
            ? 'Chave PIX copiada! Agora é só colar no app do seu banco.'
            : 'Não foi possível copiar automaticamente. A chave PIX é igds@igds.org.br', ok ? 'success' : 'error');
    });
}

// Aviso anunciado por leitores de tela; um só por vez
function showCopyMessage(message, type) {
    document.querySelector('.copy-toast')?.remove();

    const messageEl = document.createElement('div');
    messageEl.className = 'copy-toast' + (type === 'success' ? ' is-success' : '');
    messageEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    setTimeout(() => {
        messageEl.remove();
    }, type === 'error' ? 7000 : 3500);
}

// Expandable content toggle. max-height vai para a altura real do texto
// (scrollHeight), não um teto arbitrário: abre exatamente até o fim do
// conteúdo, sem corte e sem sobra de espaço na transição.
function toggleContent() {
    const expandedText = document.getElementById('expanded-text');
    const button = document.querySelector('.btn-expand');

    if (expandedText.classList.contains('active')) {
        expandedText.classList.remove('active');
        // Valor explícito (não '') para a transição sempre ter um alvo
        // numérico claro para animar, em vez de depender da folha de estilo.
        expandedText.style.maxHeight = '0px';
        button.textContent = 'Leia Mais';
        button.setAttribute('aria-expanded', 'false');
    } else {
        expandedText.classList.add('active');
        expandedText.style.maxHeight = expandedText.scrollHeight + 'px';
        button.textContent = 'Leia Menos';
        button.setAttribute('aria-expanded', 'true');
    }
}

// Recalcula a altura se a página redimensionar (rotação, zoom) com o
// texto aberto — senão o teto fica com a medida antiga do texto reflowed.
window.addEventListener('resize', () => {
    const expandedText = document.getElementById('expanded-text');
    if (expandedText && expandedText.classList.contains('active')) {
        expandedText.style.maxHeight = expandedText.scrollHeight + 'px';
    }
});

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
    // Fatias fora de vista saem da leitura sequencial e do tab; o avanço
    // automático não anuncia, só a troca pedida por quem usa o site.
    const slideVisibility = IGDS.slideVisibility(slides);

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
            goToSlide(index, true);
        });
        dotsContainer.appendChild(dot);
    });

    function updateCarousel(announce = false) {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        slideVisibility.set(currentSlide);
        updateTrackHeight();
        if (announce) {
            const heading = slides[currentSlide]?.querySelector('h3');
            IGDS.announce(`${heading ? heading.textContent.trim() : 'Slide ' + (currentSlide + 1)} — slide ${currentSlide + 1} de ${totalSlides}`);
        }
    }

    function nextSlide(announce = false) {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel(announce);
    }

    function prevSlide(announce = false) {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel(announce);
    }

    function goToSlide(index, announce = false) {
        currentSlide = index;
        updateCarousel(announce);
    }

    // Controle compartilhado (js/comum.js): botão pausar/retomar e pausa
    // com mouse, foco, fora da tela, aba oculta e menos movimento.
    function startAutoPlay() {
        if (autoPlayInterval) return;
        autoPlayActive = true;
        autoPlayInterval = IGDS.autoplay({
            region: document.querySelector('.impact-carousel .carousel-container'),
            next: nextSlide,
            delay: 5000
        });
    }

    function stopAutoPlay() {
        autoPlayInterval?.stop();
        autoPlayActive = false;
    }

    nextBtn.addEventListener("click", () => {
        stopAutoPlay();
        nextSlide(true);
    });

    prevBtn.addEventListener("click", () => {
        stopAutoPlay();
        prevSlide(true);
    });

    // Inicializa
    slides[0].classList.add('active');
    slideVisibility.set(0);
    updateTrackHeight();
    startAutoPlay();
});


// Statistics counter animation
// O HTML já traz os números finais (visíveis mesmo sem JavaScript);
// a contagem de 0 até eles só roda para quem não pediu menos movimento.
function animateCounters() {
    if (IGDS.reduzirMovimento()) return;

    const counters = document.querySelectorAll('.stat-number');
    const format = (n) => Math.floor(n).toLocaleString('pt-BR') + "+";
    const duration = 1600;

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (isNaN(target)) return;
        let start = null;

        const updateCounter = (now) => {
            if (!start) start = now;
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = format(eased * target);
            if (progress < 1) requestAnimationFrame(updateCounter);
        };

        counter.textContent = format(0);
        requestAnimationFrame(updateCounter);
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

    // Com menos movimento, as seções só aparecem (sem subir)
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = IGDS.reduzirMovimento() ? 'none' : 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
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
// O antigo /placeholder.svg não existe e fazia a imagem falhar em loop;
// agora a imagem quebrada só é escondida, sem deixar um buraco com ícone.
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
        this.style.visibility = 'hidden';
    }, { once: true });
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

newsletterForm?.addEventListener('submit', (e) => {
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

// Testimonial Carousel
const track = document.getElementById("testimonial-track");
const slides = document.querySelectorAll(".testimonial-slide");
const prevBtn = document.getElementById("prevTestimonial");
const nextBtn = document.getElementById("nextTestimonial");

let index = 0;
// Fatias fora de vista saem da leitura sequencial e do tab; o avanço
// automático não anuncia, só a troca pedida por quem usa o site.
const testimonialVisibility = IGDS.slideVisibility(slides);

function updateCarousel(announce = false) {
    const slideWidth = slides[0].offsetWidth;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
    testimonialVisibility.set(index);
    if (announce) {
        const author = slides[index]?.querySelector('.testimonial-author');
        IGDS.announce(`Depoimento${author ? ' de ' + author.textContent.trim() : ''} — ${index + 1} de ${slides.length}`);
    }
}

function nextTestimonial(announce = false) {
    index = (index === slides.length - 1) ? 0 : index + 1;
    updateCarousel(announce);
}

// Auto-slide a cada 8 segundos, com o mesmo controle dos outros carrosséis;
// usar as setas pausa a passagem automática.
const testimonialAutoplay = IGDS.autoplay({
    region: document.querySelector('.testimonials-carousel'),
    mount: document.querySelector('.testimonial-controls'),
    inline: true,
    next: nextTestimonial,
    delay: 8000
});

updateCarousel();

prevBtn.addEventListener("click", () => {
    testimonialAutoplay.stop();
    index = (index === 0) ? slides.length - 1 : index - 1;
    updateCarousel(true);
});

nextBtn.addEventListener("click", () => {
    testimonialAutoplay.stop();
    nextTestimonial(true);
});

// ===== PARALLAX EFFECT FOR HERO SECTION =====
// Parallax do hero: um listener throttled em js/comum.js, respeita menos movimento
IGDS.parallax('.hero-background', 0.5);