import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const dbUri = `${process.env.MONGODB_URI as string}/${process.env.DB_NAME as string}`
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error(`MongoDB connection failed: ${error}`)
    }
}

export default connectDB
