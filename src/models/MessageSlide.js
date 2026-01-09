import mongoose from 'mongoose'

const messageSlideSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      maxlength: [300, 'Message cannot be more than 300 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.MessageSlide ||
  mongoose.model('MessageSlide', messageSlideSchema)
