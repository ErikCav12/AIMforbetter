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

    const overlayClose = document.getElementById('overlay-close');
    if (overlayClose) overlayClose.addEventListener('click', closeMenu);


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
// ── Scroll reveal via IntersectionObserver ──
document.addEventListener('DOMContentLoaded', () => {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
// ── Accordion with nested support ──
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.accordion-trigger');
        if (!trigger) return;

        const item = trigger.parentElement;
        const content = trigger.nextElementSibling;
        if (!content || !content.classList.contains('accordion-content')) return;

        // Prevent parent accordion groups from also handling this click
        e.stopPropagation();

        const isExpanded = item.classList.contains('expanded');

        if (isExpanded) {
            item.classList.remove('expanded');
            content.style.maxHeight = '0';
            trigger.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');
        } else {
            item.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
            trigger.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');
        }

        // Recalculate ancestor accordion heights
        updateAncestorHeights(content);
    });

    function updateAncestorHeights(changedContent) {
        changedContent.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'max-height') return;
            changedContent.removeEventListener('transitionend', handler);
            recalcAncestors(changedContent);
        }, { once: true });

        recalcAncestors(changedContent);
    }

    function recalcAncestors(element) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.classList.contains('accordion-content')) {
                const parentItem = parent.parentElement;
                if (parentItem && parentItem.classList.contains('expanded')) {
                    parent.style.maxHeight = parent.scrollHeight + 'px';
                }
            }
            parent = parent.parentElement;
        }
    }
});
// ── Formspree email & structured form handler ──
document.addEventListener('DOMContentLoaded', () => {
    const EMAIL_CAPTURE_ENDPOINT = 'https://formspree.io/f/xjgpwjyl';
    const hasEmailEndpoint = !EMAIL_CAPTURE_ENDPOINT.includes('your_form_id');

    async function submitForm(data) {
        if (!hasEmailEndpoint) {
            throw new Error('Email endpoint is not configured yet.');
        }

        const response = await fetch(EMAIL_CAPTURE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                page: window.location.href
            })
        });

        if (!response.ok) {
            throw new Error('Submission failed');
        }
    }

    // Email capture forms (.email-row)
    document.querySelectorAll('.email-row').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            const button = this.querySelector('button[type="submit"]');
            const messageEl = document.getElementById(this.dataset.message);
            const fineprint = this.nextElementSibling;
            const email = input.value.trim();
            const source = this.id || 'email-form';
            const originalText = button.textContent;

            if (!email) return;

            button.disabled = true;
            button.textContent = 'Submitting...';

            try {
                await submitForm({ email, source });
                this.style.display = 'none';
                if (fineprint && fineprint.classList.contains('form-fine-print')) {
                    fineprint.style.display = 'none';
                }
                if (messageEl) {
                    messageEl.classList.remove('error');
                    messageEl.textContent = "Thanks, we'll be in touch when programmes open.";
                    messageEl.style.display = 'block';
                }
            } catch (error) {
                if (messageEl) {
                    messageEl.classList.add('error');
                    messageEl.textContent = hasEmailEndpoint
                        ? 'Something went wrong. Please try again in a moment.'
                        : 'Form is almost ready. Add your endpoint in the script to start collecting emails.';
                    messageEl.style.display = 'block';
                }
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });

    // Structured contact form (#contact-form)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const button = this.querySelector('button[type="submit"]');
            const messageEl = this.querySelector('.form-message');
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            data.source = 'contact-form';
            const originalText = button.textContent;

            button.disabled = true;
            button.textContent = 'Sending...';

            try {
                await submitForm(data);
                this.reset();
                if (messageEl) {
                    messageEl.classList.remove('error');
                    messageEl.textContent = "Thanks for getting in touch. We'll respond within 2 working days.";
                    messageEl.style.display = 'block';
                }
            } catch (error) {
                if (messageEl) {
                    messageEl.classList.add('error');
                    messageEl.textContent = 'Something went wrong. Please try again or email us directly.';
                    messageEl.style.display = 'block';
                }
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }
});
// ── Animated counter (numbers tick up when scrolled into view) ──
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateCounter(el) {
        const target = parseFloat(el.dataset.target);
        if (isNaN(target)) return;

        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const decimals = parseInt(el.dataset.decimals || '0');
        const duration = 1500;

        // Skip animation for very small targets (e.g. "1 in 3") or reduced motion
        if (prefersReduced || target <= 1) {
            el.textContent = prefix + formatNumber(target, decimals) + suffix;
            return;
        }

        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            el.textContent = prefix + formatNumber(current, decimals) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    function formatNumber(num, decimals) {
        if (decimals > 0) return num.toFixed(decimals);
        return Math.round(num).toString();
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
});
// ── Contrast pair slide-in orchestration ──
document.addEventListener('DOMContentLoaded', () => {
    const pairs = document.querySelectorAll('.contrast-pair');
    if (!pairs.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const pairObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                pairObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    pairs.forEach(pair => {
        pair.classList.add('animate-ready');
        pairObserver.observe(pair);
    });
});
// ── Expandable tile groups (Risks, Audience cards) ──
// Click toggles on all devices. Desktop with fine pointer also opens on hover;
// once a click pins, hover-out won't auto-close until clicked again.
document.addEventListener('DOMContentLoaded', () => {
    setupExpander({
        tileSelector: '.risk-tile',
        dataAttr: 'risk',
        detailIdPrefix: 'risk-',
        detailIdSuffix: '-detail',
    });
    setupExpander({
        tileSelector: '.audience-tile',
        dataAttr: 'aud',
        detailIdPrefix: 'aud-',
        detailIdSuffix: '-detail',
    });

    function setupExpander({ tileSelector, dataAttr, detailIdPrefix, detailIdSuffix }) {
        const tiles = document.querySelectorAll(tileSelector);
        if (!tiles.length) return;

        const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        let hoverPinned = false;

        function getDetail(id) {
            return document.getElementById(detailIdPrefix + id + detailIdSuffix);
        }

        function closeAll() {
            tiles.forEach(t => {
                t.setAttribute('aria-expanded', 'false');
                const id = t.getAttribute('data-' + dataAttr);
                const d = getDetail(id);
                if (d) d.hidden = true;
            });
        }

        function open(id) {
            closeAll();
            const tile = document.querySelector(tileSelector + '[data-' + dataAttr + '="' + id + '"]');
            const detail = getDetail(id);
            if (!tile || !detail) return;
            tile.setAttribute('aria-expanded', 'true');
            detail.hidden = false;
        }

        tiles.forEach(tile => {
            const id = tile.getAttribute('data-' + dataAttr);

            tile.addEventListener('click', () => {
                const isOpen = tile.getAttribute('aria-expanded') === 'true';
                if (isOpen) {
                    closeAll();
                    hoverPinned = false;
                } else {
                    open(id);
                    hoverPinned = true;
                }
            });

            if (supportsHover) {
                tile.addEventListener('mouseenter', () => {
                    // Hover switches between tiles even when one is pinned —
                    // pin only governs auto-close on mouseleave, not which tile is open.
                    open(id);
                });
            }
        });

        if (supportsHover) {
            const firstTile = document.querySelector(tileSelector);
            const grid = firstTile && firstTile.parentElement;
            const wrapper = grid && grid.parentElement;
            if (wrapper) {
                wrapper.addEventListener('mouseleave', () => {
                    if (hoverPinned) return;
                    closeAll();
                });
            }
        }
    }
});
