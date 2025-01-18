import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);
let socketsConnected = new Set();

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // auth: (socket, next) => {
  //   const token = socket.handshake.auth.token;
  //   if (token) {
  //     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //       if (err) {
  //         return next(new Error("Authentication error"));
  //       }
  //       socket.user = decoded;  // Attach user to socket
  //       next();
  //     });
  //   } else {
  //     next(new Error("Authentication error"));
  //   }
  // },
});

// Socket.IO connection setup
io.on('connection', (socket) => {
  console.log('Socket connected: ', socket.id);
  socketsConnected.add(socket.id);

  io.emit('activeMembers', socketsConnected.size);

  //Listen for incoming chat messages
  socket.on('chatMessage', (message) => {
    console.log('Received message: ', message);

    // Broadcast the message to all clients
    io.emit('chatMessage', message); // This sends the message to all clients
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
    socketsConnected.delete(socket.id);
    io.emit('activeMembers', socketsConnected.size);
  });
});

httpServer.listen(4000, () => {
  console.log('Socket Server is running on port 4000');
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: '20kb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '20kb',
  }),
);

app.use(express.static('public'));

app.use(cookieParser());

// Import routes
import userRoutes from './routes/user.routes.js';
import groupRoutes from './routes/group.routes.js';
import messageRoutes from './routes/message.routes.js';
import mapRoutes from './routes/maps.routes.js';
import buddyRoutes from './routes/buddies.routes.js';

app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/messages', messageRoutes);
app.use('/maps', mapRoutes);
app.use('/buddies', buddyRoutes);


export { app };
