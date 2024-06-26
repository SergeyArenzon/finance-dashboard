import jwt from 'jsonwebtoken';
import 'dotenv/config';
import config from '../config.js';


const {
    COOKIE_NAME,
    JWT_SECRET
} = config




const authenticate = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        res.clearCookie(COOKIE_NAME);
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // Optionally, check if token is expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ message: 'Token expired' });
      }
  
      req.userId = decoded.userId;
      next();
    });
  };
  

  export default authenticate;