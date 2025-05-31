"use client"

import React, { useState, useEffect, useRef } from "react" // Added React import for React.memo
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Paperclip,
  ImageIcon,
  ArrowUp,
  RefreshCw,
  ChevronDown,
  Loader2,
  DiscIcon as Discord,
  Play,
  Code,
  X,
} from "lucide-react"

interface ProjectGenerationProps {
  prompt: string
  onBack: () => void
  streamingContent?: string
  isGenerating?: boolean
  error?: string | null
  setStreamingContent: (s: string) => void
  setIsGenerating: (b: boolean) => void
  setError: (e: string | null) => void
  // version: number
  // setVersion: (v: (prev: number) => number) => void
  userEmail: string;
}

// Helper component for colorizing text
const streamColors = ['text-yellow-400', 'text-pink-400', 'text-green-400', 'text-cyan-400', 'text-orange-400'];
const ColorizedText: React.FC<{ text: string }> = React.memo(({ text }) => {
  // Split by space, but also try to keep HTML tags/entities somewhat intact for potential specific styling.
  // This is a heuristic and not a robust parser.
  const parts = text.split(/(\s+|(?=<)|(?<=>)|(?=&[a-zA-Z0-9#]+;))/g).filter(part => part.length > 0);
  let colorIndex = 0;

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(/^\s+$/)) { // If it's only whitespace
          return <span key={index}>{part}</span>;
        }
        // Basic check for something that looks like a tag or entity
        if ((part.startsWith('<') && part.endsWith('>')) || (part.startsWith('&') && part.endsWith(';'))) {
          return (
            <span key={index} className="text-blue-400 font-semibold"> {/* Style for tags/entities */}
              {part}
            </span>
          );
        }
        // Cycle colors for other words/parts
        const colorClass = streamColors[colorIndex % streamColors.length];
        colorIndex++;
        return (
          <span key={index} className={colorClass}>
            {part}
          </span>
        );
      })}
    </>
  );
});
ColorizedText.displayName = 'ColorizedText';


