/* ========================================
   ANALISADOR DE ENCAIXE (#analise) — _includes/analisador.html
   Uma pergunta por tela → resultado com nível de oportunidade, o que resolvemos,
   projeto do mesmo ramo (JSON #analiseProjetos, do _data/portfolio.yml) e WhatsApp com as respostas.
   Para mudar perguntas ou textos, mexa só em PERGUNTAS, SOLUCOES e RAMO.
   ======================================== */
(() => {
    const card = document.getElementById('analisador');
    if (!card) return;
    const corpo = document.getElementById('analiseCorpo');
    const passoTxt = document.getElementById('analisePasso');
    const barra = document.getElementById('analiseBarra');
    const voltar = document.getElementById('analiseVoltar');
    const ZAP = card.dataset.zap;
    let projetos = {};
    try { projetos = JSON.parse(document.getElementById('analiseProjetos').textContent); } catch (e) { /* sem projeto no resultado */ }

    // pontos = quanto aquela resposta mostra de oportunidade (0 = já resolvido)
    const PERGUNTAS = [
        { id: 'ramo', titulo: 'Qual é o ramo do seu negócio?', resumo: 'Ramo', op: [
            { v: 'automotivo', t: 'Automotivo', d: 'Som, película, estética automotiva, oficina' },
            { v: 'saude', t: 'Clínica, saúde e estética', d: 'Clínica, consultório, podologia, estética' },
            { v: 'comercio', t: 'Comércio e serviços locais', d: 'Loja, lavanderia, serviços da cidade' },
            { v: 'imoveis', t: 'Imóveis', d: 'Corretor autônomo, imobiliária' },
            { v: 'industria', t: 'Indústria e metalurgia', d: 'Usinagem, caldeiraria, fabricação' },
            { v: 'outro', t: 'Outro ramo', d: '' }
        ] },
        { id: 'google', titulo: 'Quando alguém procura o que você faz no Google, na sua cidade, você aparece?', resumo: 'No Google', op: [
            { v: 'topo', t: 'Sim, entre os primeiros', p: 0 },
            { v: 'embaixo', t: 'Apareço, mas lá embaixo', p: 1 },
            { v: 'nao', t: 'Não apareço', p: 2 },
            { v: 'naosei', t: 'Nunca reparei', p: 2 }
        ] },
        { id: 'site', titulo: 'Hoje, o seu negócio tem site?', resumo: 'Site', op: [
            { v: 'nao', t: 'Não tenho', p: 2 },
            { v: 'instagram', t: 'Só o Instagram ou um link na bio', p: 2 },
            { v: 'velho', t: 'Tenho, mas está desatualizado', p: 2 },
            { v: 'bom', t: 'Tenho e funciona bem', p: 0 }
        ] },
        { id: 'chegada', titulo: 'Como a maioria dos clientes chega até você?', resumo: 'Clientes chegam por', op: [
            { v: 'indicacao', t: 'Indicação, boca a boca', p: 1 },
            { v: 'instagram', t: 'Instagram', p: 1 },
            { v: 'passam', t: 'Passam na frente', p: 1 },
            { v: 'google', t: 'Google', p: 0 }
        ] },
        { id: 'pedidos', titulo: 'Como você recebe pedidos e agendamentos?', resumo: 'Pedidos', op: [
            { v: 'whats', t: 'WhatsApp, respondendo um por um', p: 1 },
            { v: 'telefone', t: 'Telefone', p: 2 },
            { v: 'ordem', t: 'Por ordem de chegada', p: 1 },
            { v: 'online', t: 'Já tenho agendamento online', p: 0 }
        ] },
        { id: 'prioridade', titulo: 'O que você mais quer agora?', resumo: 'Prioridade', op: [
            { v: 'google', t: 'Ser encontrado por mais gente' },
            { v: 'marca', t: 'Passar mais confiança' },
            { v: 'organizar', t: 'Organizar pedidos e agenda' },
            { v: 'fidelizar', t: 'Fazer o cliente voltar' }
        ] }
    ];

    const SOLUCOES = {
        google: { t: 'Aparecer no Google', d: 'Perfil da Empresa no Google bem configurado e uma página para cada serviço com o nome da cidade, para você aparecer quando procuram o que você faz.' },
        endereco: { t: 'Um endereço só seu', d: 'seunegocio.com.br com a sua marca. O cliente confia mais, o Google entende o que você faz e o Instagram deixa de ser a única porta.' },
        celular: { t: 'Site que funciona no celular', d: 'Rápido, com o seu serviço explicado em poucos segundos e o botão de chamar sempre à mão.' },
        pedido: { t: 'Pedido pronto no WhatsApp', d: 'O cliente escolhe o serviço no site e a mensagem chega montada. Menos vai e volta, mais tempo para atender.' },
        agenda: { t: 'Agenda organizada', d: 'Agendamento pelo site, com o horário escolhido pelo cliente e o aviso chegando para você.' },
        autoagenda: { t: 'Autoagendamento com WhatsApp personalizado', d: 'O paciente marca sozinho pelo celular, a recepção confirma com um toque e ele recebe no WhatsApp a mensagem com o nome dele, o dia e a hora. Na véspera, sai o lembrete.' },
        marca: { t: 'Marca que passa confiança', d: 'Identidade com as cores e o jeito do seu negócio, igual no site, no Google e no Instagram.' },
        fidelizar: { t: 'Clientes que voltam', d: 'Sistemas sob medida para lembrar o retorno, oferecer o próximo serviço e manter quem já é cliente por perto.' }
    };

    const RAMO = {
        automotivo: 'No automotivo, quem procura "insulfilm" ou "som automotivo" quer ver o serviço e chamar na hora.',
        saude: 'Na saúde e na estética, a pessoa quer confiar antes de marcar: quem atende, onde fica e como agendar.',
        comercio: 'No comércio local, quem procura quer saber se você está aberto, onde fica e como pedir.',
        imoveis: 'Nos imóveis, o cliente quer filtrar, ver as fotos e falar com o corretor sem preencher cadastro.',
        industria: 'Na indústria, quem compra procura capacidade, máquinas e prazo antes de pedir orçamento.',
        outro: 'Seja qual for o ramo, o caminho é o mesmo: ser encontrado, passar confiança e facilitar o contato.'
    };

    const resp = {};
    let atual = 0;
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const opcao = (id, v) => PERGUNTAS.find((q) => q.id === id).op.find((o) => o.v === v);

    function progresso(i) {
        const fim = i >= PERGUNTAS.length;
        passoTxt.textContent = fim ? 'Seu resultado' : `Pergunta ${i + 1} de ${PERGUNTAS.length}`;
        barra.style.width = `${(fim ? 1 : i / PERGUNTAS.length) * 100}%`;
        voltar.hidden = i === 0;
    }

    function pergunta(i, focar) {
        atual = i;
        progresso(i);
        const q = PERGUNTAS[i];
        const h = el('h3', 'analise__pergunta', q.titulo);
        h.tabIndex = -1;
        const lista = el('div', 'analise__opcoes');
        lista.setAttribute('role', 'group');
        lista.setAttribute('aria-label', q.titulo);
        q.op.forEach((o) => {
            const b = el('button', 'analise__opcao');
            b.type = 'button';
            b.setAttribute('aria-pressed', String(resp[q.id] === o.v));
            b.append(el('span', 'analise__opcao-t', o.t));
            if (o.d) b.append(el('small', null, o.d));
            b.addEventListener('click', () => {
                resp[q.id] = o.v;
                lista.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
                setTimeout(() => (i + 1 < PERGUNTAS.length ? pergunta(i + 1, true) : resultado()), 220);
            });
            lista.append(b);
        });
        corpo.replaceChildren(h, lista);
        if (focar) { h.focus({ preventScroll: true }); subir(); }
    }

    function resultado() {
        atual = PERGUNTAS.length;
        progresso(atual);

        const pontos = PERGUNTAS.reduce((s, q) => s + ((opcao(q.id, resp[q.id]) || {}).p || 0), 0);
        const nivel = pontos >= 5 ? 3 : pontos >= 3 ? 2 : 1;
        const titulo = [
            '',
            'Você já está bem encaminhado. Dá para ir além com sistemas e fidelização.',
            'Tem espaço para crescer com os ajustes certos.',
            'Seu negócio tem muito a ganhar com o que a gente faz.'
        ][nivel];

        // soluções: a prioridade escolhida primeiro, depois o que as respostas mostraram
        const chaves = [];
        const add = (k) => { if (!chaves.includes(k)) chaves.push(k); };
        ({ google: () => add('google'), marca: () => add('marca'), organizar: () => add('agenda'), fidelizar: () => add('fidelizar') })[resp.prioridade]?.();
        if (resp.google !== 'topo') add('google');
        if (resp.site === 'nao' || resp.site === 'instagram') add('endereco');
        if (resp.site === 'velho') add('celular');
        if (resp.pedidos === 'whats') add('pedido');
        if (resp.pedidos === 'telefone' || resp.pedidos === 'ordem') add('agenda');
        add('fidelizar');
        // clínica: o autoagendamento com WhatsApp entra no lugar da agenda comum, logo no começo
        if (resp.ramo === 'saude' && resp.pedidos !== 'online') {
            const i = chaves.indexOf('agenda');
            if (i > -1) chaves.splice(i, 1);
            chaves.splice(Math.min(1, chaves.length), 0, 'autoagenda');
        }
        const lista = chaves.slice(0, 4);

        const wrap = el('div', 'analise__resultado');
        const h = el('h3', 'analise__res-titulo', titulo);
        h.tabIndex = -1;

        const medidor = el('div', 'analise__nivel');
        medidor.setAttribute('role', 'img');
        medidor.setAttribute('aria-label', `Oportunidade ${['', 'baixa', 'média', 'alta'][nivel]}`);
        [1, 2, 3].forEach((n) => medidor.append(el('span', n <= nivel ? 'on' : '')));
        medidor.append(el('b', null, `Oportunidade ${['', 'baixa', 'média', 'alta'][nivel]}`));

        const ramo = el('p', 'analise__ramo', RAMO[resp.ramo] || RAMO.outro);

        const ul = el('ul', 'analise__solucoes');
        lista.forEach((k) => {
            const li = el('li');
            li.append(el('strong', null, SOLUCOES[k].t), el('span', null, SOLUCOES[k].d));
            ul.append(li);
        });

        wrap.append(medidor, h, ramo, el('p', 'analise__sub', 'O que a gente resolve para você'), ul);

        // projeto do mesmo ramo
        const proj = projetos[resp.ramo];
        if (proj && proj.nome) {
            const a = el('a', 'analise__proj');
            a.href = proj.status === 'cliente' ? `#nicho-${resp.ramo}` : '#sistemas-proprios';
            const img = el('img');
            img.src = `/assets/cases/${proj.slug}-800.webp`;
            img.alt = '';
            img.width = 160; img.height = 100;
            img.loading = 'lazy';
            const txt = el('span', 'analise__proj-txt');
            const cliente = proj.status === 'cliente';
            const rotulo = cliente ? 'Cliente real do seu ramo, no ar' : 'Sistema próprio da Negócios Smart · não é cliente';
            txt.append(el('small', null, rotulo), el('b', null, proj.nome), el('span', null, cliente ? `Ver clientes de ${proj.nicho} →` : 'Ver os sistemas próprios →'));
            a.append(img, txt);
            a.addEventListener('click', () => {
                const g = document.getElementById(proj.status === 'cliente' ? `nicho-${resp.ramo}` : 'sistemas-proprios');
                if (g) { g.classList.add('is-alvo'); setTimeout(() => g.classList.remove('is-alvo'), 2400); }
            });
            wrap.append(a);
        }
        if (resp.ramo === 'saude') {
            const p = el('p', 'analise__demo');
            const a = el('a', null, 'Testar o autoagendamento com WhatsApp →');
            a.href = '#autoagendamento';
            p.append(el('span', 'analise__demo-selo', 'Demonstração'), a);
            wrap.append(p);
        }
        if (!(proj && proj.nome)) {
            const p = el('p', 'analise__sem-proj', 'Ainda não temos um projeto do seu ramo publicado aqui. ');
            const a = el('a', null, 'Veja como trabalhamos nos outros ramos →');
            a.href = '#projetos';
            p.append(a);
            wrap.append(p);
        }

        // WhatsApp com as respostas
        const linhas = PERGUNTAS.map((q) => `• ${q.resumo}: ${(opcao(q.id, resp[q.id]) || {}).t || '-'}`);
        const msg = `Olá! Fiz a análise no site da Negócios Smart.\n${linhas.join('\n')}\nQuero conversar sobre o resultado.`;
        const acoes = el('div', 'analise__acoes');
        const zap = el('a', 'btn btn--primary btn--lg');
        zap.href = `https://wa.me/${ZAP}?text=${encodeURIComponent(msg)}`;
        zap.target = '_blank';
        zap.rel = 'noopener';
        zap.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-whatsapp"/></svg>';
        zap.append('Enviar resultado no WhatsApp');
        const diag = el('a', 'link-arrow', 'Fazer o diagnóstico completo');
        diag.href = '/diagnostico';
        const refazer = el('button', 'analise__refazer', 'Refazer');
        refazer.type = 'button';
        refazer.addEventListener('click', () => { Object.keys(resp).forEach((k) => delete resp[k]); pergunta(0, true); });
        acoes.append(zap, diag, refazer);
        wrap.append(acoes);

        corpo.replaceChildren(wrap);
        h.focus({ preventScroll: true });
        subir();
    }

    // no celular o cartão muda de altura: se o topo dele sumiu sob o cabeçalho, volta para ele
    function subir() {
        if (card.getBoundingClientRect().top < 80) card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }

    voltar.addEventListener('click', () => { if (atual > 0) pergunta(atual - 1, true); });
    pergunta(0, false);
})();
