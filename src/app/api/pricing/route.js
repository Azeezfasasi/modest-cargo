import { connectDB } from '@/utils/db';
import Pricing from '@/app/server/models/Pricing';

export async function GET(req) {
  try {
    await connectDB();
    const pricingData = await Pricing.findOne({});
    
    if (!pricingData) {
      // Return default structure if no pricing exists
      return Response.json({
        success: true,
        data: {
          usaToNigeria: {
            headers: ['Freight Type', 'Fashion Items', 'Computing', 'Drugs & Chemicals', 'Frozen Food', 'Machinery'],
            rows: [
              { type: 'Air Freight', rates: ['', '', '', '', ''] },
              { type: 'Sea Freight', rates: ['', '', '', '', ''] }
            ]
          },
          nigeriaToUSA: {
            headers: ['Freight Type', 'Fashion Items', 'Perishables', 'Farm Produce', 'Frozen Food', 'Machinery'],
            rows: [
              { type: 'Air Freight', rates: ['', '', '', '', ''] },
              { type: 'Sea Freight', rates: ['', '', '', '', ''] }
            ]
          }
        }
      });
    }
    
    return Response.json({
      success: true,
      data: pricingData
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch pricing data'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { usaToNigeria, nigeriaToUSA } = await req.json();

    let pricingData = await Pricing.findOne({});
    
    if (pricingData) {
      // Update existing
      pricingData.usaToNigeria = usaToNigeria;
      pricingData.nigeriaToUSA = nigeriaToUSA;
      await pricingData.save();
    } else {
      // Create new
      pricingData = new Pricing({
        usaToNigeria,
        nigeriaToUSA
      });
      await pricingData.save();
    }

    return Response.json({
      success: true,
      message: 'Pricing data saved successfully',
      data: pricingData
    });
  } catch (error) {
    console.error('Error saving pricing:', error);
    return Response.json({
      success: false,
      message: 'Failed to save pricing data'
    }, { status: 500 });
  }
}
