const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3002;

// Enable CORS for all routes with specific origin
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,  // enable credentials, such as cookies
};
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'REST API with Socket.io',
      version: '1.0.0',
      description: 'Documentation for the REST API and Socket.io server',
    },
  },
  apis: ['server.js'], // Specify the file where your routes are defined
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Enable CORS for Swagger documentation route
app.use('/api-docs', cors(corsOptions), swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sample data
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
];

// Sample sports matches data
const matches = [
  { id: 1, team1: 'Team A', team2: 'Team B', score: '0-0' },
  { id: 2, team1: 'Team C', team2: 'Team D', score: '1-2' },
];

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get a list of users
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
app.get('/api/users', (req, res) => {
  res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       404:
 *         description: User not found
 */
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Add a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Add a new sports match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team1:
 *                 type: string
 *               team2:
 *                 type: string
 *               score:
 *                 type: string
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 team1:
 *                   type: string
 *                 team2:
 *                   type: string
 *                 score:
 *                   type: string
 */
app.post('/api/matches', (req, res) => {
  const newMatch = req.body;
  matches.push(newMatch);

  // Send the new match to connected clients via Socket.io
  io.emit('newMatch', newMatch);

  res.status(201).json(newMatch);
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Socket.io server logic
io.on('connection', (socket) => {
  console.log('A client connected');

  // You can add more Socket.io event handlers here

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
