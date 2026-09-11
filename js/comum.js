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

    // ---------- Parallax do hero ----------
    // Um só listener de scroll passivo, com throttle por requestAnimationFrame.
    // Não faz nada (e limpa o transform) para quem pediu menos movimento.
    IGDS.parallax = function (selector, factor) {
        const el = document.querySelector(selector);
        if (!el) return;
        let ticking = false;
        const apply = () => {
            ticking = false;
            if (IGDS.reduzirMovimento()) { el.style.transform = ''; return; }
            el.style.transform = 'translateY(' + (window.pageYOffset * factor) + 'px)';
        };
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(apply);
        }, { passive: true });
        apply();
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

    // ---------- Pular para o conteúdo ----------
    // Leva o foco do teclado junto com a rolagem
    document.querySelectorAll('.skip-link').forEach((link) => {
        link.addEventListener('click', () => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            setTimeout(() => target.focus({ preventScroll: true }), 0);
        });
    });
})();
