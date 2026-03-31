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
