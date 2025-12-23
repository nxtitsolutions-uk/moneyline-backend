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

// Ensure correct protocol behind Nginx/ALB
app.set('trust proxy', true);

// Middlewares
app.use(cors());
app.use(morgan('dev'));

// Stripe webhook must receive the raw body for signature verification
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// (Optional) Force redirect HTTP → HTTPS in production for ALL routes
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const xfProto = req.headers['x-forwarded-proto'];
    if (xfProto && xfProto !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });
}

// Base OpenAPI (no hardcoded servers)
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Money-Line',
    version: '1.0.0',
    description: 'API documentation',
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/**/*.js'], // your JSDoc annotations
};

const baseSpec = swaggerJsdoc(swaggerOptions);

// Dynamic spec: FORCE https in production
app.get('/api-docs.json', (req, res) => {
  const isProd = process.env.NODE_ENV === 'development';
  const forcedProtocol = isProd ? 'https' : null;

  const protocol = forcedProtocol || req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host'); // includes hostname:port
  const basePath = process.env.API_BASE_PATH || '/api/v1';

  const spec = {
    ...baseSpec,
    servers: [
      { url: `${protocol}://${host}${basePath}` },
      // Convenience local entry
      { url: `http://localhost:${process.env.PORT || 5000}${basePath}` },
    ],
  };
  res.json(spec);
});

// Swagger UI powered by the dynamic spec
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: '/api-docs.json' } })
);

// Health/test route
app.get('/', (_req, res) => res.send('Hello Money Line Team!'));

// Versioned API routing
app.use('/api/v1', routes);

// Connect DB + start server
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
