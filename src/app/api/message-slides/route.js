import { connectDB } from '@/utils/db'
import MessageSlide from '@/models/MessageSlide'

export async function GET(req) {
  try {
    await connectDB()

    const messages = await MessageSlide.find({ isActive: true })
      .sort({ order: 1 })
      .lean()

    return Response.json(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching messages:', error)
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
