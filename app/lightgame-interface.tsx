"use client"
import Link from "next/link";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Paperclip,
  ImageIcon,
  ArrowUp,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Play,
  Clock,
  DiscIcon as Discord,
  Github,
  X,
  Loader2,
} from "lucide-react"
import ProjectGeneration from "../components/project-generation"
import { useSession, signIn, signOut } from "next-auth/react"
import { generateGameId } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function Component() {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<"home" | "generation">("home")
  const [games, setGames] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/fetchallgames')
        if (!response.ok) throw new Error('Failed to fetch games')
        const data = await response.json()
        setGames(data)
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }

    fetchGames()
  }, [])
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [useTestMode, setUseTestMode] = useState(true) // Toggle for testing
  // const [version, setVersion] = useState(1)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Generate random particles for background (client-side only)
  const [particles, setParticles] = useState<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    animationDelay: number;
    animationDuration: number;
  }[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      size: Math.random() * 4 + 2,
      animationDelay: Math.random() * 2,
      animationDuration: 2 + Math.random() * 2,
    }));
    setParticles(arr);
  }, []);

  if (currentPage === "generation") {
    return (
      <ProjectGeneration
        prompt={currentPrompt}
        onBack={() => {
          setCurrentPage("home")
          setError(null)
          setStreamingContent("")
        }}
        streamingContent={streamingContent}
        isGenerating={isGenerating}
        error={error}
        setStreamingContent={setStreamingContent}
        setIsGenerating={setIsGenerating}
        setError={setError}
        // version={version}
        // setVersion={setVersion}
        userEmail={session?.user?.email || ""}
      />
    )
  }

  async function handleGenerate() {
    if (!inputValue.trim() || isGenerating) return;
    
    // Generate a 6-character ID and redirect
    const gameId = generateGameId();
    // Store the prompt in localStorage
    localStorage.setItem(`game_${gameId}`, inputValue);
    window.location.href = `/p/${gameId}`;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full opacity-60 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold">lightgame</div>
          <nav className="flex items-center gap-4">
            <Link href="/my-creations">
              <Button variant="ghost" className="text-blue-300 hover:text-black">
                📁 My Creations
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" className="text-gray-300 hover:text-black">
                🧭 Explore
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"

            size="sm"
            onClick={() => setUseTestMode(!useTestMode)}
            className={useTestMode ? "text-green-400" : "text-gray-400"}
          >
            {useTestMode ? "Test Mode" : "AI Mode"}
          </Button>
          <Button variant="ghost" size="icon">
            <Discord className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Github className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
            ⚡ Upgrade to Pro
          </Button>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm">
                  {session.user?.email}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" className="text-sm" onClick={() => signIn("google")}>Sign in with Google</Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">lightgame</h1>
          <p className="text-xl text-gray-300 mb-6">
            Generate, p<span className="text-green-400">layground</span> and share it with the world, in seconds
          </p>
          <Button variant="outline" className="mb-8 bg-gray-800 border-gray-600 hover:bg-gray-700">
            <Discord className="w-4 h-4 mr-2" />
            Join the Discord
          </Button>
          {useTestMode && <div className="text-sm text-green-400 mb-4">🧪 Test Mode Active - Using mock responses</div>}
        </div>

        {/* Input Section */}
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <Textarea
              placeholder="Make a cool game that..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-transparent border-none text-lg resize-none min-h-[100px] placeholder:text-gray-500"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 hover:bg-gray-700">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </Button>
                <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 hover:bg-gray-700">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Image
                </Button>
              </div>
              <Button
                size="icon"
                className="bg-gray-700 hover:bg-gray-600"
                disabled={isGenerating || !inputValue.trim()}
                onClick={handleGenerate}
              >
                {isGenerating ? (
  <Loader2 className="w-4 h-4 animate-spin" />
) : (
  <ArrowUp className="w-4 h-4" />
)}
              </Button>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-gray-400">Examples:</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => setInputValue("Simple Car Racing Game")}
          >
            Car Racing
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => setInputValue("Snake Game")}
          >
            Snake Game
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => setInputValue("Simple Platformer Game")}
          >
            Platformer
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

    <Button variant="link" className="text-gray-300 hover:text-white mb-12" asChild>
      <Link href="/explore">
        Explore all projects
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </Button>

        {/* Search and Filters */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-gray-900 border-gray-700 hover:bg-gray-800">
                  Sort by Popular
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Popular</DropdownMenuItem>
                <DropdownMenuItem>Recent</DropdownMenuItem>
                <DropdownMenuItem>Most Played</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-gray-900 border-gray-700 hover:bg-gray-800">
                  From This Week
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>All Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Project Cards */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 py-4">
            {games.map((game, index) => (
              <div 
                key={index} 
                className="bg-gray-900/80 rounded-lg shadow overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-800 hover:border-gray-700"
              >
                <div className="w-full aspect-[4/3] bg-black/40 relative group">
                  <iframe
                    srcDoc={game.htmlFiles?.join('') || ''}
                    className="w-full h-full pointer-events-none scale-90"
                    style={{ border: 'none' }}
                    title={`Game ${index + 1}`}
                    sandbox="allow-scripts"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/play/${game.gameId}`);
                      }}
                      className="w-full bg-white/10 backdrop-blur-sm text-white py-1.5 px-3 rounded text-xs font-medium hover:bg-white/20 transition-colors duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3" />
                      Play
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <h2 className="text-sm font-medium text-white truncate">{game.title}</h2>
                  <p className="text-gray-400 text-xs line-clamp-2 mt-0.5 min-h-[2rem]">
                    {game.description || 'No description'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
