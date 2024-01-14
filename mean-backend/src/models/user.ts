import { Schema, model } from 'mongoose'

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 50,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		email: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
)

export default model('User', userSchema)
