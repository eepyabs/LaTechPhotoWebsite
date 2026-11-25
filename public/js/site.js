(function () {
    const storageKey = 'latech-photo-theme';
    const root = document.documentElement;
    try {
        root.dataset.theme = localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
    } catch {
        root.dataset.theme = 'light';
    }

    function updateToggle(toggle) {
        const theme = root.dataset.theme;
        toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
        toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-current-page]').forEach(pageMarker => {
            const currentPage = pageMarker.dataset.currentPage;
            const activeLink = document.querySelector(`[data-nav="${currentPage}"]`);
            if (activeLink) activeLink.setAttribute('aria-current', 'page');
        });

        document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
            updateToggle(toggle);
            toggle.addEventListener('click', () => {
                root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
                try { localStorage.setItem(storageKey, root.dataset.theme); } catch { /* Theme remains set for this page. */ }
                updateToggle(toggle);
            });
        });
    });
})();
