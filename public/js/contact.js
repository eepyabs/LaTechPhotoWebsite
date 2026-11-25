document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');

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
