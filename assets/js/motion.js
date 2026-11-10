/* ========================================
   NEGÓCIOS SMART — Movimento
   Carregado pelo script.js depois que a página termina de abrir (não pesa na 1ª tela).
   Herói com telas que rolam e inclinação 3D. (O portfólio não usa mais GSAP: ver script.js.)
   ======================================== */

(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fino = matchMedia('(pointer: fine)').matches;

    /* cria a camada com a página inteira por cima do print estático */
    const montarTela = (aparelho, src) => new Promise((ok) => {
        if (!aparelho || !src) return ok(null);
        const caixa = document.createElement('div');
        caixa.className = 'rolagem';
        caixa.setAttribute('aria-hidden', 'true');
        const img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.onload = () => { caixa.appendChild(img); aparelho.appendChild(caixa); requestAnimationFrame(() => caixa.classList.add('is-on')); ok({ caixa, img }); };
        img.onerror = () => ok(null);
        img.src = src;
    });
    const distancia = (t) => Math.max(0, t.img.getBoundingClientRect().height - t.caixa.clientHeight);

    /* ---------- HERÓI ---------- */
    const visual = $('.hero__visual');
    if (visual) {
        // telas rolando sozinhas, devagar
        $$('[data-rolagem]', visual).forEach(async (ap) => {
            const t = await montarTela(ap, ap.dataset.rolagem);
            if (!t || reduz) return;
            gsap.to(t.img, { y: () => -distancia(t), duration: ap.classList.contains('phone') ? 16 : 22, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatDelay: 1.2, delay: 1 });
        });

        // inclinação 3D acompanhando o mouse (profundidade diferente em cada peça)
        if (fino) {
            visual.classList.add('is-3d');
            const rx = gsap.quickTo(visual, 'rotationX', { duration: .8, ease: 'power3' });
            const ry = gsap.quickTo(visual, 'rotationY', { duration: .8, ease: 'power3' });
            gsap.set(visual, { transformPerspective: 1400 });
            const camadas = [[$('.hero__phone', visual), 26], [$('.hero__chip-wa', visual), 40], [$('.hero__chip-seo', visual), 34]].filter(([el]) => el);
            const pos = camadas.map(() => ({ x: 0, y: 0, ax: 0, ay: 0 }));
            gsap.ticker.add(() => camadas.forEach(([el], i) => {
                const p = pos[i]; p.x += (p.ax - p.x) * .08; p.y += (p.ay - p.y) * .08;
                el.style.translate = `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`; // translate não briga com a animação "float" do CSS
            }));
            const hero = $('.hero');
            hero.addEventListener('pointermove', (e) => {
                const r = hero.getBoundingClientRect();
                const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
                ry(nx * 7); rx(-ny * 5);
                camadas.forEach(([, f], i) => { pos[i].ax = nx * f; pos[i].ay = ny * f; });
            });
            hero.addEventListener('pointerleave', () => { ry(0); rx(0); pos.forEach((p) => { p.ax = 0; p.ay = 0; }); });
        }

        // notificação de WhatsApp trocando de mensagem
        const chip = $('.hero__chip-wa'), msg = $('[data-notif]');
        if (chip && msg) {
            const frases = ['“Oi! Vi o site de vocês…”', '“Quero um orçamento, por favor”', '“Vocês atendem no sábado?”', '“Achei vocês no Google!”'];
            let i = 0;
            setInterval(() => {
                if (document.hidden) return;
                i = (i + 1) % frases.length;
                gsap.timeline()
                    .to(msg, { y: -8, opacity: 0, duration: .25, ease: 'power2.in' })
                    .add(() => { msg.textContent = frases[i]; chip.classList.add('is-novo'); })
                    .fromTo(msg, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' })
                    .fromTo(chip, { scale: .96 }, { scale: 1, duration: .5, ease: 'back.out(3)' }, '<')
                    .add(() => chip.classList.remove('is-novo'), '+=2');
            }, 3800);
        }
    }
})();
