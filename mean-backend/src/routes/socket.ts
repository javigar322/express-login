import express from 'express'
import { Server } from 'socket.io'
const router = express.Router()
const io = new Server()

router.get('/', (_req, res) => {
	res.send('Hola desde socket')
})

io.on('connection', socket => {
	console.log('a user connected')
	socket.on('disconnect', () => {
		console.log('user disconnected')
	})
})
