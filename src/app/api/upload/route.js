import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/app/server/utils/cloudinaryService';

export async function POST(request) {
  try {
    const { file, folder = 'modest' } = await request.json();

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    const result = await uploadToCloudinary(file, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
