import { authenticate, isAdmin } from "@/app/server/middleware/auth.js";
import Quote from "@/app/server/models/Quote.js";
import { connectDB } from "@/app/server/db/connect.js";
import { NextResponse } from "next/server";

// GET /api/dashboard/shipment-chart
// Fetch shipment and quote status data for chart visualization
export async function GET(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      try {
        await connectDB();

        // Get last 6 months data
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

        // Aggregate quotes by status - get actual statuses from database
        const statusData = await Quote.aggregate([
          {
            $group: {
              _id: {
                $toLower: "$status" // Convert to lowercase for consistent grouping
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ]);

        // Map statuses to user-friendly names
        const statusMapping = {
          'pending': 'Pending',
          'processing': 'Processing',
          'picked up': 'Picked Up',
          'picked-up': 'Picked Up',
          'in transit': 'In Transit',
          'in-transit': 'In Transit',
          'assigned': 'In Transit',
          'delivered': 'Delivered',
          'quoted': 'Quoted',
          'cancelled': 'Cancelled',
        };

        // Format status data for pie chart - use dynamic statuses from database
        const byStatus = [];
        
        statusData.forEach((item) => {
          const displayName = statusMapping[item._id] || item._id.charAt(0).toUpperCase() + item._id.slice(1);
          
          // Check if this status already exists in array (in case multiple statuses map to same name)
          const existingStatus = byStatus.find(s => s.name === displayName);
          if (existingStatus) {
            existingStatus.value += item.count;
          } else {
            byStatus.push({
              name: displayName,
              value: item.count,
              rawStatus: item._id
            });
          }
        });

        // Aggregate quotes by month for the last 6 months
        const monthlyData = await Quote.aggregate([
          {
            $match: {
              createdAt: { $gte: sixMonthsAgo },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              totalQuotes: { $sum: 1 },
              delivered: {
                $sum: {
                  $cond: [{ $eq: [{ $toLower: "$status" }, "delivered"] }, 1, 0],
                },
              },
            },
          },
          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
            },
          },
        ]);

        // Format monthly data for bar chart
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const byMonth = [];

        // Get the last 6 months in order
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const monthName = monthNames[month - 1];

          const data = monthlyData.find((d) => d._id.year === year && d._id.month === month);

          byMonth.push({
            month: monthName,
            quotes: data ? data.totalQuotes : 0,
            delivered: data ? data.delivered : 0,
          });
        }

        return NextResponse.json(
          {
            success: true,
            data: {
              byStatus,
              byMonth,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Shipment chart data error:", error);
        
        // Return default data if error occurs
        return NextResponse.json(
          {
            success: true,
            data: {
              byStatus: [
                { name: "Pending", value: 0 },
                { name: "In Transit", value: 0 },
                { name: "Delivered", value: 0 },
                { name: "Cancelled", value: 0 },
              ],
              byMonth: Array.from({ length: 6 }, (_, i) => ({
                month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
                quotes: 0,
                delivered: 0,
              })),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }
    });
  });
}
