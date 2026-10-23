/* ========================================
   NEGÓCIOS SMART — Movimento
   Carregado pelo script.js depois que a página termina de abrir (não pesa na 1ª tela).
   Herói com telas que rolam e inclinação 3D + portfólio com rolagem travada.
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

    /* ---------- PORTFÓLIO COM ROLAGEM TRAVADA (só telas largas) ---------- */
    const cases = $('.cases');
    if (!cases) return;

    // Qualquer mudança de altura da página depois do cálculo (imagem, fonte, CSS em cache,
    // extensão do navegador) deixava o ponto de travar desatualizado, e o portfólio "travava"
    // por cima das seções de cima. Agora as posições são recalculadas sempre que a altura muda.
    let alturaCalculada = 0, aguardando;
    ScrollTrigger.addEventListener('refresh', () => { alturaCalculada = document.documentElement.scrollHeight; });
    new ResizeObserver(() => {
        if (Math.abs(document.documentElement.scrollHeight - alturaCalculada) < 2) return;
        clearTimeout(aguardando);
        aguardando = setTimeout(() => ScrollTrigger.refresh(), 150);
    }).observe(document.body);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', () => {
        const itens = $$('.case', cases);
        const n = itens.length;
        const num = $('.cases__num', cases), barra = $('.cases__barra i', cases);
        cases.classList.add('is-pinned');
        // bloco do tamanho do maior projeto quando a tela é baixa (senão o projeto vaza para cima)
        const ajustarAltura = () => {
            cases.style.height = '';
            const maior = Math.max(...itens.map((c) => c.scrollHeight));
            if (maior > cases.clientHeight) cases.style.height = maior + 'px';
        };
        ajustarAltura();
        ScrollTrigger.addEventListener('refreshInit', ajustarAltura);
        gsap.set(itens, { autoAlpha: 0 });
        gsap.set(itens[0], { autoAlpha: 1 });

        // telas de cada projeto (carregam quando o portfólio se aproxima)
        const telas = itens.map(() => ({}));
        const carregar = () => itens.forEach(async (c, i) => {
            const m = $('.case__media', c);
            telas[i].desk = await montarTela($('.browser', m), m.dataset.desk);
            telas[i].cel = await montarTela($('.phone', m), m.dataset.cel);
            ScrollTrigger.refresh();
        });
        ScrollTrigger.create({ trigger: '#projetos', start: 'top 160%', once: true, onEnter: carregar });

        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        itens.forEach((c, i) => {
            const t0 = i * 1.4;
            // a página do projeto rola dentro do computador e do celular
            const rola = { k: 0 };
            tl.to(rola, { k: 1, duration: 1, onUpdate: () => {
                const t = telas[i];
                if (t.desk) gsap.set(t.desk.img, { y: -distancia(t.desk) * rola.k * .85 });
                if (t.cel) gsap.set(t.cel.img, { y: -distancia(t.cel) * rola.k * .85 });
            } }, t0);
            if (i < n - 1) {
                const prox = itens[i + 1];
                tl.to($('.case__media', c), { yPercent: -12, autoAlpha: 0, duration: .4, ease: 'power2.in' }, t0 + 1)
                  .to($('.case__info', c), { y: -40, autoAlpha: 0, duration: .3, ease: 'power2.in' }, t0 + 1)
                  .set(c, { autoAlpha: 0 }, t0 + 1.4)
                  .set(prox, { autoAlpha: 1 }, t0 + 1.0)
                  .fromTo($('.case__media', prox), { yPercent: 14, autoAlpha: 0, rotationX: 8, transformPerspective: 1200 }, { yPercent: 0, autoAlpha: 1, rotationX: 0, duration: .45, ease: 'power3.out' }, t0 + 1.05)
                  .fromTo($('.case__info', prox), { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .4, ease: 'power3.out' }, t0 + 1.15);
            }
        });

        const st = ScrollTrigger.create({
            trigger: cases, start: 'center center+=50', end: () => '+=' + window.innerHeight * n * .9,
            pin: true, scrub: .6, animation: tl, invalidateOnRefresh: true,
            onUpdate: (s) => {
                const atual = Math.min(n, Math.floor(s.progress * n * .999) + 1);
                if (num) num.textContent = String(atual).padStart(2, '0');
                if (barra) barra.style.transform = `scaleX(${s.progress})`;
            },
        });

        return () => { // telas estreitas: volta ao layout normal
            st.kill(); tl.kill();
            ScrollTrigger.removeEventListener('refreshInit', ajustarAltura);
            cases.style.height = '';
            cases.classList.remove('is-pinned');
            gsap.set(itens, { clearProps: 'all' });
            gsap.set($$('.case__media, .case__info', cases), { clearProps: 'all' });
        };
    });
})();
