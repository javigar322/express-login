import express from 'express'
import User from '../models/user'
import { body, validationResult } from 'express-validator'
const router = express.Router()

// obtener una lista de todos los usuarios
router.get('/', async (_req, res) => {
	try {
		const userList = await User.find()
		res.json({ userList })
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener la lista de usuarios' })
	}
})

// encontrar usuario por el id
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const user = await User.findById(id)
		res.json({ user })
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener el usuario' })
	}
})

// actualizar usuario
router.put(
	'/:id',
	[
		body('name')
			.isLength({ min: 3, max: 50 })
			.withMessage('El nombre debe tener entre 3 y 50 caracteres')
			.custom(async value => {
				// Verificar si el nombre ya existe en la base de datos
				const user = await User.findOne({ name: value })
				if (user) {
					throw new Error('El nombre ya existe')
				}
				return true
			}),
		body('email').isEmail().withMessage('El email no es válido'),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		try {
			const { id } = req.params
			const newUser = req.body
			const findUser = await User.findById(id)
			if (!findUser) return res.status(401).send('el usuario no existe')
			await User.updateOne(
				{ _id: id },
				{
					$set: {
						name: newUser.name,
						password: newUser.password,
						email: newUser.email,
					},
				},
			)
			return res.json({ status: 'Usuario actualizado' })
		} catch (error) {
			return res.status(500).json({ error: 'Error al actualizar el usuario' })
		}
	},
)

// eliminar usuario
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params
		await User.findByIdAndDelete(id)
		return res.json({ status: 'Usuario eliminado' })
	} catch (error) {
		return res.status(500).json({ error: 'Error al eliminar el usuario' })
	}
})

export default router
