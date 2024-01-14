import mongoose from 'mongoose'
async function connectToDatabase() {
	try {
		await mongoose.connect('mongodb://localhost:27017/angular', {})
		console.log('Connected to database')
	} catch (error) {
		console.error('Not connected to database', error)
	}
}

connectToDatabase()
