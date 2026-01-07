# Waybill Backend Integration Guide

## Overview

This guide provides instructions for integrating waybill generation and download functionality with your backend API.

## Required API Endpoints

### 1. Get Waybill Data

**Endpoint:** `GET /api/quote/:id/waybill`

**Response Format:**

```json
{
  "success": true,
  "waybill": {
    "waybillNumber": "WB-2024-001-12345",
    "date": "2024-01-07T10:30:00Z",
    "shipperName": "John Doe",
    "shipperCompany": "Acme Corp",
    "shipperEmail": "john@acme.com",
    "shipperPhone": "+1234567890",
    "serviceType": "Air Freight",
    "cargoType": "Electronics",
    "weight": 100,
    "quantity": 5,
    "pickupLocation": "New York, NY, USA",
    "deliveryLocation": "Lagos, Nigeria",
    "description": "Electronics shipment",
    "status": "In Transit",
    "preferredDeliveryDate": "2024-01-15T00:00:00Z"
  }
}
```

### 2. Download Waybill PDF

**Endpoint:** `GET /api/quote/:id/waybill/download`

**Response:** Binary PDF file

## Backend Implementation

### Option 1: Using Node.js/Express with PDFKit (Recommended)

Install required packages:

```bash
npm install pdfkit
```

Create a new file: `src/app/api/quote/[id]/waybill/route.js`

```javascript
import { connectDB } from "@/server/db";
import Quote from "@/server/models/Quote";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const quote = await Quote.findById(id).populate("assignedTo");
    if (!quote) {
      return NextResponse.json(
        { success: false, message: "Quote not found" },
        { status: 404 }
      );
    }

    // Generate waybill number (you can customize this logic)
    const waybillNumber = `WB-${new Date().getFullYear()}-${quote._id
      .toString()
      .slice(-6)
      .toUpperCase()}`;

    const waybill = {
      waybillNumber,
      date: quote.createdAt,
      shipperName: quote.fullName || quote.name,
      shipperCompany: quote.company,
      shipperEmail: quote.email,
      shipperPhone: quote.phone,
      serviceType: quote.serviceType,
      cargoType: quote.cargoType,
      weight: quote.weight,
      quantity: quote.quantity,
      pickupLocation: quote.pickupLocation,
      deliveryLocation: quote.deliveryLocation,
      description: quote.description,
      status: quote.status,
      preferredDeliveryDate: quote.preferredDeliveryDate,
    };

    return NextResponse.json({
      success: true,
      waybill,
    });
  } catch (error) {
    console.error("Error fetching waybill:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch waybill" },
      { status: 500 }
    );
  }
}
```

Create another file: `src/app/api/quote/[id]/waybill/download/route.js`

```javascript
import { connectDB } from "@/server/db";
import Quote from "@/server/models/Quote";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const quote = await Quote.findById(id).populate("assignedTo");
    if (!quote) {
      return NextResponse.json(
        { success: false, message: "Quote not found" },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new PDFDocument();
    const waybillNumber = `WB-${new Date().getFullYear()}-${quote._id
      .toString()
      .slice(-6)
      .toUpperCase()}`;

    // Set response headers
    const filename = `waybill-${quote._id}.pdf`;
    const response = new NextResponse(doc);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // Add content to PDF
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("MODEST CARGO", { align: "left" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("International Shipping & Logistics", { align: "left" });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Header info
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("SHIPMENT WAYBILL", { align: "center" });
    doc.moveDown();

    // Waybill number and date
    doc.fontSize(10).font("Helvetica");
    doc.text(`Waybill #: ${waybillNumber}`, 50, doc.y);
    doc.text(
      `Date: ${new Date(quote.createdAt).toLocaleDateString()}`,
      400,
      doc.y - 18
    );
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Shipper Information
    doc.fontSize(11).font("Helvetica-Bold").text("SHIPPER INFORMATION", 50);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${quote.fullName || quote.name}`);
    doc.text(`Company: ${quote.company}`);
    doc.text(`Email: ${quote.email}`);
    doc.text(`Phone: ${quote.phone}`);
    doc.moveDown();

    // Shipment Details
    doc.fontSize(11).font("Helvetica-Bold").text("SHIPMENT DETAILS", 50);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Service Type: ${quote.serviceType}`);
    doc.text(`Cargo Type: ${quote.cargoType}`);
    doc.text(`Weight: ${quote.weight} kg`);
    doc.text(`Quantity: ${quote.quantity} units`);
    doc.moveDown();

    // Location Information
    doc.fontSize(11).font("Helvetica-Bold").text("LOCATION INFORMATION", 50);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Pickup: ${quote.pickupLocation}`);
    doc.text(`Delivery: ${quote.deliveryLocation}`);
    doc.moveDown();

    // Description
    if (quote.description) {
      doc.fontSize(11).font("Helvetica-Bold").text("DESCRIPTION OF GOODS", 50);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(quote.description, 50, doc.y, { width: 450 });
      doc.moveDown();
    }

    // Status and Date
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(10).font("Helvetica").text(`Status: ${quote.status}`);
    if (quote.preferredDeliveryDate) {
      doc.text(
        `Preferred Delivery: ${new Date(
          quote.preferredDeliveryDate
        ).toLocaleDateString()}`
      );
    }
    doc.moveDown(2);

    // Footer
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is an official Modest Cargo waybill. Please keep for your records.",
        50,
        doc.y + 10,
        { align: "center", width: 500 }
      );

    // Finalize PDF
    doc.end();
    doc.pipe(response);

    return response;
  } catch (error) {
    console.error("Error generating waybill PDF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate waybill" },
      { status: 500 }
    );
  }
}
```

## Installation Instructions

1. **Install PDFKit:**

```bash
npm install pdfkit
```

2. **Create the API route files** in your Next.js API directory as shown above.

3. **Test the endpoints:**
   - View waybill: `http://localhost:3000/api/quote/[quote-id]/waybill`
   - Download PDF: `http://localhost:3000/api/quote/[quote-id]/waybill/download`

## Alternative: Using puppeteer-html2pdf

If you prefer HTML to PDF conversion:

```bash
npm install puppeteer html2pdf
```

Then use HTML template to generate PDF instead of PDFKit.

## Frontend Integration

The frontend code has already been added to:

- `/src/app/dashboard/my-assigned-quotes/page.js`

**Key features:**

- View waybill in modal
- Download waybill as PDF
- Displays all quote details in professional format

## Customization Options

1. **Waybill Number Format:**
   Change the generation logic in the backend:

   ```javascript
   // Current: WB-2024-001-ABC123
   // Custom format example:
   const waybillNumber = `MC-${Date.now()}-${quote._id.toString().slice(-4)}`;
   ```

2. **PDF Styling:**
   Modify fonts, colors, and layout in the `download/route.js` file

3. **Additional Fields:**
   Add more fields to the waybill data structure as needed

## Notes

- Ensure Quote model is properly imported
- Database connection is established
- All quote fields are available in the model
- Consider adding rate limiting for PDF generation
- Cache waybill data if frequently accessed

## Support

For issues with PDF generation, check:

- PDFKit documentation: http://pdfkit.org/
- Node.js file stream handling
- Next.js API route setup
