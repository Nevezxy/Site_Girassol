// Cabeçalho, "voltar ao topo", links internos, Esc no menu e imagens
// quebradas ficam em js/comum.js, carregado antes deste arquivo.

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

// ===== CARTÕES AO ENTRAR NA TELA =====
// Com menos movimento, só aparecem (antes subiam mesmo assim)
IGDS.reveal(document.querySelectorAll('.report-card, .document-item, .contact-card'));
