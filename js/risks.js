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
