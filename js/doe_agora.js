// Cabeçalho, "voltar ao topo", links internos, Esc no menu e imagens
// quebradas ficam em js/comum.js, carregado antes deste arquivo.

// ===== MOBILE NAVIGATION TOGGLE =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    // Leva o foco ao primeiro item quando o menu abre
    if (navMenu.classList.contains('active')) {
        setTimeout(() => navMenu.querySelector('.nav-link')?.focus(), 100);
    }
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== PARALLAX DO HERO =====
// js/comum.js: CSS ligado à rolagem, respeita menos movimento
IGDS.parallax('.hero-background', 0.5);

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

// Recalcula a altura se a largura mudar (rotação, zoom) com o texto
// aberto — senão o teto fica com a medida antiga do texto reflowed.
IGDS.onResize(() => {
    const expandedText = document.getElementById('expanded-text');
    if (expandedText && expandedText.classList.contains('active')) {
        expandedText.style.maxHeight = expandedText.scrollHeight + 'px';
    }
});

// ===== CARROSSEL DE IMPACTO =====
(function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    const dotsContainer = document.getElementById('carousel-dots');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const track = document.getElementById('carousel-track');
    if (!track || !totalSlides) return;

    let autoPlay;
    // Fatias fora de vista saem da leitura sequencial e do tab; o avanço
    // automático não anuncia, só a troca pedida por quem usa o site.
    const slideVisibility = IGDS.slideVisibility(slides);

    // Altura do track = altura do slide ativo, para a página não colapsar
    function updateTrackHeight() {
        track.style.height = slides[currentSlide].offsetHeight + "px";
    }

    IGDS.onResize(updateTrackHeight);

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
    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function updateCarousel(announce = false) {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        dots.forEach((dot, index) => {
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
    function stopAutoPlay() {
        autoPlay?.stop();
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
    updateCarousel();
    autoPlay = IGDS.autoplay({
        region: document.querySelector('.impact-carousel .carousel-container'),
        next: nextSlide,
        delay: 5000
    });
    // As fotos podem mudar a altura do slide ao terminar de carregar
    window.addEventListener('load', updateTrackHeight);
})();

// ===== CONTADORES =====
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

const statistics = document.querySelector('.statistics-section');
if (statistics) {
    const counterObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        counterObserver.disconnect();
        animateCounters();
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    counterObserver.observe(statistics);
}

// ===== SEÇÕES AO ENTRAR NA TELA =====
IGDS.reveal(document.querySelectorAll('.donation-section, .impact-carousel, .team-section, .statistics-section'));

// ===== CARROSSEL DE DEPOIMENTOS =====
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
// A largura do depoimento muda com a tela; sem isso o carrossel ficava
// deslocado (meio depoimento à mostra) depois de girar o celular.
IGDS.onResize(() => updateCarousel());

prevBtn.addEventListener("click", () => {
    testimonialAutoplay.stop();
    index = (index === 0) ? slides.length - 1 : index - 1;
    updateCarousel(true);
});

nextBtn.addEventListener("click", () => {
    testimonialAutoplay.stop();
    nextTestimonial(true);
});
