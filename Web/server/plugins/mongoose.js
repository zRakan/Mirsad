import mongoose from 'mongoose';

export default async function() {
    try {
      await mongoose.connect('mongodb://localhost:27017/mersad');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
    }
}