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
