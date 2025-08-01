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

## Tech Stack

- **Frontend**: Vue 3.5 + Vite + TypeScript
- **Styling**: TailwindCSS 4
- **State Management**: Pinia with localStorage persistence
- **Backend**: Netlify Functions (serverless)
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Netlify

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quiz-insanity
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Environment Variables

### Required for Development

Create a `.env` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Development Configuration
VITE_APP_TITLE=Quiz Insanity
VITE_APP_DESCRIPTION=Generate intelligent quizzes from any website using AI
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
│   ├── stores/             # Pinia stores
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── router/             # Vue Router configuration
├── netlify/
│   └── functions/          # Netlify serverless functions
├── tsconfig.functions.json # TypeScript config for functions
└── public/                 # Static assets
```

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
   ```

2. **Deploy to your hosting provider**
   - Upload the `dist` folder
   - Configure environment variables

## API Endpoints

The app uses Netlify Functions for backend operations:

- `POST /.netlify/functions/parse-website` - Parse website content
- `POST /.netlify/functions/generate-quiz` - Generate quiz using OpenAI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
