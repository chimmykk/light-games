"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Play, Users, Clock, Plus, ArrowLeft } from "lucide-react";

interface GameData {
  email: string;
  gameId: string;
  version: number;
  htmlFiles: string[];
  _id: string;
  title: string;
  createdAt?: string;
  plays?: number;
}

interface MyCreationsProps {
  setShowCreations: (show: boolean) => void;
}

export default function MyCreations({ setShowCreations }: MyCreationsProps) {
  const { data: session } = useSession();
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    setShowCreations(false);
  };

  const handleNewCreation = () => {
    setShowCreations(false);
  };

  useEffect(() => {
    async function fetchCreations() {
      setIsLoading(true);
      setError(null);

      try {
        const email = session?.user?.email;
        if (!email) {
          setError("User not logged in.");
          return;
        }

        const response = await fetch(
          `/api/games?email=${email}`
        );

        if (!response.ok) {
          throw new Error("Failed to list HTML files: " + response.statusText);
        }

        const data = await response.json();
        setGames(data || []);
      } catch (error: any) {
        setError(error.message || "Failed to fetch creations.");
      } finally {
        setIsLoading(false);
        console.log("isLoading:", false);
      }
    }

    fetchCreations();
  }, [session]);

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1d ago";
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">My Creations</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading your creations...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors flex items-center justify-center"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-4xl font-bold">My Creations</h1>
          </div>
          <button
            onClick={handleNewCreation}
            className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Creation
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {games.length === 0 && !error ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">No creations found.</div>
            <button 
              onClick={handleNewCreation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Game
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {games.map((game) => (
                <div key={game._id} className="group cursor-pointer transition-transform hover:scale-105">
                  <div className="bg-black rounded-xl overflow-hidden hover:bg-gray-800 transition-colors">
                    {/* Game Preview */}
                    <div className="relative aspect-video bg-gray-800 overflow-hidden">
                      {game.htmlFiles && game.htmlFiles[0] ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: game.htmlFiles[0] }}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <Play size={32} className="text-gray-500" />
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-blue-600 rounded-full p-3 hover:bg-blue-700 transition-colors">
                          <Play size={24} className="text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                        {game.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Play size={14} />
                          <span>{game.plays || 2} plays</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{formatTimeAgo(game.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* End of List Message */}
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">You've reached the end of the list</div>
              <div className="text-gray-500 text-sm">Check back soon for new projects</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}