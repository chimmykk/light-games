"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import ProjectGeneration from "@/components/project-generation"
import { getSession } from "next-auth/react"
import { saveGameData } from "@/app/actions"

export default function GamePage() {
  const params = useParams()
  const gameId = params?.gameId as string | undefined
  const [streamingContent, setStreamingContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const hasGenerated = useRef(false)
  const isInitialized = useRef(false)

  // Get the prompt from localStorage when the page loads
  useEffect(() => {
    if (!gameId || isInitialized.current) return
    isInitialized.current = true

    const storedPrompt = localStorage.getItem(`game_${gameId}`)
    console.log("Retrieved prompt from localStorage:", storedPrompt)
    if (storedPrompt) {
      setPrompt(storedPrompt)
    }
  }, [gameId])

  // Trigger game generation when the page loads and prompt is available
  useEffect(() => {
    if (!prompt || !gameId || hasGenerated.current) return

    async function generateGame() {
      console.log("Starting game generation with prompt:", prompt)
      hasGenerated.current = true
      setIsGenerating(true)
      setStreamingContent("")
      setError(null)

      try {
        console.log("Making API request to /api/generate-game")
        const response = await fetch("/api/generate-game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate game")
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        console.log("Got response, starting to read stream")
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk
          console.log("Streaming chunk:", chunk)
          setStreamingContent(accumulatedContent)
        }

        // Extract HTML content
        const htmlMatch = accumulatedContent.match(/```html\s*([\s\S]*?)```/i)
        let cleanHtml = htmlMatch ? htmlMatch[1].trim() : ""

        if (!cleanHtml) {
          const directHtmlMatch = accumulatedContent.match(/<!DOCTYPE html[\s\S]*<\/html>/i)
          cleanHtml = directHtmlMatch ? directHtmlMatch[0] : ""
        }

        if (!cleanHtml) {
          throw new Error("No HTML content found in the generated response")
        }

        console.log("Clean HTML extracted:", cleanHtml.substring(0, 200) + "...")

        const session = await getSession()
        const email = session?.user?.email || "anonymous"

        console.log("Email Address:", email)
        console.log("Game ID:", gameId)

        if (!gameId) {
          console.error("Game ID is undefined");
          return;
        }

        const actualVersion = await saveGameData(email, gameId, cleanHtml)
        console.log(`Game saved as version: ${actualVersion}`)

      } catch (error) {
        console.error("Error during game generation:", error)
        setError(error instanceof Error ? error.message : "Failed to generate game")
      } finally {
        console.log("Generation process finished")
        setIsGenerating(false)
      }
    }

    generateGame()
  }, [prompt, gameId])

  return (
    <ProjectGeneration
      prompt={prompt}
      onBack={() => window.location.href = "/"}
      streamingContent={streamingContent}
      isGenerating={isGenerating}
      error={error}
      setStreamingContent={setStreamingContent}
      setIsGenerating={setIsGenerating}
      setError={setError}
      userEmail={""}
    />
  )
}
