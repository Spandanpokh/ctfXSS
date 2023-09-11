const express = require('express');
const multer = require('multer');
const xss = require('xss'); // Import the xss library

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage(); // Store uploaded files in memory
const upload = multer({ storage: storage });

let uploadedImage = null;
let uploadedName = null;

// Function to escape HTML special characters
function escapeHTML(html) {
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/upload', upload.single('profilePic'), (req, res) => {
    // Get the original filename
    const originalFilename = req.file.originalname;

    // Serve the uploaded image with the original filename
    uploadedImage = req.file.buffer;
    uploadedName = escapeHTML(req.body.name); // Sanitize the "Name" input
    const xssPayload = `<img src=x onerror=alert('XSS')>`;
    const filename = originalFilename.includes(xssPayload) ? xssPayload : originalFilename;
    
    // Display the sanitized name and the image with the chosen filename
    res.send(`Name: ${uploadedName}<br>Filename: ${filename}<br><img src="/getimage" alt="${uploadedName}" filename="${filename}">`);
});

app.get('/getimage', (req, res) => {
    // Serve the uploaded image with appropriate caching headers
    if (uploadedImage) {
        res.setHeader('Content-Type', 'image/png'); // Set the Content-Type for the image
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Set caching headers for 1 year
        res.end(uploadedImage);
    } else {
        res.send('No image uploaded.');
    }
});

app.get('/getname', (req, res) => {
    // Serve the sanitized uploaded name when requested
    if (uploadedName) {
        res.send(`Name: ${uploadedName}`);
    } else {
        res.send('No name provided.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
