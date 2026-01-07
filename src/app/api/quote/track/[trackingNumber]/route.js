import { connectDB } from "@/utils/db.js";
import Quote from "@/app/server/models/Quote";

export async function GET(req, context) {
  try {
    await connectDB();

    const params = await context.params;
    const trackingNumber = params.trackingNumber?.toUpperCase();

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tracking number is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find quote by tracking number
    const quote = await Quote.findOne({ trackingNumber }).populate("assignedTo");

    if (!quote) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Shipment not found with this tracking number",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build status history from the quote's status changes
    let statusHistory = [];
    
    if (quote.statusHistory && quote.statusHistory.length > 0) {
      statusHistory = quote.statusHistory;
    } else {
      // If no history exists, create a basic history from the current status
      statusHistory = [
        {
          status: quote.status,
          timestamp: quote.createdAt,
          notes: "Shipment created",
        },
      ];
    }

    // Return shipment data
    return new Response(
      JSON.stringify({
        success: true,
        shipment: {
          _id: quote._id,
          trackingNumber: quote.trackingNumber,
          fullName: quote.fullName || quote.name,
          email: quote.email,
          phone: quote.phone,
          company: quote.company,
          pickupLocation: quote.pickupLocation,
          deliveryLocation: quote.deliveryLocation,
          serviceType: quote.serviceType || quote.service,
          description: quote.description || quote.cargoType,
          weight: quote.weight,
          quantity: quote.quantity,
          preferredDeliveryDate: quote.preferredDeliveryDate,
          status: quote.status,
          createdAt: quote.createdAt,
          statusHistory: statusHistory,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error tracking shipment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to track shipment",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
