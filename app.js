const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to generate random ID
function generateShortId() {
    return Math.random().toString(36).substring(2, 8);
}

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create a short URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const shortId = generateShortId();
    const urlDatabase = JSON.parse(fs.readFileSync('url.json', 'utf8'));
    
    urlDatabase[shortId] = longUrl;
    fs.writeFileSync('url.json', JSON.stringify(urlDatabase, null, 2));

    const shortUrl = `http://localhost:${port}/${shortId}`;
    res.json({ shortUrl });
});

// Redirect to original URL
app.get('/:id', (req, res) => {
    const shortId = req.params.id;
    const urlDatabase = JSON.parse(fs.readFileSync('url.json', 'utf8'));
    const longUrl = urlDatabase[shortId];

    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).send('URL not found');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
