# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## PWA (Progressive Web App) Support

This app is a PWA. You can install it on your device:

- On desktop: Click the install icon in your browser address bar (if available).
- On mobile: Use the browser menu to "Add to Home Screen".

The app works offline for previously visited pages and static assets.

## Visitor Counter Setup

To enable the visitor counter, run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE visitor_stats (
  id SERIAL PRIMARY KEY,
  visit_count BIGINT NOT NULL DEFAULT 0,
  last_visited TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO visitor_stats (visit_count) VALUES (0);
ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON visitor_stats FOR ALL USING (true);

-- Create a function for atomic increment
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS bigint AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE visitor_stats SET visit_count = visit_count + 1, last_visited = NOW() WHERE id = 1 RETURNING visit_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql VOLATILE;
```

This will allow the homepage to increment and display the total visitor count.

# UPSC 2025 Application

A comprehensive UPSC preparation application with previous year question papers, current affairs, and species in news.

## Features

- **Previous Year Question Papers**: Access and view UPSC question papers with answer keys
- **Current Affairs**: Stay updated with latest current affairs
- **Species in News**: Track species mentioned in current affairs
- **Bookmarks**: Save important content for later reference
- **Authentication**: Secure login with email/password and Google OAuth
- **Responsive Design**: Works on desktop and mobile devices
- **PWA Support**: Install as a progressive web app

## Authentication

The application supports multiple authentication methods:

### Email/Password Authentication
- Traditional email and password registration/login
- Email verification required for new accounts

### Google OAuth Authentication
- One-click login with Google account
- No password required
- Automatic account creation for new users

#### Setting up Google OAuth

1. Follow the detailed setup guide in [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
2. Configure Google Cloud Console OAuth credentials
3. Enable Google provider in Supabase dashboard
4. Set up redirect URLs for your domain

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console project (for OAuth)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd upsc2025
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── GoogleLoginButton.tsx  # Google OAuth button component
│   └── Navbar.tsx      # Navigation component
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state management
│   └── useToast.ts     # Toast notifications
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Page components
│   ├── AuthCallback.tsx # OAuth callback handler
│   ├── LoginPage.tsx   # Login page
│   └── RegisterPage.tsx # Registration page
└── App.tsx             # Main application component
```

## Authentication Flow

1. **Login/Register Pages**: Users can choose between email/password or Google OAuth
2. **Google OAuth Flow**: 
   - User clicks "Continue with Google"
   - Redirected to Google consent screen
   - After authorization, redirected to `/auth/callback`
   - AuthCallback component handles the OAuth response
   - User is redirected to home page on success
3. **Session Management**: The `useAuth` hook manages authentication state across the app

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Create custom hooks in `src/hooks/` for reusable logic
4. Update routing in `src/App.tsx`

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

3. Update environment variables in your hosting platform

4. Configure Google OAuth redirect URLs for your production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
