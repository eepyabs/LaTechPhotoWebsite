document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('[data-events-list]');
    if (!container) return;

    try {
        const response = await fetch('/data/events.json');
        const events = await response.json();

        container.innerHTML = events.map(event => `
            <article class="event-card">
                <p class="role">${event.date}</p>
                <h3>${event.title}</h3>
                <p><strong>Location:</strong> ${event.location}</p>
                <p>${event.description}</p>
            </article>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="empty-state">Events could not be loaded.</p>';
        console.error(error);
    }
});
