# Quiz Insanity

A Vue 3.5 + Vite web app that generates quiz questions from website URLs using OpenAI. Features user profiles, quiz creation, and quiz taking with modern dark UI.

## Features

- 🎯 **AI-Powered Quiz Generation**: Generate intelligent quizzes from any website using OpenAI
- 👤 **User Profiles**: Manage user information and preferences
- 📝 **Quiz Creation**: Create quizzes by providing website URLs
- 🎮 **Interactive Quiz Taking**: Take quizzes with real-time scoring and feedback
- 💾 **Local Storage**: All data persists locally in the browser
- 🌙 **Dark Mode**: Modern dark theme by default
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Hybrid Architecture**: Server-side CORS proxy with client-side parsing for optimal performance

## Tech Stack

- **Frontend**: Vue 3.5 + Vite + TypeScript
- **Styling**: TailwindCSS 4
- **State Management**: Pinia with localStorage persistence
- **Backend**: Netlify Functions (serverless)
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Netlify

## Quick Start

### Prerequisites

- **Node.js 18+** (recommended: use nvm for version management)
- OpenAI API key

### Installation

1. **Install nvm (Node Version Manager)**

   ```bash
   # macOS/Linux
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Windows (using nvm-windows)
   # Download from: https://github.com/coreybutler/nvm-windows/releases
   ```

2. **Install and use the correct Node.js version**

   ```bash
   # Install Node.js 18
   nvm install 18
   nvm use 18

   # Set as default (optional)
   nvm alias default 18
   ```

3. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quiz-insanity
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

6. **Start development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## Environment Variables

### Required for Development

Create a `.env` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### Required for Production (Netlify)

Set these environment variables in your Netlify dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:functions` - Build Netlify functions
- `npm run preview` - Preview production build

### Project Structure

```
quiz-insanity/
├── src/
│   ├── components/          # Vue components
│   │   ├── Layout.vue       # Main layout component
│   │   ├── HomePage.vue     # Landing page
│   │   ├── UserProfileForm.vue # User profile management
│   │   ├── QuizCreator.vue  # Quiz creation interface
│   │   └── QuizTaker.vue    # Quiz taking interface
│   ├── stores/              # Pinia stores
│   │   ├── userProfile.ts   # User profile state
│   │   └── quizzes.ts       # Quiz data state
│   ├── services/            # API services
│   │   ├── api.ts           # Main API service
│   │   └── websiteProxy.ts  # Client-side proxy fallback
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   │   └── storage.ts       # localStorage utilities
│   └── router/              # Vue Router configuration
├── netlify/
│   └── functions/           # Netlify serverless functions
│       ├── cors-proxy.ts    # CORS proxy for website fetching
│       └── generate-quiz.ts # OpenAI quiz generation
├── tsconfig.functions.json  # TypeScript config for functions
└── public/                  # Static assets
```

## Architecture

### Hybrid Approach

The app uses a hybrid architecture for optimal performance and reliability:

1. **CORS Proxy** (`cors-proxy.ts`)
   - Server-side function that fetches website HTML
   - Bypasses CORS restrictions
   - Returns raw HTML to client

2. **Client-Side Parsing** (`api.ts`)
   - Parses HTML using browser's DOMParser
   - Extracts title and cleans text content
   - Removes unwanted elements (scripts, styles, nav, etc.)

3. **Fallback System**
   - If CORS proxy fails → falls back to client-side proxy
   - Multiple layers of reliability

### Benefits

- **⚡ Fast**: Client-side parsing is instant
- **🛡️ Reliable**: Multiple fallback options
- **📱 Scalable**: Server handles fetching, client handles parsing
- **🔧 Maintainable**: Clean separation of concerns

## Deployment

### Netlify (Recommended)

1. **Connect your repository** to Netlify
2. **Set environment variables** in Netlify dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
3. **Deploy automatically** on push to main branch

### Manual Deployment

1. **Build the project**

   ```bash
   npm run build
   npm run build:functions
   ```

2. **Deploy to your hosting provider**
   - Upload the `dist` folder
   - Deploy Netlify functions
   - Configure environment variables

## API Endpoints

The app uses Netlify Functions for backend operations:

- `POST /.netlify/functions/cors-proxy` - Fetch website HTML content
- `POST /.netlify/functions/generate-quiz` - Generate quiz using OpenAI

## Troubleshooting

### Node.js Version Issues

If you encounter Node.js version issues:

```bash
# Check current Node.js version
node --version

# Use nvm to switch to the correct version
nvm use 18

# If you don't have Node.js 18 installed
nvm install 18
nvm use 18
```

### Build Issues

If you encounter build issues:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild functions
npm run build:functions

# Build the project
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
