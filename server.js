// server.js
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db.js');
const routes = require('./routes');
const stripeController = require('./controllers/stripeController');

const app = express();

/**
 * ===============================
 * Trust proxy (Nginx / ALB)
 * ===============================
 */
app.set('trust proxy', true);

/**
 * ===============================
 * CORS (Swagger-safe)
 * ===============================
 */
app.use(
  cors({
    origin: true, // allow same-origin + swagger
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * ===============================
 * Logging
 * ===============================
 */
app.use(morgan('dev'));

/**
 * ===============================
 * Stripe Webhook (RAW body)
 * ===============================
 */
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

/**
 * ===============================
 * Body Parsers
 * ===============================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ===============================
 * Force HTTPS (PRODUCTION ONLY)
 * ===============================
 */
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });
}

/**
 * ===============================
 * Swagger Base Definition
 * ===============================
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Money-Line',
    version: '1.0.0',
    description: 'API documentation',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/**/*.js'],
};

const baseSpec = swaggerJsdoc(swaggerOptions);

/**
 * ===============================
 * Dynamic Swagger Spec (HTTPS-safe)
 * ===============================
 */
app.get('/api-docs.json', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';

  const protocol = isProd
    ? 'https'
    : req.headers['x-forwarded-proto'] || req.protocol;

  const host = req.get('host');
  const basePath = process.env.API_BASE_PATH || '/api/v1';

  res.json({
    ...baseSpec,
    servers: [
      { url: `${protocol}://${host}${basePath}` },
      { url: `http://localhost:${process.env.PORT || 5000}${basePath}` },
    ],
  });
});

/**
 * ===============================
 * Swagger UI
 * ===============================
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: '/api-docs.json',
    },
  })
);

/**
 * ===============================
 * Routes
 * ===============================
 */
app.get('/', (_req, res) => res.send('Hello Money Line Team!'));
app.use('/api/v1', routes);

/**
 * ===============================
 * Start Server
 * ===============================
 */
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
