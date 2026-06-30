const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 1001;
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProduction) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

// Connect to DB once
connectDB();

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  }
}));

// Routes
const authRouter = require('./api/auth');
const ocrRouter = require('./api/ocr');
const visitorsRouter = require('./api/visitors');
const sessionRouter = require('./api/session');
app.use('/api/auth', authRouter);
app.use('/api/auth', sessionRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/visitors', visitorsRouter);

// Protected route

// Session-based authentication removed
// All routes are now public or should use token-based auth

app.get('/api/dashboard', (req, res) => {
  res.json({ message: 'Welcome to the dashboard (no session)' });
});


app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed.' });
    }
    res.clearCookie('connect.sid', {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    }); // Default session cookie name
    res.json({ success: true, message: 'Logged out' });
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Express server is running!' });
});



app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});