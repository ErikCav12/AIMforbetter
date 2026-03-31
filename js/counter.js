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
