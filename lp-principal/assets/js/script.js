/* ========================================
   NEGÓCIOS SMART - Script Principal
   Animações, Interações e Funcionalidades
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // === NAVBAR SCROLL ===
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // === MOBILE NAV TOGGLE ===
    const navToggle = document.getElementById('navToggle');
    const nav = document.querySelector('.navbar');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
            navToggle.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        document.querySelectorAll('.navbar__links a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                navToggle.classList.remove('active');
            });
        });
    }

    // === SMOOTH SCROLL ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = navbar.offsetHeight + 20;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === SCROLL ANIMATIONS ===
    const animateElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // === COUNTER ANIMATION ===
    const counters = document.querySelectorAll('[data-count]');
    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out)
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                counter.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            requestAnimationFrame(updateCounter);
        });

        countersAnimated = true;
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero__stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // === FAQ ACCORDION ===
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Fechar todos
            faqItems.forEach(i => i.classList.remove('active'));

            // Abrir clicado (se não estava aberto)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // === FORM SUBMISSION (placeholder) ===
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Placeholder - integrar com backend depois
            alert('Formulário enviado! Em breve entraremos em contato.');
        });
    });

    // === PARALLAX SUBTLE NO HERO ORBS ===
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const orbs = document.querySelectorAll('.hero__orb');

                orbs.forEach((orb, i) => {
                    const speed = (i + 1) * 0.05;
                    orb.style.transform = `translateY(${scrolled * speed}px)`;
                });

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // === TYPING EFFECT ON HERO (opcional) ===
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle) {
        heroTitle.style.opacity = '1';
    }

});
