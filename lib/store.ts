// In-memory storage for games (replace with a database in production)
export const games = new Map<string, { prompt: string; html: string }>() 