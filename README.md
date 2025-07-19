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
