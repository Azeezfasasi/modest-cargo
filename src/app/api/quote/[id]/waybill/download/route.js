import { connectDB } from "@/utils/db.js";
import Quote from "@/app/server/models/Quote";
import { jsPDF } from "jspdf";
import { readFileSync } from "fs";
import { join } from "path";

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

    // Create PDF document using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const orangeColor = [220, 100, 30]; // Orange color
    const darkColor = [51, 51, 51]; // Dark gray

    // Helper function to add section header with background
    const addSectionHeader = (text, yPos) => {
      doc.setFillColor(220, 100, 30); // Orange background
      doc.rect(20, yPos - 5, pageWidth - 40, 8, "F");
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(text, 23, yPos + 1);
      doc.setTextColor(0, 0, 0); // Reset to black
      doc.setFont(undefined, "normal");
      return yPos + 12;
    };

    // Helper function to add a data row
    const addDataRow = (label, value, yPos, isBold = false) => {
      doc.setFontSize(10);
      if (isBold) doc.setFont(undefined, "bold");
      doc.text(`${label}:`, 23, yPos);
      doc.setFont(undefined, "normal");
      doc.text(value, 75, yPos);
      return yPos + 6;
    };

    // Header with decorative line
    doc.setDrawColor(220, 100, 30);
    doc.setLineWidth(1);
    doc.line(20, 15, pageWidth - 20, 15);

    // Add Logo
    try {
      const logoPath = join(process.cwd(), "public", "images", "modestlogo.png");
      const logoImage = readFileSync(logoPath);
      const logoBase64 = logoImage.toString("base64");
      doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", pageWidth / 2 - 15, 16, 30, 12);
    } catch (error) {
      console.log("Logo not found, continuing without logo");
    }

    // Title
    doc.setTextColor(220, 100, 30);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("WAYBILL", 105, 35, { align: "center" });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    // Waybill number and date in a styled box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, 40, pageWidth - 40, 12);
    doc.setFontSize(10);
    doc.text(`Waybill ID: WB-${quote._id.toString().slice(-8).toUpperCase()}`, 25, 45);
    doc.text(`${new Date(quote.createdAt).toLocaleDateString()}`, pageWidth - 55, 45);

    // Tracking Number Box - highlighted
    doc.setFillColor(220, 100, 30);
    doc.rect(20, 55, pageWidth - 40, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Tracking Number:", 23, 60);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(quote.trackingNumber || "PENDING", 23, 66);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    let yPosition = 80;

    // Status Section
    yPosition = addSectionHeader("Status", yPosition);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(220, 100, 30);
    doc.text(`${quote.status.toUpperCase()}`, 23, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    // Sender Information
    yPosition = addSectionHeader("Sender Information", yPosition);
    yPosition = addDataRow("Name", quote.fullName || quote.name, yPosition, true);
    yPosition = addDataRow("Phone", quote.phone, yPosition, true);
    yPosition = addDataRow("Address", quote.pickupLocation, yPosition, true);
    yPosition += 4;

    // Receiver Information
    yPosition = addSectionHeader("Receiver Information", yPosition);
    yPosition = addDataRow("Name", "Recipient", yPosition, true);
    yPosition = addDataRow("Phone", "To be provided", yPosition, true);
    yPosition = addDataRow("Address", quote.deliveryLocation, yPosition, true);
    yPosition += 4;

    // Shipment Details
    yPosition = addSectionHeader("Shipment Details", yPosition);
    yPosition = addDataRow("Description", quote.description || quote.cargoType || "N/A", yPosition, true);
    yPosition = addDataRow("Weight", `${quote.weight || "N/A"} kg`, yPosition, true);
    yPosition = addDataRow("Quantity", `${quote.quantity || 1} unit(s)`, yPosition, true);
    yPosition = addDataRow("Service Type", quote.serviceType || quote.service, yPosition, true);
    yPosition += 4;

    // Additional Information
    yPosition = addSectionHeader("Additional Information", yPosition);
    yPosition = addDataRow("Company", quote.company || "N/A", yPosition, true);
    yPosition = addDataRow("Email", quote.email, yPosition, true);
    yPosition = addDataRow(
      "Preferred Delivery",
      quote.preferredDeliveryDate
        ? new Date(quote.preferredDeliveryDate).toLocaleDateString()
        : "Not specified",
      yPosition, true
    );

    // Footer with decorative line
    doc.setDrawColor(220, 100, 30);
    doc.setLineWidth(1);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("This is an automated waybill generated by Modest Cargo.", 105, pageHeight - 14, {
      align: "center",
    });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, pageHeight - 10, {
      align: "center",
    });

    // Generate PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const filename = `waybill-${quote._id.toString().slice(-8)}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length,
      },
    });
  } catch (error) {
    console.error("Error generating waybill PDF:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
