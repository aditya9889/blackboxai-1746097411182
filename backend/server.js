const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key_here';

app.use(cors());
app.use(bodyParser.json());

// In-memory data stores
let users = [];
let listings = [];
let bookings = [];

// Helper functions
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });
    req.user = user;
    next();
  });
}

// Routes

// User registration
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, email, password: hashedPassword };
  users.push(newUser);
  const token = generateToken(newUser);
  res.json({ token });
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid password' });
  const token = generateToken(user);
  res.json({ token });
});

// Get all listings
app.get('/api/listings', (req, res) => {
  res.json(listings);
});

// Get listing by id
app.get('/api/listings/:id', (req, res) => {
  const listing = listings.find(l => l.id === parseInt(req.params.id));
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json(listing);
});

// Create a new listing (authenticated)
app.post('/api/listings', authenticateToken, (req, res) => {
  const { title, description, price, location, image } = req.body;
  const newListing = {
    id: listings.length + 1,
    title,
    description,
    price,
    location,
    image,
    ownerId: req.user.id
  };
  listings.push(newListing);
  res.status(201).json(newListing);
});

// Create a booking (authenticated)
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { listingId, startDate, endDate } = req.body;
  const listing = listings.find(l => l.id === listingId);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  const newBooking = {
    id: bookings.length + 1,
    listingId,
    userId: req.user.id,
    startDate,
    endDate
  };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// Get bookings for logged-in user
app.get('/api/bookings', authenticateToken, (req, res) => {
  const userBookings = bookings.filter(b => b.userId === req.user.id);
  res.json(userBookings);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
