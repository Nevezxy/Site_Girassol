// Cabeçalho, "voltar ao topo", links internos e imagens quebradas ficam em
// js/comum.js, carregado antes deste arquivo.

// ================= CACHE DE ELEMENTOS =================
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const projectCards = document.querySelectorAll('.project-card');
const valueItems = document.querySelectorAll('.value-item');
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

// ================= PARALLAX DO HERO =================
IGDS.parallax('.hero-background', 0.5);

// ================= CARTÕES AO ENTRAR NA TELA =================
// Com menos movimento, só por opacidade. O hover dos cartões é do CSS.
IGDS.reveal([...valueItems, ...projectCards]);

// ================= BUTTON RIPPLE EFFECT =================
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
        if (IGDS.reduzirMovimento()) return;
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
// Logos fora da janela visível (inclusive as cópias das pontas) saem da
// leitura sequencial de quem usa leitor de tela; refeito a cada rebuild.
let slideVisibility = null;

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
    slideVisibility = IGDS.slideVisibility(allSlides);
    updateCarousel(false);
    startAutoPlay();
}

function updateCarousel(animate = true) {
    const slideWidth = allSlides[0].getBoundingClientRect().width;
    const offset = -slideWidth * currentIndex;
    // Com menos movimento a troca é instantânea; sem transição não há
    // transitionend, então o retorno ao início do loop acontece na hora.
    const slide = animate && !IGDS.reduzirMovimento();
    carouselTrack.style.transition = slide ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "none";
    carouselTrack.style.transform = `translateX(${offset}px)`;
    const visible = [];
    for (let i = 0; i < slidesPerPage; i++) visible.push(currentIndex + i);
    slideVisibility.set(visible);
    if (animate && !slide) wrapCarousel();
}

// Volta das cópias das pontas para os logos originais, sem o salto aparecer
function wrapCarousel() {
    if (currentIndex >= allSlides.length - slidesPerPage) {
        currentIndex = slidesPerPage;
        updateCarousel(false);
    }
    if (currentIndex < slidesPerPage) {
        currentIndex = allSlides.length - slidesPerPage * 2;
        updateCarousel(false);
    }
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

// Um único controle de autoplay para o carrossel inteiro (sobrevive aos
// rebuilds do resize); pausa com mouse, foco, fora da tela e aba oculta.
function startAutoPlay() {
    if (autoPlayInterval) return;
    autoPlayInterval = IGDS.autoplay({
        region: document.querySelector('#parceiros .carousel-container'),
        next: nextSlide,
        delay: 4000
    });
}

function stopAutoPlay() {
    autoPlayInterval?.stop();
}

nextButton.addEventListener("click", () => { stopAutoPlay(); nextSlide(); });
prevButton.addEventListener("click", () => { stopAutoPlay(); prevSlide(); });

carouselTrack.addEventListener("transitionend", (e) => {
    if (e.target === carouselTrack) wrapCarousel();
});

// Largura nova: só reconstrói se mudou o número de logos por vez; senão
// basta reposicionar. (Antes reconstruía a cada "resize", inclusive os
// disparados pela barra de endereço do celular durante a rolagem.)
IGDS.onResize(() => {
    if (getSlidesPerPage() !== slidesPerPage) setupCarousel();
    else updateCarousel(false);
});

// Inicialização
setupCarousel();

// FORM
const form = document.getElementById('meuForm');

const formStatus = form?.querySelector('.form-status');
const formSubmitBtn = form?.querySelector('button[type="submit"]');

function setFormStatus(type, message) {
  if (!formStatus) return;
  formStatus.className = 'form-status' + (type ? ' is-' + type : '');
  formStatus.textContent = message;
}

form?.addEventListener('submit', function(e){
  e.preventDefault(); // evita que a página recarregue

  // Mensagem vazia: o navegador aponta o campo e explica o que falta
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Evita envio duplo enquanto a requisição está em andamento
  if (formSubmitBtn.disabled) return;
  formSubmitBtn.disabled = true;
  formSubmitBtn.textContent = 'Enviando…';
  setFormStatus('', '');

  const data = new FormData(form);
  const payload = new URLSearchParams();

  // Campos opcionais vazios seguem como texto vazio, nunca como "null"
  payload.append("entry.1655741229", data.get("entry.1655741229") || "");
  payload.append("entry.777068924", data.get("entry.777068924") || "");
  payload.append("entry.429007067", data.get("entry.429007067") || "");
  payload.append("entry.374350221", data.get("entry.374350221") || "");

  const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSeyqQ9yL68Kcrg6FxqLm1DvMhurPQSsMapzum6f8IQuAGa4Cw/formResponse";

  // Com no-cors o Google não devolve confirmação: só sabemos se a mensagem saiu
  // do navegador. Falha aqui significa sem conexão, e o texto é mantido.
  fetch(googleFormURL, {
    method: "POST",
    body: payload,
    mode: "no-cors"
  })
    .then(() => {
      form.reset();
      setFormStatus('success', 'Mensagem enviada. Obrigado pelo contato! Se você deixou seu e-mail, responderemos por lá.');
    })
    .catch(() => {
      setFormStatus('error', 'Não conseguimos enviar agora. Verifique sua conexão e tente de novo; sua mensagem continua no formulário. Se preferir, fale com a gente pelo WhatsApp (82) 99999-2784.');
    })
    .finally(() => {
      formSubmitBtn.disabled = false;
      formSubmitBtn.textContent = 'Enviar';
    });
});
