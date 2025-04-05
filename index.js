const express = require('express');
const path = require('path');

const app = express();
const PORT = 80; // Ensure proper permissions if using port 80

// Serve static files (like HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/previews', express.static(path.join(__dirname, 'public', 'previews')));


// use the gallery data route
const galleryDataRoute = require('./gallery-data');
app.use('/gallery-data', galleryDataRoute);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
