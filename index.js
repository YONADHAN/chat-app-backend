import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()

const FRONTEND_URL = process.env.FRONTEND_URL

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  }),
)

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server running')
})

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', socket.id)
  })

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', offer)
  })

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', answer)
  })

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', candidate)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
