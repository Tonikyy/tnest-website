import mongoose from 'mongoose'

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['salon', 'spa', 'medical', 'fitness', 'other'],
  },
}, {
  timestamps: true,
})

export const Business = mongoose.models.Business || mongoose.model('Business', businessSchema) 