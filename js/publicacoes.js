// Cabeçalho, "voltar ao topo", links internos, Esc no menu e imagens
// quebradas ficam em js/comum.js, carregado antes deste arquivo.

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

// Parallax do hero (js/comum.js): CSS ligado à rolagem, respeita menos movimento
IGDS.parallax('.hero-background', 0.5);

// Cartões das publicações aparecem ao entrar na tela, em sequência
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const card = entry.target
      card.classList.add("loaded")
      observer.unobserve(card)
      // O atraso da entrada não pode ficar valendo para o hover depois
      setTimeout(() => { card.style.transitionDelay = "" }, parseFloat(card.style.transitionDelay || 0) * 1000 + 700)
    }
  })
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" })

document.querySelectorAll(".publication-card").forEach((card, index) => {
  card.classList.add("loading")
  card.style.transitionDelay = `${index * 0.1}s`
  observer.observe(card)
})
