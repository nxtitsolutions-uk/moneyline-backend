const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db.js');
const routes = require('./routes');

const app = express();

// Trust proxy so req.protocol is correct behind Nginx/ALB
app.set('trust proxy', true);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(cors());
app.use(morgan('dev'));

// Base OpenAPI (without hardcoded servers)
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
  apis: ['./routes/**/*.js'], // your JSDoc annotations
};

const baseSpec = swaggerJsdoc(swaggerOptions);

/**
 * Serve a dynamic spec that injects the correct server URL based on request.
 * Examples:
 *  - http://localhost:4500/api/v1
 *  - https://api.moneylineonly.com/api/v1
 */
app.get('/api-docs.json', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host'); // includes hostname:port if any
  const basePath = process.env.API_BASE_PATH || '/api/v1';

  const spec = {
    ...baseSpec,
    servers: [
      { url: `${protocol}://${host}${basePath}` },
      // Optional: include a static localhost entry for convenience
      { url: `http://localhost:${process.env.PORT || 5000}${basePath}` },
    ],
  };
  res.json(spec);
});

// Swagger UI that fetches the dynamic spec above
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: '/api-docs.json' } })
);

// Test route
app.get('/', (_req, res) => res.send('Hello Money Line Team!'));

// Versioned API routing
app.use('/api/v1', routes);

// DB + Server
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
