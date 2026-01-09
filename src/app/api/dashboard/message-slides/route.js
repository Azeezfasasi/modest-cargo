import { connectDB } from '@/utils/db'
import MessageSlide from '@/models/MessageSlide'

// GET all messages (including inactive)
export async function GET(req) {
  try {
    await connectDB()

    const messages = await MessageSlide.find().sort({ order: 1 }).lean()

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

// CREATE new message
export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()
    const { message, order } = body

    if (!message) {
      return Response.json(
        {
          success: false,
          error: 'Message is required',
        },
        { status: 400 }
      )
    }

    const newMessage = new MessageSlide({
      message,
      order: order || 0,
      isActive: true,
    })

    await newMessage.save()

    return Response.json(
      {
        success: true,
        data: newMessage,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating message:', error)
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
