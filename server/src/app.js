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
import cors from 'cors'; 
import fetch from "node-fetch"
import {Server} from 'socket.io'
import cron from 'node-cron';
import { createServer } from 'http';

import config from './config.js';

const app = express();
const httpServer = createServer(app, 

  );

const {
  PORT, 
  DB_URL, 
  DB_NAME, 
  COOKIE_NAME, 
  JWT_SECRET,
  CRYPTOCOMPARE_KEY,
  COINMARKETCAP_KEY
} = config


mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: DB_NAME });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Secret key for JWT signing

app.use(bodyParser.json());
app.use(cookieParser());
const corsOptions = {
  origin: ["http://localhost:5173"], // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow only POST requests
  credentials: true,
  // exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar',"Content-Type","*"]
};
app.use(cors(corsOptions));


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
      res.json({ email: user.email });
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
      
      console.log({hashedPassword});
      // Create a new user object with hashed password
      const newUser = { email, password: hashedPassword };
  

      console.log({newUser});
      // Insert the new user into the database
      await db.collection('users').insertOne(newUser);
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Protected route - Requires JWT token for authentication


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// / Route to authenticate and return user info
app.get('/me', authenticate, async (req, res) => {
  try {
    // Get user information from the authenticated user ID
    const user = await User.findById(req.userId);
    console.log(user);
    
    // If user not found, return 404 Not Found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user info
    const responseUser = {...user};
    delete responseUser.password;
    res.status(200).json(
      {
        email: user.email,
        coins: user.coins
      }
    );
  } catch (error) {
    console.error('Error retrieving user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// / Route to authenticate and return user info
app.post('/logout', async (req, res) => {
  

    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ message: 'Successfully logged out!' });
  
});

app.post('/coins', authenticate, async (req, res) => {
  const {coins} = req.body

  console.log({coins});
  const user = await User.findById(req.userId);

  console.log({user});

  user.coins = coins
  user.save()
  delete user.password;
  res.status(200).json(user)

  
});



const io = new Server(httpServer,  { cors: { origin: 'http://localhost:5173', allowedHeaders: true, credentials: true} });

io.on('connection', (socket) => {
  console.log('User connected');
  // Listen for incoming messages
  socket.on('message', (message) => {
    console.log('Message:', message);
    // Broadcast the message to all connected clients
    io.emit('message', message);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

let user = null;
io.use(async(socket, next) => {
  // const token = socket.handshake.headers.cookie;
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjE4MGUwNDk2ZDRmNmNiMGI4YWU5ZDgiLCJpYXQiOjE3MTI4NTI1NjN9.noM-2LxXQPrGb97bIHBmcIS-ACPXKSqGeJIN81V9XEM"
  // Validate and decode the token here
  // If valid, proceed with socket connection
  jwt.verify(token, JWT_SECRET, async(err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);

    }

     user = await User.findOne({_id: decoded.userId });
    next();
  });
  next();
});


httpServer.listen(8080, () => {
  console.log(`Socket server running on port ${PORT}`);
});

async function sendMessage () {

  const coins = user.coins.join(",");


  const params = {
    start: '1',
    limit: '1', // Limiting to 1 result to get only Ethereum
    convert: 'USD', // Convert prices to USD
    sort: 'market_cap', // Sort by market cap
    sort_dir: 'desc', // Sort in descending order

  };
  const apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

  // Construct the URL with parameters
  const url = new URL(apiUrl);
  url.search = new URLSearchParams(params).toString();
  const headers = {
    Accepts: 'application/json',
    'X-CMC_PRO_API_KEY': COINMARKETCAP_KEY,
  };
  



  let marketCapRankingResponse = await fetch(apiUrl, {headers});
  marketCapRankingResponse = await marketCapRankingResponse.json()
 let marketCapData = [...user.coins];

 marketCapData = marketCapData.map(coinSym => {
  return {
    symbol: coinSym,
    rank:  marketCapRankingResponse.data.find(marketCapCoin => marketCapCoin.symbol === coinSym).cmc_rank,
    market_cap:  marketCapRankingResponse.data.find(marketCapCoin => marketCapCoin.symbol === coinSym).quote.USD.market_cap,
    volume_24h:  marketCapRankingResponse.data.find(marketCapCoin => marketCapCoin.symbol === coinSym).quote.USD.volume_24h,

  }

 })



  const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coins}&tsyms=USD&api_key=${CRYPTOCOMPARE_KEY}`);

  const data = await response.json();
  
  if (!user) {
    throw new Error('User information not found');
  }
  // console.log({ethereumPriceUSD, user});
  io.emit('message', {...data, market_cap: marketCapData});
}

cron.schedule('*/2 * * * * *', sendMessage);