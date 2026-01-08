import { NextResponse } from 'next/server';
import { connectDB } from '@/app/server/db/connect';
import Quote from '@/app/server/models/Quote';
import Contact from '@/app/server/models/Contact';

/**
 * GET /api/notifications
 * Fetch pending notifications for logged-in user
 * Returns pending quotes and contact form responses
 */
export async function GET(req) {
  try {
    await connectDB();

    // Get pending quotes (status = 'pending')
    const pendingQuotes = await Quote.find({ 
      status: 'pending',
    })
      .select('trackingNumber fullName email status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get unreviewed contact form responses (isReplied = false or not set)
    const pendingContacts = await Contact.find({
      $or: [
        { isReplied: false },
        { isReplied: { $exists: false } }
      ]
    })
      .select('name email subject createdAt isReplied')
      .sort({ createdAt: -1 })
      .limit(10);

    const totalNotifications = pendingQuotes.length + pendingContacts.length;

    return NextResponse.json(
      {
        success: true,
        totalNotifications,
        pendingQuotes: {
          count: pendingQuotes.length,
          data: pendingQuotes,
        },
        pendingContacts: {
          count: pendingContacts.length,
          data: pendingContacts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        totalNotifications: 0,
        pendingQuotes: { count: 0, data: [] },
        pendingContacts: { count: 0, data: [] },
      },
      { status: 500 }
    );
  }
}
