// import { NextRequest, NextResponse } from 'next/server'
// import dbConnect from '@/models/dbConnect';
// import defineGameDataModel from '@/models/GameData';

// type RouteContext = {
//   params: {
//     gameId: string
//   }
// }

// export async function GET(
//   request: NextRequest,
//   { params }: RouteContext
// ) {
//   const gameId = params.gameId;

//   try {
//     await dbConnect();
//     const GameData = await new defineGameDataModel();
//     const game = await GameData.findOne({ gameId });

//     if (!game) {
//       return NextResponse.json(
//         { error: 'Game not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(game);
//   } catch (error) {
//     console.error("Error fetching game:", error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }