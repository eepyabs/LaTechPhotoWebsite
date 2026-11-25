document.addEventListener('DOMContentLoaded', () => {
    const stage = document.querySelector('[data-projection]');
    if (!stage) return;

    const image = stage.querySelector('[data-projection-image]');
    const credit = stage.querySelector('[data-projection-credit]');
    const link = stage.querySelector('[data-projection-link]');
    const frames = [...stage.querySelectorAll('[data-frame]')];
    let selected = frames[0];

    for (const frame of frames) {
        frame.addEventListener('click', () => {
            if (frame === selected) return;
            selected.setAttribute('aria-pressed', 'false');
            selected = frame;
            selected.setAttribute('aria-pressed', 'true');
            image.src = frame.dataset.src;
            image.alt = frame.dataset.alt;
            credit.textContent = `${frame.dataset.title} / ${frame.dataset.credit}`;
            link.href = `Gallery.html#${frame.dataset.frame}`;
        });
    }
    image.addEventListener('load', () => {
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            image.getAnimations().forEach(animation => animation.cancel());
            image.animate([{ opacity: .72 }, { opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.16, 1, .3, 1)' });
        }
    });
});
