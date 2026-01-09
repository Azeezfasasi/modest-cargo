import { connectDB } from '@/utils/db'
import MessageSlide from '@/models/MessageSlide'

// UPDATE message
export async function PUT(req, { params }) {
  try {
    await connectDB()

    const { id } = params
    const body = await req.json()
    const { message, isActive, order } = body

    const updatedMessage = await MessageSlide.findByIdAndUpdate(
      id,
      {
        message,
        isActive,
        order,
      },
      { new: true }
    )

    if (!updatedMessage) {
      return Response.json(
        {
          success: false,
          error: 'Message not found',
        },
        { status: 404 }
      )
    }

    return Response.json(
      {
        success: true,
        data: updatedMessage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating message:', error)
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE message
export async function DELETE(req, { params }) {
  try {
    await connectDB()

    const { id } = params

    const deletedMessage = await MessageSlide.findByIdAndDelete(id)

    if (!deletedMessage) {
      return Response.json(
        {
          success: false,
          error: 'Message not found',
        },
        { status: 404 }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'Message deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting message:', error)
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
