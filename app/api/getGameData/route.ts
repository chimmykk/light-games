import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../models/dbConnect';
import defineGameDataModel from '../../../models/GameData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameid = searchParams.get('gameid');

  try {
    await dbConnect();
    const GameData = defineGameDataModel();
    const gameData = await GameData.findOne({ gameId: gameid });
    if (!gameData) {
      return NextResponse.json({ error: 'Game data not found' }, { status: 404 });
    }
    // Convert Mongoose document to plain object
    return NextResponse.json(gameData.toObject().htmlFiles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
