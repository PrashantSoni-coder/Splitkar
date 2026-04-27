require('dotenv').config();
const express        = require('express');
const path           = require('path');
const morgan         = require('morgan');
const helmet         = require('helmet');
const compression    = require('compression');
const session        = require('express-session');
const MongoStore     = require('connect-mongo');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const connectDB       = require('./config/db');
const authRoutes      = require('./routes/authRoutes');
const groupRoutes     = require('./routes/groupRoutes');
const expenseRoutes   = require('./routes/expenseRoutes');
const activityRoutes  = require('./routes/activityRoutes');
const errorHandler    = require('./middleware/errorHandler');
const notFound        = require('./middleware/notFound');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

connectDB();

// ── Security headers ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      scriptSrc:   ["'self'"],
      imgSrc:      ["'self'", "data:"],
      connectSrc:  ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// ── Performance ──
app.use(compression());

// ── Global rate limit ──
app.use(globalLimiter);

// ── Logging ──
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Body parsing ──
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Method override ──
app.use(methodOverride('_method'));

// ── Static files ──
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0
}));

// ── View engine ──
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// ── Session ──
app.use(session({
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  store:             MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   1000 * 60 * 60 * 24 * 7
  },
  name: 'sk.sid'
}));

// ── Flash ──
app.use(flash());

// ── Global locals ──
app.use((req, res, next) => {
  res.locals.user    = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  next();
});

// ── Routes ──
app.use('/',         authRoutes);
app.use('/groups',   groupRoutes);
app.use('/expenses', expenseRoutes);
app.use('/activity', activityRoutes);

// ── 404 ──
app.use(notFound);

// ── Error handler ──
app.use(errorHandler);

module.exports = app;
