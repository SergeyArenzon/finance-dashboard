const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 5001;
const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'financial_dashboard';
const COOKIE_NAME = 'auth_token';




// Middleware to check JWT or cookie for authentication
const authenticate = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME] || req.headers['authorization'];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.userId = decoded.userId;
      next();
    });
  };
  



let db;

// Connect to MongoDB
MongoClient.connect(DB_URL, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(err => console.error('Error connecting to MongoDB', err));


// Secret key for JWT signing
const JWT_SECRET = 'your_jwt_secret';

app.use(bodyParser.json());

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await db.collection('users').findOne({ username, password });
      if (user) {
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.cookie(COOKIE_NAME, token, { httpOnly: true });
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
      const existingUser = await db.collection('users').findOne({ username });
      if (existingUser) {
        res.status(400).json({ message: 'Username already exists' });
      } else {
        const newUser = { username, password };
        await db.collection('users').insertOne(newUser);
        res.status(201).json({ message: 'User created successfully', user: newUser });
      }
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Protected route - Requires JWT token for authentication
app.get('/protected', authenticate, (req, res) => {
  // If the token is verified, return a message with the user id
  res.json({ message: `Protected route accessed by user ${req.userId}` });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});