export default function ProjectGeneration({
  prompt,
  onBack,
  streamingContent = "",
  isGenerating = false,
  error = null,
  setStreamingContent,
  setIsGenerating,
  setError,
  // version,
  // setVersion,
  userEmail,
}: ProjectGenerationProps) {
  const [inputValue, setInputValue] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [gameHtml, setGameHtml] = useState("")
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [versions, setVersions] = useState<{ code: string, label: string }[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sseMessages, setSseMessages] = useState<string[]>([]);

  // Extract HTML content when streaming is complete
  useEffect(() => {
    if (!isGenerating && streamingContent) {
      const htmlMatch =
        streamingContent.match(/```html\s*([\s\S]*?)\s*```/) ||
        streamingContent.match(/<!DOCTYPE html[\s\S]*<\/html>/i);

      if (htmlMatch) {
        const html = htmlMatch[1] || htmlMatch[0];
        setGameHtml(html);
      } else if (streamingContent.includes('<html')) {
        setGameHtml(streamingContent);
      }
    }
  }, [streamingContent, isGenerating]);

  // SSE Connection for initial game generation
  useEffect(() => {
    if (!isGenerating) return;
    
    // This specific SSE connection is for the main /api/generate-game endpoint
    // It should not run if an abortController is active (signifying another operation like "nicer")
    if (abortController) return;

    const fetchData = async () => {
      try {
        setGameHtml(""); // Reset gameHtml for new generation
        setSseMessages([]); // Reset SSE messages
        setError(null); // Clear previous errors

        const response = await fetch('/api/generate-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }
        const decoder = new TextDecoder();
        let partialData = "";

        const processStream = async () => {
          const { done, value } = await reader.read();
          if (done) {
            console.log('SSE stream for /api/generate-game complete');
            setIsGenerating(false); 
            return;
          }

          partialData += decoder.decode(value, { stream: true });
          const lines = partialData.split('\n');
          partialData = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            setSseMessages((prev) => [...prev, line]);
            setGameHtml((prev) => prev + line);
          }
          await processStream();
        };
        await processStream();
      } catch (error) {
        console.error("SSE error for /api/generate-game:", error);
        if (error instanceof Error && error.name !== 'AbortError') {
            setError(`Game generation error: ${error.message}`);
        }
        setIsGenerating(false);
      }
    };

    fetchData();

  }, [isGenerating, prompt, abortController, setError, setIsGenerating, setGameHtml, setSseMessages]);

  // Update iframe whenever gameHtml changes and reset iframe loaded state
  useEffect(() => {
    if (!showCode && gameHtml && iframeRef.current) {
      setIframeLoaded(false); 
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(gameHtml);
        doc.close();
        setTimeout(() => setIframeLoaded(true), 500);
      } else {
        console.error("Could not get document for iframe");
      }
    }
  }, [gameHtml, showCode]);
  

  // When a new gameHtml is set, update versions if not generating
  useEffect(() => {
    if (!isGenerating && gameHtml) {
      setVersions((prev) => {
        if (prev.length === 0 || prev[prev.length - 1].code !== gameHtml) {
          const newVersion = { code: gameHtml, label: `Version ${prev.length + 1}` };
          const newVersions = [...prev, newVersion];
          setCurrentVersionIndex(newVersions.length - 1); 
          return newVersions;
        }
        return prev;
      });
    }
  }, [gameHtml, isGenerating]);

  const liveCode = isGenerating ? (streamingContent || gameHtml) : (versions[currentVersionIndex]?.code || gameHtml);

  function handleStop() {
    if (abortController) {
      abortController.abort();
    }
    setIsGenerating(false); 
    setError("Generation stopped by user.");
  }

  async function handleGenericStreamCall(apiPath: string, bodyPayload: any, operationName: string) {
    setShowCode(true); 
    setStreamingContent("");
    setError(null);
    // setVersion((v) => v + 1); // Consider if versioning should happen before success
    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    let result = "";

    try {
      const response = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setStreamingContent(result);
      }
      // After successful stream, gameHtml will be updated by the useEffect watching streamingContent
      // setVersion((v) => v + 1); // Increment version on success
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== "AbortError") {
            console.error(`${operationName} error:`, err);
            setError(`Failed to ${operationName.toLowerCase()}: ${err.message}`);
        } else {
            setError(`${operationName} aborted.`);
        }
      } else {
        setError(`Unknown error during ${operationName.toLowerCase()}`);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  }

  function handleMakeItNicer() {
    if (!gameHtml) return;
    handleGenericStreamCall("/api/makeit-nicer", { prompt: gameHtml }, "Make it Nicer");
  }

  function handleRetry() {
    if (!gameHtml) return; 
    handleGenericStreamCall("/api/retry", { prompt: gameHtml }, "Retry");
  }

  function handlePromptNicer() {
    if (!inputValue.trim() || !gameHtml) return;
    handleGenericStreamCall("/api/promptnicer", { prompt: inputValue, html: gameHtml }, "Apply Prompt");
    setInputValue(""); 
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Sidebar (Chat) */}
      <div className="w-[620px] border-r border-gray-800 bg-[#101014] flex flex-col h-full shadow-lg z-10">
        <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">Chat</h2>
          <div className="w-full h-[400px] md:h-[calc(100vh-200px)] flex flex-col gap-3 overflow-y-auto bg-transparent rounded-lg pr-2"> {/* Added pr-2 for scrollbar space */}
            {prompt && (
              <div className="bg-gray-800 rounded-lg p-3 text-sm self-end max-w-[85%]">{prompt}</div>
            )}
            
            {gameHtml && !iframeLoaded && !showCode && (
              <div className="bg-gray-800 shadow-md rounded-lg p-4 text-sm self-start w-full max-w-[90%] animate-pulse">
                <div className="flex items-center mb-2 text-blue-300 font-semibold">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Loading live preview...</span>
                </div>
                <div className="font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto p-2 bg-black bg-opacity-50 rounded scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                  <ColorizedText text={gameHtml.substring(0, 800)} />
                  {gameHtml.length > 800 ? <span className="text-gray-500">...</span> : ""}
                </div>
              </div>
            )}
            
            {!isGenerating && streamingContent && (() => {
              const htmlEndIdx = streamingContent.indexOf('</html>');
              if (htmlEndIdx === -1 && !streamingContent.startsWith("Okay,")) return null; // Show if it's a conversational follow-up too
              
              let literal = "";
              if (htmlEndIdx !== -1) {
                literal = streamingContent.slice(htmlEndIdx + 7).trim();
              } else if (streamingContent.startsWith("Okay,") || streamingContent.startsWith("Sure,")) {
                // If it seems like a conversational message after HTML (or instead of new HTML)
                const codeBlockEnd = streamingContent.lastIndexOf("</html>");
                if (codeBlockEnd !== -1 && codeBlockEnd > htmlEndIdx) {
                    literal = streamingContent.slice(codeBlockEnd + 3).trim();
                } else if (htmlEndIdx === -1) { // No HTML tag, just conversational text
                    literal = streamingContent;
                }
              }

              if (!literal) return null;
              return (
                <div className="bg-blue-900 w-80px rounded-lg p-15 font-mono text-xs whitespace-pre-wrap self-start max-w-[85%]">
                <ColorizedText text={literal} />
              </div>
              );
            })()}

            {error && (
              <div className="bg-red-900 rounded-lg p-3 text-xs text-red-300 self-start max-w-[85%]">{error}</div>
            )}
          </div>
        </div>
        {/* Bottom Input Area */}
        <div className="border-t border-gray-800 p-6 bg-[#18181c]">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col gap-2 shadow-sm">
            <Input
              placeholder="Add a feature or modify the game..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-transparent border-none text-lg placeholder:text-gray-500 mb-0"
              disabled={isGenerating}
              onKeyPress={(e) => { if (e.key === 'Enter' && !isGenerating && inputValue.trim() && gameHtml) handlePromptNicer(); }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                variant="outline" size="sm"
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                disabled={isGenerating || !gameHtml} onClick={handleMakeItNicer}
              >
                ✨ Make it look nicer
              </Button>
              <Button
                variant="outline" size="sm"
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                disabled={isGenerating || !gameHtml} onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
              {isGenerating && (
                <Button
                  variant="destructive" size="sm"
                  className="bg-red-700 border-red-600 hover:bg-red-800"
                  onClick={handleStop}
                >
                  Stop
                </Button>
              )}
              <Button
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                disabled={isGenerating || !inputValue.trim() || !gameHtml}
                onClick={handlePromptNicer}
              >
                {isGenerating && abortController ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#101014] shadow-sm z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={onBack} className="text-xl font-bold hover:text-gray-300">
              lightgame.ai
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Discord className="w-4 h-4" /></Button>
            <Button variant="ghost" className="text-sm">Feedback</Button>
            <Button variant="outline" className="bg-white text-black hover:bg-gray-100">⚡ Upgrade to Pro</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm">
                  {userEmail} <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" className="text-sm px-2" onClick={() => setShowCode(!showCode)}>
              <Code className="w-4 h-4 mr-1" /> {showCode ? "Preview" : "Code"}
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-black p-1 overflow-y-auto max-h-screen">
          <div className="flex-1 flex flex-col h-full">
            {isGenerating ? (
              showCode ? (
                <div className="flex-1 w-full h-full bg-gray-900 rounded-lg p-4 text-xs font-mono overflow-y-auto min-w-[280px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  <pre className="text-green-400 whitespace-pre-wrap w-full h-full">
                    {streamingContent || gameHtml || "Waiting for stream data..."}
                  </pre>
                  <p className="text-xs text-gray-500 mt-2 sticky bottom-0">Streaming live code...</p>
                </div>
              ) : gameHtml ? (
                <div className="flex-1 w-full h-full bg-white rounded-lg overflow-hidden flex">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0"
                    title="Generating Game Preview"
                    sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
                  />
                </div>
              ) : (
                <div className="text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  </div>
                  <p className="text-lg text-gray-400">Generating your game...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )
            ) : error ? (
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-lg text-red-400">Error occurred</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
            ) : gameHtml ? (
              <div className="flex-1 flex flex-col w-full h-full">
                <div className="flex gap-3 mb-4 w-full justify-end items-center px-2">
                  {/* <select
                    className="ml-2 bg-gray-800 text-white rounded px-2 py-1 border border-gray-600 h-9 text-sm"
                    value={currentVersionIndex}
                    onChange={e => {
                        const newIndex = Number(e.target.value);
                        setCurrentVersionIndex(newIndex);
                        if (versions[newIndex]) {
                            setGameHtml(versions[newIndex].code); // Update gameHtml when version changes
                        }
                    }}
                    disabled={versions.length === 0}
                  >
                    {versions.map((v, i) => (
                      <option key={i} value={i}>{v.label}</option>
                    ))}
                    {versions.length === 0 && <option value="-1" disabled>Version 1</option>}
                  </select> */}
                 <Button 
  variant={showCode ? "default" : "outline"} 
  size="sm" 
  onClick={() => setShowCode(true)}
  className={`h-9 ${showCode ? "bg-blue-600 hover:bg-blue-700 text-black" : "border-gray-600 hover:bg-gray-700 text-black"}`}
>
  <Code className="w-4 h-4" />
  <span className="ml-2">Code</span>
</Button>

<Button 
  variant={!showCode ? "default" : "outline"} 
  size="sm" 
  onClick={() => setShowCode(false)}
  className={`h-9 ${!showCode ? "bg-blue-600 hover:bg-blue-700 text-black" : "border-gray-600 hover:bg-gray-700 text-black"}`}
>
  <Play className="w-4 h-4" />
  <span className="ml-2">Preview</span>  
</Button>

<Button
  variant="outline" 
  size="sm" 
  className="border-gray-600 hover:bg-gray-700 text-black h-9"
  onClick={() => {
    if (navigator.clipboard) navigator.clipboard.writeText(liveCode); 
  }}
>
  <Paperclip className="w-4 h-4" />
  <span className="ml-2">Copy Code</span>
</Button>
                </div>
                {showCode ? (
                  <div className="flex-1 w-full h-full bg-gray-900 rounded-lg p-4 text-xs font-mono overflow-y-auto min-w-[280px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    <pre className="text-white-900 whitespace-pre-wrap w-full h-full">{liveCode}</pre>
 {/* This whole expression logs and then results in 'null' for rendering purposes */}
{/* {(() => {
  console.log('Value of liveCode:', liveCode);
  return null;
})()} */}
{/* You can then have other JSX here */}
{/* <p>Some other content</p> */}
                  </div>
                  
                ) : (
                  <div className="flex-1 w-full h-full bg-white rounded-lg overflow-hidden flex">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-0"
                      title="Generated Game"
                      sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Code className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg text-gray-400">Ready to generate</p>
                <p className="text-sm text-gray-500 mt-2">Enter a prompt to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}