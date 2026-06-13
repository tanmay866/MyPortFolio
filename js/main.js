document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const navLinksWrap = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    /* ---- Theme toggle (light / dark) ---- */
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const THEME_COLORS = { light: '#FAFAF8', dark: '#0F1115' };

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        if (themeMeta) themeMeta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-moon', theme === 'light');
            icon.classList.toggle('fa-sun', theme === 'dark');
        }
        themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    };

    // Sync button state with the theme set by the inline head script
    applyTheme(root.getAttribute('data-theme') || 'light');

    themeToggle?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });

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

    /* ---- Magnet / 3D tilt (project cards + hero photo) ---- */
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canHover && !reduceMotion) {
        const addTilt = (el, { maxTilt = 7, pull = 6, lift = 6 } = {}) => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
                const py = (e.clientY - r.top) / r.height - 0.5;
                el.style.transition = 'transform .1s ease-out';
                el.style.transform =
                    `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) ` +
                    `rotateY(${(px * maxTilt).toFixed(2)}deg) ` +
                    `translate(${(px * pull).toFixed(1)}px, ${(py * pull - lift).toFixed(1)}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform .45s cubic-bezier(.2, .8, .2, 1)';
                el.style.transform = '';
            });
        };

        document.querySelectorAll('.project-card').forEach(card => addTilt(card, { maxTilt: 7, pull: 6, lift: 6 }));

        const avatar = document.querySelector('.avatar-wrap');
        if (avatar) addTilt(avatar, { maxTilt: 9, pull: 8, lift: 0 });
    }
});
