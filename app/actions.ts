"use server";

import defineGameDataModel from "@/models/GameData";
import dbConnect from "@/models/dbConnect";

export const saveGameData = async (email: string, gameId: string, cleanHtml: string) => {
  await dbConnect();

  // Validate that we have the required html content
  if (!cleanHtml || cleanHtml.trim() === '') {
    throw new Error('HTML content is required but was empty or undefined');
  }

  const GameData = await defineGameDataModel();
  let gameData = await GameData.findOne({ gameId });
  let version: number;

  if (!gameData) {
    // If no game data exists, create new entry with version 0
    version = 0;
    gameData = new (await defineGameDataModel())({
      email,
      gameId,
      version,
      html: cleanHtml, // Set the required html field
      htmlFiles: [cleanHtml]
    });
  } else {
    // If game data exists, calculate the next version based on the count of existing documents
    version = await GameData.countDocuments({ gameId });

    if (!gameData.htmlFiles) {
      gameData.htmlFiles = [];
    }
    
    gameData.htmlFiles.push(cleanHtml);
    
    // Update the main html field with the latest version
    gameData.html = cleanHtml;
    gameData.version = version;
  }

  // Save the updated game data
  await gameData.save();
  console.log(`Data saved to MongoDB - Version: ${version}`);
  
  return version; // Return the version number for use in the frontend
};