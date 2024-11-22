# MoodMix 🎵 ☀️

A dynamic web application that creates personalized Spotify playlists based on your current weather and mood. MoodMix combines weather data, mood analysis, and music recommendations to deliver the perfect soundtrack for your day.

## Features ✨

- **Weather-Based Music** - Get music recommendations that match your local weather
- **Mood Analysis** - AI-powered chat interface to analyze your mood and suggest fitting genres
- **Spotify Integration** - Create and save custom playlists directly to your Spotify account
- **Location Services** - Use your current location or search for any city
- **Cultural Insights** - Learn about the connection between weather, location, and music
- **Real-time Updates** - Refresh recommendations as weather changes

## Tech Stack 🛠️

- **Frontend:**

  - Next.js 13+ (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components

- **Backend:**

  - Next.js API Routes
  - OpenAI API (GPT-3.5 Turbo)
  - Spotify Web API
  - OpenWeather API

- **Authentication:**
  - NextAuth.js with Spotify OAuth

## Getting Started 🚀

### Prerequisites

- Node.js 16+
- npm or yarn
- Spotify Developer Account
- OpenAI API Key
- OpenWeather API Key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/GGill97/mood-mix.git
cd moodmix
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file with the following variables:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify
OPENAI_API_KEY=your_openai_api_key
NEXT_OPENWEATHER_API_KEY=your_openweather_api_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure 📁

```
src/
├── app/              # Next.js 13+ app directory
├── components/       # React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## Testing 🧪

MoodMix uses a comprehensive testing suite to ensure reliability and functionality.

### Test Structure

```
tests/
├── components/        # Component tests
│   ├── Chat/         # Chat component tests
│   ├── Music/        # Music component tests
│   └── Weather/      # Weather component tests
├── hooks/            # Custom hooks tests
├── integration/      # Integration tests
└── utils/            # Utility function tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Testing Stack

- Jest
- React Testing Library
- MSW (Mock Service Worker)
- Testing Library User Event

### Coverage Goals

- Core utilities: 90%+ coverage
- Components: 85%+ coverage
- Custom hooks: 80%+ coverage
- Integration flows: Full coverage of critical paths

### Example Test

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "@/components/Search/SearchBar";

describe("SearchBar", () => {
  test("handles user input correctly", () => {
    render(<SearchBar onSearch={jest.fn()} />);
    const input = screen.getByPlaceholderText("Search for a city...");
    fireEvent.change(input, { target: { value: "London" } });
    expect(input).toHaveValue("London");
  });
});
```

## Key Features Explained 🔑

### Weather Integration

- Uses OpenWeather API for accurate weather data
- Reverse geocoding for location detection
- Weather-to-genre mapping algorithm

### Mood Analysis

- Chat interface for mood detection
- OpenAI integration for natural language processing
- Context-aware genre recommendations

### Spotify Integration

- OAuth2 authentication
- Playlist creation and management
- Music recommendations based on genres
- Preview playback functionality

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments 👏

- OpenWeather API for weather data
- Spotify Web API for music integration
- OpenAI for natural language processing
- shadcn/ui for component library
- All contributors and supporters

## Contact 📧

Project Link: [https://github.com/GGill97/mood-mix](https://github.com/GGill97/mood-mix)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
