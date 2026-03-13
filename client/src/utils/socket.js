import { io } from 'socket.io-client'

// Use environment variable or fallback to localhost
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000')

export default socket
