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
    const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 24);
        if (waFloat && hero) {
            waFloat.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

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
