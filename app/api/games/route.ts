import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/models/dbConnect';
import defineGameDataModel from '@/models/GameData';

export async function GET(request: NextRequest) {
  try {
    // Get email from query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const GameData = defineGameDataModel();
    
    // Find all games for this email, sorted by creation date (newest first)
    const games = await GameData.find({ email }).sort({ createdAt: -1 });

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}