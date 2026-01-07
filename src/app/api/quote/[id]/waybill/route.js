import { connectDB } from "@/utils/db.js";
import Quote from "@/app/server/models/Quote.js";

export async function GET(req, context) {
  try {
    await connectDB();

    const params = await context.params;
    const quoteId = params.id;

    // Fetch quote from database
    const quote = await Quote.findById(quoteId).populate("assignedTo");

    if (!quote) {
      return new Response(
        JSON.stringify({ success: false, message: "Quote not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate waybill data from quote
    const waybillData = {
      waybillNumber: `WB-${quote._id.toString().slice(-8).toUpperCase()}`,
      trackingNumber: quote.trackingNumber || "PENDING",
      status: quote.status,
      senderName: quote.fullName || quote.name,
      senderAddress: quote.pickupLocation,
      senderPhone: quote.phone,
      receiverName: "Recipient",
      receiverAddress: quote.deliveryLocation,
      receiverPhone: "To be provided",
      cargoDescription: quote.description || quote.cargoType,
      weight: quote.weight || 0,
      dimensions: `${quote.quantity || 1} unit(s)`,
      serviceType: quote.serviceType || quote.service,
      trackingHistory: [
        {
          status: "Quote Received",
          location: quote.pickupLocation,
          timestamp: quote.createdAt,
        },
        {
          status: `Status: ${quote.status}`,
          location: quote.deliveryLocation,
          timestamp: quote.updatedAt,
        },
      ],
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };

    return new Response(JSON.stringify({ success: true, data: waybillData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching waybill:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
