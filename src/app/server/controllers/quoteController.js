import Quote, { generateTrackingNumber } from "../models/Quote";
import { connectDB } from "../db/connect";
import User from "../models/User";
import { NextResponse } from "next/server";
import {
  sendQuoteCreatedEmail,
  sendQuoteUpdatedEmail,
  sendQuoteDeletedEmail,
  sendQuoteStatusChangedEmail,
  sendQuoteReplyEmail,
  sendQuoteAssignedEmail,
  sendQuoteEditedEmail,
} from "../services/emailService";

// 1. Create quote request
export const createQuote = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    
    // Generate tracking number
    let trackingNumber;
    let isUnique = false;
    while (!isUnique) {
      trackingNumber = generateTrackingNumber();
      const existingQuote = await Quote.findOne({ trackingNumber });
      if (!existingQuote) {
        isUnique = true;
      }
    }
    
    const quote = new Quote({ ...body, trackingNumber });
    await quote.save();
    
    // Send email notification (non-blocking)
    try {
      await sendQuoteCreatedEmail(quote);
    } catch (emailError) {
      console.error('Email notification failed for quote creation:', emailError.message);
      // Don't fail the request, just log the error
    }
    
    return NextResponse.json({ success: true, quote }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 2. Get all quote requests (admin/staff only)
export const getAllQuotes = async (req) => {
  try {
    await connectDB();
    const quotes = await Quote.find().populate("assignedTo", "firstName lastName email role").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, quotes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 3. Edit quote request
export const updateQuote = async (req, quoteId) => {
  try {
    await connectDB();
    const body = await req.json();
    
    // Get the old quote for comparison
    const oldQuote = await Quote.findById(quoteId);
    if (!oldQuote) return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    
    const quote = await Quote.findByIdAndUpdate(quoteId, body, { new: true });
    
    // Identify changed fields
    const changedFields = {};
    Object.keys(body).forEach(key => {
      if (oldQuote[key] !== body[key] && key !== 'trackingNumber') {
        changedFields[key] = body[key];
      }
    });
    
    // Send email notification if there are changes (non-blocking)
    if (Object.keys(changedFields).length > 0) {
      try {
        await sendQuoteEditedEmail(quote, changedFields);
      } catch (emailError) {
        console.error('Email notification failed for quote edit:', emailError.message);
        // Don't fail the request, just log the error
      }
    }
    
    return NextResponse.json({ success: true, quote }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 4. Delete quote request
export const deleteQuote = async (req, quoteId) => {
  try {
    await connectDB();
    const quote = await Quote.findByIdAndDelete(quoteId);
    if (!quote) return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    
    // Send email notification (non-blocking)
    try {
      await sendQuoteDeletedEmail(quote);
    } catch (emailError) {
      console.error('Email notification failed for quote deletion:', emailError.message);
      // Don't fail the request, just log the error
    }
    
    return NextResponse.json({ success: true, message: "Quote deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 5. Change quote request status
export const changeQuoteStatus = async (body, quoteId) => {
  try {
    await connectDB();
    const { status } = body;
    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
    }
    const quote = await Quote.findById(quoteId);
    if (!quote) return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    
    const oldStatus = quote.status;
    quote.status = status;
    await quote.save();
    
    // Send email notification (non-blocking)
    try {
      await sendQuoteStatusChangedEmail(quote, oldStatus, status);
    } catch (emailError) {
      console.error('Email notification failed for status change:', emailError.message);
      // Don't fail the request, just log the error
    }
    
    return NextResponse.json({ success: true, quote }, { status: 200 });
  } catch (error) {
    console.error("Error changing quote status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 6. Reply to quote request
export const replyToQuote = async (body, quoteId) => {
  try {
    await connectDB();
    const { message, senderId } = body;
    // Validate senderId exists and is admin or staff
    const sender = await User.findById(senderId);
    if (!sender) {
      return NextResponse.json({ success: false, message: "Sender not found" }, { status: 400 });
    }
    if (sender.role !== 'admin' && sender.role !== 'staff-member') {
      return NextResponse.json({ success: false, message: "Sender is not authorized to reply (must be admin or staff-member)" }, { status: 403 });
    }
    const quote = await Quote.findById(quoteId);
    if (!quote) return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    quote.replies.push({ sender: senderId, senderName: sender.firstName + ' ' + sender.lastName, message });
    quote.status = "quoted";
    await quote.save();
    
    // Send email notification (non-blocking)
    const senderName = `${sender.firstName} ${sender.lastName}`;
    try {
      await sendQuoteReplyEmail(quote, { message }, senderName);
    } catch (emailError) {
      console.error('Email notification failed for quote reply:', emailError.message);
      // Don't fail the request, just log the error
    }
    
    return NextResponse.json({ success: true, quote }, { status: 200 });
  } catch (error) {
    console.error("Error replying to quote:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 7. Assign quote request to admin/staff
export const assignQuote = async (body, quoteId) => {
  try {
    await connectDB();
    const { assignedUserId } = body;
    const quote = await Quote.findById(quoteId);
    if (!quote) return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    
    if (!assignedUserId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    quote.assignedTo = assignedUserId;
    await quote.save();
    
    // Populate the assignedTo field to return user details
    await quote.populate('assignedTo', 'firstName lastName email role');
    
    // Send email notification to assigned staff member (non-blocking)
    const assignedStaff = quote.assignedTo;
    try {
      await sendQuoteAssignedEmail(quote, assignedStaff);
    } catch (emailError) {
      console.error('Email notification failed for quote assignment:', emailError.message);
      // Don't fail the request, just log the error
    }
    
    return NextResponse.json({ success: true, quote, message: `Quote assigned to ${quote.assignedTo?.firstName || 'user'}` }, { status: 200 });
  } catch (error) {
    console.error("Error assigning quote:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
