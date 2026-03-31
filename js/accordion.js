// ── Accordion with nested support ──
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.accordion-group').forEach(group => {
        group.addEventListener('click', (e) => {
            const trigger = e.target.closest('.accordion-trigger');
            if (!trigger) return;

            const item = trigger.parentElement;
            const content = trigger.nextElementSibling;
            if (!content || !content.classList.contains('accordion-content')) return;

            const isExpanded = item.classList.contains('expanded');

            if (isExpanded) {
                // Collapse
                item.classList.remove('expanded');
                content.style.maxHeight = '0';
                trigger.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
            } else {
                // Expand
                item.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
            }

            // Recalculate ancestor accordion heights after child transition
            updateAncestorHeights(content);
        });
    });

    function updateAncestorHeights(changedContent) {
        // Listen for the transition end on the changed content,
        // then recalculate all ancestor accordion heights
        changedContent.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'max-height') return;
            changedContent.removeEventListener('transitionend', handler);
            recalcAncestors(changedContent);
        }, { once: true });

        // Also do an immediate pass for parents that need to grow
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
