import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' 
  ? undefined 
  : 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: false, // We'll manually connect when the user logs in
});
