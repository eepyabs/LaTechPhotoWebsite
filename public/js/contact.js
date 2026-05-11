document.addEventListener('DOMContentLoaded', async () => {
    const backdrop = document.querySelector('[data-contact-backdrop]');
    const form = document.getElementById('contact-form');

    if (backdrop) {
        try {
            const response = await fetch('/gallery-data');
            const images = await response.json();
            const selected = images.sort(() => Math.random() - 0.5).slice(0, 4);

            backdrop.innerHTML = selected.map((image, index) => `
                <img src="${image.preview}" alt="" class="${index === 0 ? 'is-active' : ''}">
            `).join('');

            const slides = [...backdrop.querySelectorAll('img')];
            let current = 0;
            if (slides.length > 1) {
                setInterval(() => {
                    slides[current].classList.remove('is-active');
                    current = (current + 1) % slides.length;
                    slides[current].classList.add('is-active');
                }, 4500);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (form) {
        form.addEventListener('submit', event => {
            event.preventDefault();

            const formData = new FormData(form);
            const subject = encodeURIComponent(`Contact Form Submission: ${formData.get('reason')}`);
            const body = encodeURIComponent([
                `Name: ${formData.get('name')}`,
                `Email: ${formData.get('email')}`,
                `Reason: ${formData.get('reason')}`,
                '',
                formData.get('message')
            ].join('\n'));

            window.location.href = `mailto:general.latechphotoclub@gmail.com?subject=${subject}&body=${body}`;
        });
    }
});
