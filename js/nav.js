// ── Burger menu & nav scroll state ──
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const overlay = document.getElementById('menu-overlay');
    const hero = document.getElementById('hero');
    const menuLinks = overlay.querySelectorAll('a');
    const firstLink = menuLinks[0];
    const lastLink = menuLinks[menuLinks.length - 1];

    function openMenu() {
        burger.classList.add('open');
        overlay.classList.add('open');
        overlay.removeAttribute('inert');
        document.body.classList.add('menu-open');
        burger.setAttribute('aria-expanded', 'true');
        // Move focus to first menu link
        firstLink.focus();
    }

    function closeMenu() {
        burger.classList.remove('open');
        overlay.classList.remove('open');
        overlay.setAttribute('inert', '');
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
        // Return focus to burger
        burger.focus();
        // Re-sync nav state after close
        if (hero) {
            const rect = hero.getBoundingClientRect();
            const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
            nav.classList.toggle('hero-visible', isVisible);
            nav.classList.toggle('scrolled', !isVisible);
        }
    }

    function toggleMenu() {
        if (burger.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    burger.addEventListener('click', toggleMenu);

    // Close on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on ESC, focus trap on Tab
    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('open')) return;

        if (e.key === 'Escape') {
            closeMenu();
            return;
        }

        // Focus trap
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstLink) {
                e.preventDefault();
                lastLink.focus();
            } else if (!e.shiftKey && document.activeElement === lastLink) {
                e.preventDefault();
                firstLink.focus();
            }
        }
    });

    // Start overlay as inert (hidden from tab order)
    overlay.setAttribute('inert', '');

    // Nav scroll state
    if (hero) {
        const navObserver = new IntersectionObserver(([entry]) => {
            if (overlay.classList.contains('open')) return;
            nav.classList.toggle('hero-visible', entry.isIntersecting);
            nav.classList.toggle('scrolled', !entry.isIntersecting);
        }, { threshold: 0.1 });
        navObserver.observe(hero);
    } else {
        nav.classList.add('scrolled');
    }
});
