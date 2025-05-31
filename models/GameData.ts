"use server"
import mongoose, { Schema, model } from 'mongoose';

const gameDataSchema = new Schema({
  email: { type: String, required: true },
  gameId: { type: String, required: true },
  version: { type: String, required: true },
  htmlFiles: [{ type: String, required: true }],
  title: { type: String, required: true },
  plays: { type: Number, default: 0 }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Make this synchronous - no need for async/await here
function defineGameDataModel() {
  // Return existing model if already compiled, otherwise create new one
  return mongoose.models.GameData || model('GameData', gameDataSchema);
}

export default defineGameDataModel;