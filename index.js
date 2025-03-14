const express = require('express');
const path = require('path');

const app = express();
const PORT = 80; // Ensure proper permissions if using port 80

// Serve static files (like HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
