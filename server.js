const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example endpoint for contact form submission
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Contact form submitted: Name: ${name} | Email: ${email} | Message: ${message}`);
  res.json({ success: true, message: 'Thank you for contacting us.' });
});

// Serve static files from "public" directory
app.use(express.static('public'));

// WebSocket connection for live updates
io.on('connection', (
