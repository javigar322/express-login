import express from 'express'
import User from '../models/user'
import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.get('/', (_req, res) => {
	res.send('Hello World!')
})

router.post(
	'/signup',
	[
		body('name')
			.notEmpty()
			.withMessage('El nombre no puede estar vacío')
			.custom(async value => {
				// Verificar si el nombre ya existe en la base de datos
				const user = await User.findOne({ name: value })
				if (user) {
					throw new Error('El nombre ya existe')
				}
				return true
			}),
		body('password')
			.isLength({ min: 6 })
			.withMessage('La contraseña debe tener al menos 6 caracteres')
			.matches(/[A-Z]/)
			.withMessage('La contraseña debe contener al menos una mayúscula')
			.matches(/\d/)
			.withMessage('La contraseña debe contener al menos un número'),
	],
	async (req, res) => {
		const { name, password } = req.body
		// comprobar que no haya errores
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		// cifrar la contraseña y crear el usuario
		const passwordCifrada = cifrarPassword(password)
		try {
			const newUser = new User({ name: name, password: passwordCifrada })
			await newUser.save()
			// crear token del cliente
			const token = jwt.sign({ _id: newUser._id }, 'secretKey')
			res.status(200).json({ token })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error al crear el usuario' })
		}
	},
)

router.post('/signin', async (req, res) => {
	const { name, password } = req.body

	// Buscar el usuario por nombre
	const user = await User.findOne({ name })

	// Validar si el nombre existe
	if (!user) {
		return res.status(401).json({ message: 'El nombre no existe' })
	}

	// Validar la contraseña
	if (!user.password || !bcrypt.compareSync(password, user.password)) {
		return res.status(401).json({ message: 'Contraseña incorrecta' })
	}

	// Crear token del cliente
	const token = jwt.sign({ _id: user._id }, 'secretKey')
	return res.status(200).json({ token })
})

router.get('/tasks', (_req, res) => {
	res.json([
		{
			_id: 1,
			name: 'Task one',
			description: 'lorem ipsum',
			date: '2020-01-01T00:00:00.000Z',
		},
		{
			_id: 2,
			name: 'Task two',
			description: 'lorem ipsum',
			date: '2020-01-01T00:00:00.000Z',
		},
		{
			_id: 3,
			name: 'Task three',
			description: 'lorem ipsum',
			date: '2020-01-01T00:00:00.000Z',
		},
	])
})

router.get('/private-tasks', verifyToken, (_req, res) => {
	res.json([
		{
			_id: 1,
			name: 'Task one',
			description: 'lorem ipsum',
			date: '2020-01-01T00:00:00.000Z',
		},
		{
			_id: 2,
			name: 'Task two',
			description: 'lorem ipsum',
			date: '2020-01-01T00:00:00.000Z',
		},
		{
			_id: 3,
			name: 'Task three',
			description: 'lorem ipsum',
			date: '2020-01-01T00:00:00.000Z',
		},
	])
})

router.get('/profile', verifyToken, (_req, res) => {
	res.send('profile')
})

export default router

function verifyToken(req, res, next) {
	if (!req.headers.authorization) {
		return res.status(401).send('permiso denegado')
	}

	const token = req.headers.authorization.split(' ')[1]
	if (token === 'null') {
		return res.status(401).send('permiso denegado')
	}

	const payload = jwt.verify(token, 'secretKey') as JwtPayload
	req.userId = payload._id
	next()
}

function cifrarPassword(password: string): string {
	const salt = bcrypt.genSaltSync(10)
	const hash = bcrypt.hashSync(password, salt)
	return hash
}
