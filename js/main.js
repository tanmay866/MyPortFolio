document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const navLinksWrap = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    /* ---- Nav background on scroll ---- */
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- Mobile menu ---- */
    const setIcon = (open) => {
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-times', open);
    };
    mobileToggle?.addEventListener('click', () => {
        const open = navLinksWrap.classList.toggle('active');
        setIcon(open);
    });
    navLinks.forEach(link => link.addEventListener('click', () => {
        navLinksWrap.classList.remove('active');
        setIcon(false);
    }));

    /* ---- Reveal on scroll ---- */
    const revealEls = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('visible'));
        return;
    }
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    /* ---- Active nav link via section observer ---- */
    const sections = document.querySelectorAll('section[id], header[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
            }
        });
    }, { threshold: 0.5 });
    sections.forEach(s => sectionObserver.observe(s));

    /* ---- Animated stat counters ---- */
    const formatNum = (el, value) => {
        el.textContent = value >= 2000 ? value : value.toLocaleString();
    };
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1200;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                formatNum(el, Math.round(target * eased));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            statObserver.unobserve(el);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

    /* ---- Project card spotlight ---- */
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });
});
