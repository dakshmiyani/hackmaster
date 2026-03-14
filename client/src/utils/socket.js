import { io } from 'socket.io-client'

// Use environment variable or fallback to localhost
const socket = io(import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000')

export default socket
