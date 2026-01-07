import ShipmentStatus from "@/app/server/models/ShipmentStatus";
import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
  try {
    await connectDB();
    const params = await context.params;
    const body = await req.json();
    const { name, color, emoji, description, isActive } = body;

    const status = await ShipmentStatus.findById(params.id);
    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status not found" },
        { status: 404 }
      );
    }

    // Check if new name already exists (exclude current status)
    if (name && name.trim() !== status.name) {
      const existingStatus = await ShipmentStatus.findOne({ name: name.trim() });
      if (existingStatus) {
        return NextResponse.json(
          { success: false, message: "Status name already exists" },
          { status: 400 }
        );
      }
    }

    if (name) status.name = name.trim();
    if (color) status.color = color;
    if (emoji) status.emoji = emoji;
    if (description !== undefined) status.description = description;
    if (isActive !== undefined) status.isActive = isActive;

    await status.save();
    return NextResponse.json({ success: true, status }, { status: 200 });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const params = await context.params;

    const status = await ShipmentStatus.findByIdAndDelete(params.id);
    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Status deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting shipment status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
