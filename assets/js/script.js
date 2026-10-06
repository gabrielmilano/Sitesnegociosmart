/* ========================================
   NEGÓCIOS SMART — Sites
   Header, menu mobile, revelação ao rolar e WhatsApp flutuante
   ======================================== */

(() => {
    const header = document.getElementById('header');
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('headerNav');
    const waFloat = document.getElementById('waFloat');
    const hero = document.querySelector('.hero');

    // === HEADER + WHATSAPP FLUTUANTE ===
    // Marcos invisíveis + IntersectionObserver: nada de ler scrollY/offsetHeight (evita reflow forçado).
    const marco = (pai, topo) => {
        const m = document.createElement('div');
        m.setAttribute('aria-hidden', 'true');
        m.style.cssText = `position:absolute;top:${topo};left:0;width:1px;height:1px;pointer-events:none;visibility:hidden`;
        pai.appendChild(m);
        return m;
    };
    const passou = (fn) => new IntersectionObserver(([e]) => fn(!e.isIntersecting && e.boundingClientRect.top < 0));

    if ('IntersectionObserver' in window) {
        // cabeçalho com fundo depois de rolar 24px
        passou((sim) => header.classList.toggle('is-scrolled', sim)).observe(marco(document.body, '24px'));
        // WhatsApp flutuante depois de rolar 60% do topo
        if (waFloat && hero) passou((sim) => waFloat.classList.toggle('is-visible', sim)).observe(marco(hero, '60%'));
    } else {
        header.classList.add('is-scrolled');
        if (waFloat) waFloat.classList.add('is-visible');
    }

    // === MENU MOBILE ===
    const setMenu = (open) => {
        header.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    if (toggle && nav) {
        toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && header.classList.contains('is-open')) {
                setMenu(false);
                toggle.focus();
            }
        });
        document.addEventListener('click', (e) => {
            if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
        });
    }

    // === REVELAÇÃO AO ROLAR ===
    const revealEls = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-in'));
    }

    // === FAQ: mantém só um item aberto por vez ===
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
        item.addEventListener('toggle', () => {
            if (!item.open) return;
            faqItems.forEach((other) => { if (other !== item) other.open = false; });
        });
    });

    // === ANO NO RODAPÉ ===
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
