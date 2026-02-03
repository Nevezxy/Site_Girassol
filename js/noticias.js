// API Configuration
const API_BASE_URL = 'http://localhost:8000'; // Ajuste conforme necessário
const API_ENDPOINT = `${API_BASE_URL}/api/v1/noticias/`;

// DOM Elements
const newsGrid = document.getElementById('newsGrid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const emptyElement = document.getElementById('empty');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-btn');
const heroImage = document.getElementById('heroImage');

// State
let allNews = [];
let filteredNews = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    setupEventListeners();
    setHeroBackground();
});

// Fetch news from API
async function fetchNews() {
    try {
        showLoading(true);
        hideError();
        newsGrid.innerHTML = '';
        emptyElement.style.display = 'none';

        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar notícias: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Normalizar resposta (pode ser array ou objeto com results)
        allNews = Array.isArray(data) ? data : (data.results || []);
        filteredNews = [...allNews];

        if (allNews.length === 0) {
            showEmpty();
        } else {
            renderNews(filteredNews);
        }

    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        showError(error.message || 'Erro ao carregar notícias. Tente novamente mais tarde.');
    } finally {
        showLoading(false);
    }
}

// Render news cards
function renderNews(news) {
    newsGrid.innerHTML = '';

    if (news.length === 0) {
        showEmpty();
        return;
    }

    news.forEach((noticia, index) => {
        const card = createNewsCard(noticia);
        newsGrid.appendChild(card);
        // Stagger animation
        card.style.animationDelay = `${index * 0.1}s`;
    });

    emptyElement.style.display = 'none';
}

// Create a news card element
function createNewsCard(noticia) {
    const card = document.createElement('article');
    card.className = 'news-card';

    // Format date
    const formattedDate = formatDate(noticia.data_publicacao);

    // Image or placeholder
    const imageHTML = noticia.imagem_url
        ? `<img src="${noticia.imagem_url}" alt="${noticia.titulo}" class="news-image" onerror="this.style.display='none'">`
        : `<div class="no-image-placeholder">📰</div>`;

    // Source badge
    const sourceBadge = noticia.fonte
        ? `<span class="news-badge">${noticia.fonte}</span>`
        : '';

    // Truncate summary
    const summary = truncateText(noticia.resumo || noticia.descricao, 150);

    // Create button handler
    const detailsUrl = noticia.url_origem ? `href="${noticia.url_origem}" target="_blank" rel="noopener noreferrer"` : 'role="button" tabindex="0"';
    const buttonTag = noticia.url_origem ? 'a' : 'button';

    card.innerHTML = `
        <div class="news-image-wrapper">
            ${imageHTML}
            ${sourceBadge}
        </div>
        <div class="news-content">
            <time class="news-date">${formattedDate}</time>
            <h2 class="news-title">${escapeHTML(noticia.titulo)}</h2>
            <p class="news-summary">${escapeHTML(summary)}</p>
            <div class="news-footer">
                <span class="news-source">${escapeHTML(noticia.fonte || 'OSC/ONG')}</span>
                <${buttonTag} class="read-more-btn" ${detailsUrl}>Ler Mais</${buttonTag}>
            </div>
        </div>
    `;

    // Add keyboard support for button
    if (buttonTag === 'button') {
        const button = card.querySelector('button');
        button.addEventListener('click', () => {
            showNewsDetails(noticia);
        });
        button.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showNewsDetails(noticia);
            }
        });
    }

    return card;
}

// Format date to Brazilian format
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        locale: 'pt-BR'
    };
    
    try {
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch {
        return dateString;
    }
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Handle search
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (query === '') {
        filteredNews = [...allNews];
    } else {
        filteredNews = allNews.filter(noticia => {
            return (
                noticia.titulo.toLowerCase().includes(query) ||
                noticia.resumo.toLowerCase().includes(query) ||
                (noticia.descricao && noticia.descricao.toLowerCase().includes(query)) ||
                (noticia.fonte && noticia.fonte.toLowerCase().includes(query))
            );
        });
    }

    renderNews(filteredNews);
}

// Show loading state
function showLoading(show) {
    loadingElement.style.display = show ? 'flex' : 'none';
}

// Show error
function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Hide error
function hideError() {
    errorElement.classList.remove('show');
    errorElement.textContent = '';
}

// Show empty state
function showEmpty() {
    emptyElement.style.display = 'block';
    newsGrid.innerHTML = '';
}

// Show news details (modal or navigation)
function showNewsDetails(noticia) {
    // Se tiver URL origem, abre em nova aba
    if (noticia.url_origem) {
        window.open(noticia.url_origem, '_blank');
    } else {
        // Caso contrário, pode criar um modal ou página de detalhes
        console.log('Detalhes da notícia:', noticia);
        alert(`${noticia.titulo}\n\n${noticia.descricao}`);
    }
}

// Set hero background image
function setHeroBackground() {
    // Se quiser usar uma imagem específica, adicione a URL aqui
    const heroBackgroundUrl = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80'; // Exemplo
    
    if (heroBackgroundUrl) {
        heroImage.style.backgroundImage = `url('${heroBackgroundUrl}')`;
    }
}

// Refresh news periodically (opcional)
function setupAutoRefresh(intervalMinutes = 30) {
    setInterval(() => {
        console.log('Atualizando notícias...');
        fetchNews();
    }, intervalMinutes * 60 * 1000);
}

// Uncomment para ativar auto-refresh
// setupAutoRefresh(30);