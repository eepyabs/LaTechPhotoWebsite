(function () {
    const storageKey = 'latech-photo-theme';
    const root = document.documentElement;
    const savedTheme = localStorage.getItem(storageKey);
    const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    root.dataset.theme = savedTheme || defaultTheme;

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
                localStorage.setItem(storageKey, root.dataset.theme);
                updateToggle(toggle);
            });
        });
    });
})();
