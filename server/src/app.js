import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import authenticate  from './middlewares/auth.js';
import bcrypt from 'bcrypt'
import 'dotenv/config';
import mongoose from "mongoose";
import User from './models/user.js';



const app = express();

const {
    PORT, 
    DB_URL, 
    DB_NAME, 
    COOKIE_NAME, 
    JWT_SECRET
} = process.env

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Secret key for JWT signing

app.use(bodyParser.json());
app.use(cookieParser());


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
  
      // If user not found, return 401 Unauthorized
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      // If passwords don't match, return 401 Unauthorized
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  
      // Set the JWT token in a cookie
      res.cookie(COOKIE_NAME, token, { httpOnly: true });
  
      // Return success message
      res.json({ message: 'Login successful' });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the email already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'email already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Create a new user object with hashed password
      const newUser = { email, password: hashedPassword };
  
      // Insert the new user into the database
      await db.collection('users').insertOne(newUser);
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
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
