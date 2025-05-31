import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    // Simple mock response for testing
    const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .game-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .game-title {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .game-button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.2em;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 10px;
        }
        .game-button:hover {
            background: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .score {
            font-size: 1.5em;
            margin: 20px 0;
        }
        #gameArea {
            width: 400px;
            height: 300px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            margin: 20px auto;
            position: relative;
            overflow: hidden;
        }
        .player {
            width: 50px;
            height: 50px;
            background: #ffeb3b;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 20px;
            transform: translateY(-50%);
            transition: all 0.1s ease;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1 class="game-title">${prompt}</h1>
        <div class="score">Score: <span id="score">0</span></div>
        <div id="gameArea">
            <div class="player" id="player"></div>
        </div>
        <button class="game-button" onclick="startGame()">Start Game</button>
        <button class="game-button" onclick="resetGame()">Reset</button>
        <p>Use arrow keys to move!</p>
    </div>

    <script>
        let score = 0;
        let gameRunning = false;
        let player = document.getElementById('player');
        let scoreElement = document.getElementById('score');
        let gameArea = document.getElementById('gameArea');
        
        let playerY = 125;
        
        function startGame() {
            if (gameRunning) return;
            gameRunning = true;
            gameLoop();
        }
        
        function resetGame() {
            gameRunning = false;
            score = 0;
            playerY = 125;
            updateDisplay();
        }
        
        function updateDisplay() {
            scoreElement.textContent = score;
            player.style.top = playerY + 'px';
        }
        
        function gameLoop() {
            if (!gameRunning) return;
            
            score += 1;
            updateDisplay();
            
            setTimeout(gameLoop, 100);
        }
        
        // Keyboard controls
        document.addEventListener('keydown', function(event) {
            if (!gameRunning) return;
            
            switch(event.key) {
                case 'ArrowUp':
                    if (playerY > 0) playerY -= 20;
                    break;
                case 'ArrowDown':
                    if (playerY < 250) playerY += 20;
                    break;
                case 'ArrowLeft':
                    // Add left movement if needed
                    break;
                case 'ArrowRight':
                    // Add right movement if needed
                    break;
            }
            updateDisplay();
        });
        
        // Initialize
        updateDisplay();
    </script>
</body>
</html>`

    // Simulate streaming by sending chunks
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        const chunks = mockHtml.match(/.{1,50}/g) || [mockHtml]
        let index = 0

        const sendChunk = () => {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(chunks[index]))
            index++
            setTimeout(sendChunk, 50) // Simulate streaming delay
          } else {
            controller.close()
          }
        }

        sendChunk()
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in test-simple API:", error)
    return new Response(JSON.stringify({ error: "Test API error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
