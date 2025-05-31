# Light Game

## Description

This project is a light game creation platform built with Next.js, pnpm, and MongoDB. It allows users to generate, play, and share games created with AI.



Some good prompt to try out that works best 


Create a visually polished single-player Snake game with smooth animations, scoring, and restart functionality.


Single player




Create a local multiplayer Pong game that two players can play on the same keyboard. Each player controls one paddle, and the game tracks scores and supports restarting.



Local multiplayer


Create a multiplayer Tic Tac Toe game where a human plays against an AI opponent using the Shapes API. The AI should take turns after the player, and gameplay should be turn-based and responsive.


Shapes api prompt
## Setup

1.  Install dependencies:

    ```bash
    pnpm install
    ```

2.  Configure environment variables:

    Create a `.env` file in the root directory and add the necessary environment variables. Example:

    ```
    NEXTAUTH_SECRET="your_secret"
    NEXTAUTH_URL="http://localhost:3000"
    MONGODB_URI="your_mongodb_uri"
    ```

    To generate a secure `NEXTAUTH_SECRET`, you can use openssl:

    ```bash
    openssl rand -base64 32
    ```

## Running the project

```bash
pnpm dev
```

This will start the development server at `http://localhost:3000`.

## Project Structure

```
app/
├── actions.ts
├── api/
├── SessionProvider.tsx
├── globals.css
├── layout.tsx
├── lightgame-interface.tsx
├── explore/
├── my-creations/
├── p/
├── page.tsx
└── play/

components/
├── ExploreButton.tsx
├── mycreation.tsx
├── project-generation.tsx
├── theme-provider.tsx
└── ui/

lib/
├── store.ts
└── utils.ts

hooks/
├── use-mobile.tsx
└── use-toast.ts

models/
├── dbConnect.ts
├── GameData.ts
└── Pets.ts

public/
├── placeholder-logo.png
├── placeholder-logo.svg
├── placeholder-user.jpg
├── placeholder.jpg
└── placeholder.svg
```

### `app/`

*   `actions.ts`: Server actions for saving game data to MongoDB.
*   `api/`: Contains the API endpoints for the application.
*   `SessionProvider.tsx`: Provides session management using NextAuth.js.
*   `globals.css`: Global CSS file for styling the application.
*   `layout.tsx`: Defines the root layout of the application.
*   `lightgame-interface.tsx`: Main component for the game generation interface.
*   `explore/`: Contains the explore page.
*   `my-creations/`: Contains the my creations page.
*   `p/`: Contains the game page.
*   `page.tsx`: Defines the home page of the application.
*   `play/`: Contains the play page.

### `components/`

*   `ExploreButton.tsx`: Button to navigate to the explore page.
*   `mycreation.tsx`: Component for displaying user's creations.
*   `project-generation.tsx`: Component for generating the project.
*   `theme-provider.tsx`: Provides theme management using next-themes.
*   `ui/`: Contains reusable UI components.

### `lib/`

*   `store.ts`: Zustand store for managing the application state.
*   `utils.ts`: Utility functions for the application.

### `hooks/`

*   `use-mobile.tsx`: Hook to detect mobile devices.
*   `use-toast.ts`: Hook for displaying toast notifications.

### `models/`

*   `dbConnect.ts`: Database connection setup using Mongoose.
*   `GameData.ts`: Mongoose model for storing game data in MongoDB.
*   `Pets.ts`: Mongoose model for storing pet data in MongoDB.

### `public/`

*   Contains static assets such as images.

## API Endpoints

*   `/api/game-html`: Generates the game HTML based on a prompt.
*   `/api/save-game`: Saves the game data to MongoDB.
*   `/api/games/[gameId]`: Retrieves a specific game from MongoDB.
*   `/api/generate-game`: Generates a new game.
*   `/api/makeit-nicer`: Improves the game's presentation.
*   `/api/promptnicer`: Enhances the game prompt.
*   `/api/retry`: Retries the game generation.
*   `/api/test-simple`: Tests a simple game.

## Models

*   `Game`: Mongoose model for storing game data in MongoDB.

## Dependencies

This project uses the following dependencies:

*   Next.js
*   pnpm
*   Zustand
*   NextAuth.js
*   Tailwind CSS
*   Mongoose
*   lucide-react
*   next-themes


LICENSE IDK LOL