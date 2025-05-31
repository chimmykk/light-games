import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/models/dbConnect';
import defineGameDataModel from '@/models/GameData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const GameData = defineGameDataModel();
    
    // Find the latest 20 games, sorted by creation date (newest first)
    const games = await GameData.find().sort({ createdAt: -1 }).limit(20);

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
