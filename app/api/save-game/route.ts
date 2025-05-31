// import { NextResponse } from 'next/server';
// import dbConnect from '../../../models/dbConnect';
// import GameData from '../../../models/GameData';

// export async function POST(req: Request) {
//   try {
//     console.log('=== API ROUTE CALLED ===');
    
//     const body = await req.json();
//     console.log('Raw request body keys:', Object.keys(body));
//     console.log('Raw request body:', {
//       email: body.email,
//       gameId: body.gameId,
//       version: body.version,
//       cleanHtml: body.cleanHtml ? `${body.cleanHtml.length} characters` : 'EMPTY OR UNDEFINED'
//     });
    
//     const { email, gameId, version, cleanHtml } = body;

//     console.log('=== EXTRACTED VALUES ===');
//     console.log('Email:', email);
//     console.log('GameId:', gameId);
//     console.log('Version:', version);
//     console.log('HTML Content type:', typeof cleanHtml);
//     console.log('HTML Content length:', cleanHtml?.length || 0);
//     console.log('HTML Content preview:', cleanHtml ? cleanHtml.substring(0, 200) + '...' : 'NO CONTENT');

//     await dbConnect();

//     // Validate the cleanHtml before saving
//     if (!cleanHtml || typeof cleanHtml !== 'string' || cleanHtml.length === 0) {
//       console.error('Invalid HTML content:', { type: typeof cleanHtml, length: cleanHtml?.length });
//       return NextResponse.json({ success: false, error: 'Invalid HTML content' }, { status: 400 });
//     }

//     const updateData = {
//       email,
//       gameId,
//       version: parseInt(version) || 1,
//       cleanHtml: cleanHtml,
//       updatedAt: new Date(),
//     };

//     console.log('=== UPDATE DATA ===');
//     console.log('Update data:', {
//       ...updateData,
//       cleanHtml: updateData.cleanHtml ? `${updateData.cleanHtml.length} characters` : 'EMPTY'
//     });

//     // Additional validation right before save
//     console.log('=== PRE-SAVE VALIDATION ===');
//     console.log('cleanHtml type:', typeof updateData.cleanHtml);
//     console.log('cleanHtml length:', updateData.cleanHtml?.length);
//     console.log('cleanHtml first 100 chars:', updateData.cleanHtml?.substring(0, 100));

//     // const saved = await GameData.findOneAndUpdate(
//       { gameId },
//       updateData,
//       { 
//         upsert: true, 
//         new: true,
//         runValidators: true // This ensures schema validation runs
//       }
//     );

//     console.log('=== POST-SAVE VALIDATION ===');
//     console.log('Raw saved document:', saved);
//     console.log('Saved cleanHtml type:', typeof saved.cleanHtml);
//     console.log('Saved cleanHtml length:', saved.cleanHtml?.length);

//     console.log('=== SAVED DOCUMENT ===');
//     console.log('Saved document HTML length:', saved.cleanHtml?.length || 0);
//     console.log('Saved document HTML preview:', saved.cleanHtml ? saved.cleanHtml.substring(0, 200) + '...' : 'NO CONTENT');

//     // Convert to plain object before returning
//     const plainObject = {
//       _id: saved._id?.toString() || '',
//       email: saved.email || '',
//       gameId: saved.gameId || '',
//       version: saved.version || '',
//       cleanHtml: saved.cleanHtml || '',
//       updatedAt: saved.updatedAt ? saved.updatedAt.toISOString() : new Date().toISOString(),
//       __v: saved.__v || 0
//     };

//     console.log('=== FINAL RESPONSE ===');
//     console.log('Plain object HTML length:', plainObject.cleanHtml?.length || 0);

//     return NextResponse.json({ success: true, data: plainObject });
//   } catch (error) {
//     console.error('Error saving game:', error);
//     return NextResponse.json({ success: false, error: 'Failed to save game' }, { status: 500 });
//   }
// }