"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Search } from 'lucide-react';

interface Game {
  gameId: string;
  title: string;
  description?: string;
  htmlFiles: string[];
}

const ExplorePage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/fetchallgames');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-800/80 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 text-base font-medium mb-4 md:mb-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"></path>
                  <path d="m12 19-7-7 7-7"></path>
                </svg>
                Back
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Explore Games</h1>
              <p className="mt-2 text-gray-400">Discover and play games created by the community</p>
            </div>
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search games..."
                className="block w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game, index) => (
          <div key={index} className="bg-gray-900/80 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-800 hover:border-gray-700">
            <div className="w-full aspect-[4/3] bg-black/50 relative group">
              <iframe
                srcDoc={game.htmlFiles.join('')}
                className="w-full h-full pointer-events-none"
                style={{ border: 'none' }}
                title={`Game ${index + 1}`}
                sandbox="allow-scripts"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <button
                  onClick={() => router.push(`/play/${game.gameId}`)}
                  className="w-full bg-white/10 backdrop-blur-sm text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play Now
                </button>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white truncate">{game.title}</h2>
              <p className="text-gray-400 text-sm line-clamp-2 mt-1 min-h-[2.5rem]">
                {game.description || 'No description available.'}
              </p>
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;