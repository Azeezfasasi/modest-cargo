import ShipmentStatus from "@/app/server/models/ShipmentStatus";
import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const statuses = await ShipmentStatus.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, statuses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shipment statuses:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, color, emoji, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Status name is required" },
        { status: 400 }
      );
    }

    const existingStatus = await ShipmentStatus.findOne({ name: name.trim() });
    if (existingStatus) {
      return NextResponse.json(
        { success: false, message: "Status name already exists" },
        { status: 400 }
      );
    }

    const status = new ShipmentStatus({
      name: name.trim(),
      color: color || "gray",
      emoji: emoji || "📍",
      description: description || "",
    });

    await status.save();
    return NextResponse.json({ success: true, status }, { status: 201 });
  } catch (error) {
    console.error("Error creating shipment status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
