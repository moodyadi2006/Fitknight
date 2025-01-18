import { io } from 'socket.io-client';

// Ensure socket is only instantiated once
const socket = io("http://localhost:4000");

export default socket;