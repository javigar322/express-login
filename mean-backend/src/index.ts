import express from 'express'
import cors from 'cors'
import User from './models/user'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import mainRouter from './routes/index'
import userRouter from './routes/userRoute'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// middlewares
app.use(cors())
app.use(express.json())

// Database connection
require('./database')

// routes
app.use('/api', mainRouter)
app.use('/user', userRouter)

// socket.io
interface ExtendedSocket extends Socket {
	user: {
		_id: string
		name: string
	}
}

io.use(async (socket: any, next) => {
	const extendedSocket = socket as ExtendedSocket
	const token = extendedSocket.handshake.auth.token.split(' ')[1]
	if (token) {
		const payload = jwt.verify(token, 'secretKey') as JwtPayload
		const user = await User.findById(payload._id)
		if (!user) {
			return next(new Error('user not found'))
		}
		extendedSocket.user = { _id: user._id.toString(), name: user.name }
		next()
	} else {
		next(new Error('invalid token'))
	}
})

io.on('connection', (socket: any) => {
	console.log(`el usuario ${socket.user.name} se ha conectado`)
	socket.on('disconnect', () => {
		console.log('user disconnected')
	})
})

// iniciar servidor
httpServer.listen(3000)
console.log(' server on port', 3000)
