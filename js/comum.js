// ================= COMUM A TODAS AS PÁGINAS =================
// Carregado antes do script de cada página. Reúne o que se repete:
// preferência de menos movimento, controle de autoplay dos carrosséis,
// acessibilidade do menu móvel e o link "Pular para o conteúdo".
window.IGDS = window.IGDS || {};

(function () {
    // ---------- Menos movimento ----------
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    IGDS.reduzirMovimento = () => reduceMotionQuery.matches;

    // Rolagens suaves pedidas pelos scripts das páginas viram instantâneas
    // quando a pessoa pediu menos movimento no sistema.
    const nativeScrollTo = window.scrollTo.bind(window);
    window.scrollTo = function (a, b) {
        if (arguments.length === 1 && a && typeof a === 'object' && IGDS.reduzirMovimento()) {
            return nativeScrollTo(Object.assign({}, a, { behavior: 'auto' }));
        }
        return arguments.length > 1 ? nativeScrollTo(a, b) : nativeScrollTo(a);
    };
    const nativeScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (arg) {
        if (arg && typeof arg === 'object' && IGDS.reduzirMovimento()) {
            return nativeScrollIntoView.call(this, Object.assign({}, arg, { behavior: 'auto' }));
        }
        return arguments.length ? nativeScrollIntoView.call(this, arg) : nativeScrollIntoView.call(this);
    };

    // ---------- Rolagem ----------
    // Um único listener passivo para a página inteira: cada tarefa recebe a
    // posição uma vez por quadro, sem ler layout. Antes cada página somava
    // 3 ou 4 listeners que reescreviam os estilos do cabeçalho a cada evento
    // (dois deles com debounce brigando entre si), e isso travava a rolagem.
    const scrollTasks = [];
    let scrollTicking = false;
    const scrollY = () => Math.max(0, window.pageYOffset); // ignora o "quique" do iOS
    const runScrollTasks = () => {
        scrollTicking = false;
        const y = scrollY();
        scrollTasks.forEach((task) => task(y));
    };
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(runScrollTasks);
    }, { passive: true });

    IGDS.onScroll = function (task) {
        scrollTasks.push(task);
        task(scrollY());
    };

    // Avisa só quando a LARGURA muda. No celular a barra de endereço some e
    // volta durante a rolagem e dispara "resize" sem a largura mudar;
    // refazer carrosséis nessa hora fazia a página engasgar.
    IGDS.onResize = function (fn) {
        let width = window.innerWidth;
        let timer;
        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (window.innerWidth === width) return;
                width = window.innerWidth;
                fn();
            }, 150);
        }, { passive: true });
    };

    // ---------- Cabeçalho e "voltar ao topo" ----------
    // Uma classe trocada só quando cruza o limite, em vez de estilos inline
    // reescritos a cada evento. O desfoque (backdrop-filter) saiu: atrás de
    // um fundo 95% branco ele não aparecia, mas obrigava o navegador a
    // redesenhar o desfoque da foto do hero a cada quadro da rolagem.
    const header = document.querySelector('.header');
    if (header) {
        let scrolled = null;
        IGDS.onScroll((y) => {
            const now = y > 100;
            if (now === scrolled) return;
            scrolled = now;
            header.classList.toggle('is-scrolled', now);
        });
    }

    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        let shown = null;
        IGDS.onScroll((y) => {
            const now = y > 300;
            if (now === shown) return;
            shown = now;
            backToTop.classList.toggle('show', now);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- Parallax do hero ----------
    // Onde o navegador suporta animações ligadas à rolagem (Chrome, Edge,
    // Safari recentes), quem move a foto é o CSS (.parallax-css em
    // comum.css), na mesma thread que rola a página: a foto acompanha o
    // dedo/trackpad sem atraso. Com JavaScript ela sempre chegava um quadro
    // depois da rolagem, e isso aparecia como "travadinhas" ao descer devagar.
    // O caminho em JS fica só como reserva para os demais navegadores.
    const cssParallax = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'));

    IGDS.parallax = function (selector, factor) {
        const el = document.querySelector(selector);
        if (!el) return;
        // O CSS usa o mesmo fator 0.5 de todas as páginas
        if (cssParallax && factor === 0.5) {
            el.classList.add('parallax-css');
            return;
        }

        // Reserva em JS: sem ler layout na rolagem; a visibilidade do hero
        // vem de um IntersectionObserver.
        const section = el.closest('section') || el.parentElement;
        let onScreen = true;
        let last = null;
        const apply = (y) => {
            const offset = IGDS.reduzirMovimento() ? 0 : y * factor;
            if (!onScreen || offset === last) return;
            last = offset;
            el.style.transform = offset ? 'translate3d(0, ' + offset + 'px, 0)' : '';
        };
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                onScreen = entries[0].isIntersecting;
                // O observador avisa depois da rolagem: num salto grande
                // ("voltar ao topo") a foto precisa ser reposicionada aqui.
                if (onScreen) apply(scrollY());
            }).observe(section);
        }
        IGDS.onScroll(apply);
        if (reduceMotionQuery.addEventListener) {
            reduceMotionQuery.addEventListener('change', () => apply(scrollY()));
        }
    };

    // ---------- Autoplay com controle ----------
    // Uso: const auto = IGDS.autoplay({ region, next, delay, mount, inline });
    //      auto.stop()  -> pausa como se a pessoa tivesse clicado em pausar
    // O carrossel só avança sozinho quando ninguém está interagindo com ele:
    // pausa com o mouse em cima, com o foco dentro, fora da tela, com a aba
    // oculta e, por padrão, para quem pediu menos movimento.
    const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
    const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>';

    IGDS.autoplay = function ({ region, next, delay, mount, inline }) {
        if (!region || typeof next !== 'function') return { stop() {} };

        let userPaused = IGDS.reduzirMovimento();
        let hovered = false;
        let focused = false;
        let onScreen = true;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'autoplay-toggle' + (inline ? ' is-inline' : '');

        const render = () => {
            button.innerHTML = userPaused ? ICON_PLAY : ICON_PAUSE;
            button.setAttribute('aria-label', userPaused ? 'Retomar passagem automática' : 'Pausar passagem automática');
            button.classList.toggle('is-paused', userPaused);
        };

        button.addEventListener('click', () => {
            userPaused = !userPaused;
            render();
            // Ao retomar, avança uma vez na hora para confirmar o clique
            if (!userPaused) next();
        });

        if (!inline && getComputedStyle(region).position === 'static') {
            region.style.position = 'relative';
        }
        (mount || region).appendChild(button);
        render();

        region.addEventListener('mouseenter', () => { hovered = true; });
        region.addEventListener('mouseleave', () => { hovered = false; });
        region.addEventListener('focusin', (e) => { if (e.target !== button) focused = true; });
        region.addEventListener('focusout', (e) => { focused = region.contains(e.relatedTarget) && e.relatedTarget !== button; });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                onScreen = entries[0].isIntersecting;
            }, { threshold: 0.25 }).observe(region);
        }

        setInterval(() => {
            if (userPaused || hovered || focused || !onScreen || document.hidden) return;
            next();
        }, delay);

        return {
            stop() {
                userPaused = true;
                render();
            }
        };
    };

    // ---------- Estado acessível dos carrosséis ----------
    // Fatias fora de vista saem da leitura sequencial e do tab: ganham
    // aria-hidden e, se tiverem algo focável, tabindex="-1" (restaurado ao
    // voltarem a ficar visíveis). Serve tanto carrossel de uma fatia por vez
    // (passe um índice) quanto o de várias fatias visíveis ao mesmo tempo
    // (passe a lista de índices visíveis).
    const FOCUSABLE_SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

    IGDS.slideVisibility = function (slides) {
        slides = Array.from(slides || []);

        function apply(visibleIndices) {
            const visible = new Set(visibleIndices);
            slides.forEach((slide, i) => {
                const isVisible = visible.has(i);
                if (isVisible) slide.removeAttribute('aria-hidden');
                else slide.setAttribute('aria-hidden', 'true');
                slide.querySelectorAll(FOCUSABLE_SEL).forEach((el) => {
                    if (isVisible) {
                        if (el.hasAttribute('data-igds-tabindex')) {
                            const saved = el.getAttribute('data-igds-tabindex');
                            if (saved) el.setAttribute('tabindex', saved);
                            else el.removeAttribute('tabindex');
                            el.removeAttribute('data-igds-tabindex');
                        }
                    } else if (!el.hasAttribute('data-igds-tabindex')) {
                        el.setAttribute('data-igds-tabindex', el.getAttribute('tabindex') || '');
                        el.setAttribute('tabindex', '-1');
                    }
                });
            });
        }

        return {
            set(indices) {
                apply(Array.isArray(indices) ? indices : [indices]);
            }
        };
    };

    // Região aria-live única, reaproveitada por todos os carrosséis da
    // página. Só deve ser chamada em resposta a uma troca pedida por quem
    // usa o site (seta, indicador, teclado, arraste) — nunca a cada avanço
    // automático, para não interromper leitores de tela a cada 4-8s.
    let liveRegion;
    IGDS.announce = function (text) {
        if (!text) return;
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        // setTimeout, não requestAnimationFrame: o anúncio precisa sair mesmo
        // com a aba em segundo plano, onde o navegador pausa os frames.
        liveRegion.textContent = '';
        setTimeout(() => { liveRegion.textContent = text; }, 50);
    };

    // ---------- Aparecer ao entrar na tela ----------
    // Sobe 30px e aparece; com menos movimento, só aparece. Depois de
    // aparecer, os estilos inline saem, para o :hover do CSS voltar a valer
    // (antes o transform inline travava o efeito de hover dos cartões).
    IGDS.reveal = function (elements) {
        const els = Array.from(elements || []);
        if (!els.length || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                io.unobserve(el);
                el.style.opacity = '';
                el.style.transform = '';
                setTimeout(() => { el.style.transition = ''; }, 700);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        els.forEach((el) => {
            el.style.opacity = '0';
            if (!IGDS.reduzirMovimento()) el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            io.observe(el);
        });
    };

    // ---------- Menu móvel ----------
    // O abrir/fechar continua no script de cada página; aqui só
    // sincronizamos o estado para leitores de tela e o teclado.
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        const syncMenuState = () => {
            const open = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        };

        new MutationObserver(syncMenuState).observe(navMenu, {
            attributes: true,
            attributeFilter: ['class']
        });
        syncMenuState();

        // Esc fecha o menu e devolve o foco ao botão. Em fase de captura para
        // rodar antes dos handlers de Esc que algumas páginas já tinham.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.focus();
            }
        }, true);
    }

    // ---------- Links internas (#âncora) e "Pular para o conteúdo" ----------
    // Um só tratador para o site todo (cada página tinha o seu, com regras
    // diferentes). Desconta a altura do cabeçalho fixo e leva o foco do
    // teclado junto com a rolagem.
    document.addEventListener('click', (e) => {
        const link = e.target.closest && e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        let target;
        try { target = document.querySelector(id); } catch (err) { return; }
        if (!target) return;

        e.preventDefault();
        const headerOffset = header && getComputedStyle(header).position === 'fixed' ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

        if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
    });

    // ---------- Imagens quebradas ----------
    // Uma imagem que não carrega fica oculta (sem ícone quebrado), mas o
    // espaço dela continua reservado. Se depois ela carregar (ex.: a foto da
    // ampliação, que começa vazia), volta a aparecer. Antes, duas páginas
    // trocavam o src por um endereço inválido e a imagem falhava em loop.
    document.addEventListener('error', (e) => {
        const img = e.target;
        if (img.tagName !== 'IMG' || !img.getAttribute('src')) return;
        img.style.visibility = 'hidden';
        img.dataset.igdsBroken = '';
    }, true);
    document.addEventListener('load', (e) => {
        const img = e.target;
        if (img.tagName !== 'IMG' || !('igdsBroken' in img.dataset)) return;
        img.style.visibility = '';
        delete img.dataset.igdsBroken;
    }, true);
    // As que já falharam antes deste script rodar
    document.querySelectorAll('img[src]').forEach((img) => {
        if (img.complete && img.naturalWidth === 0 && !/\.svg(\?|$)/i.test(img.src)) {
            img.style.visibility = 'hidden';
            img.dataset.igdsBroken = '';
        }
    });
})();
