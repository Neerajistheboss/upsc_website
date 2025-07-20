# Google OAuth Setup for Supabase

This guide will help you set up Google OAuth authentication for your UPSC application.

## Prerequisites

1. A Supabase project
2. A Google Cloud Console project
3. Your application running locally or deployed

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "UPSC 2025"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email addresses)

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following redirect URIs:
   - For local development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
   - Supabase callback: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Note down the **Client ID** and **Client Secret**

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click "Enable"
4. Enter the Google Client ID and Client Secret from Step 1.3
5. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

### 2.2 Configure Site URL
1. In Supabase dashboard, go to "Authentication" > "Settings"
2. Set the Site URL to your application URL:
   - Local: `http://localhost:5173`
   - Production: `https://yourdomain.com`

### 2.3 Configure Redirect URLs
1. In the same settings page, add redirect URLs:
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

## Step 3: Environment Variables

Make sure your `.env` file contains the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Testing

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/register`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to your app

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console matches exactly
   - Check that the Supabase callback URL is correct

2. **"OAuth consent screen not configured"**
   - Ensure you've completed the OAuth consent screen setup
   - Add your email as a test user

3. **"Client ID not found"**
   - Verify the Client ID and Secret are correctly entered in Supabase
   - Check that the Google Cloud project is active

4. **Redirect loop**
   - Ensure the auth callback route is properly configured
   - Check that the redirect URLs in Supabase match your app URLs

### Debug Steps

1. Check browser console for errors
2. Verify Supabase logs in the dashboard
3. Test with a fresh incognito window
4. Ensure all environment variables are loaded correctly

## Security Considerations

1. **Never commit Client Secret to version control**
2. **Use environment variables for all sensitive data**
3. **Set up proper CORS policies**
4. **Regularly rotate OAuth credentials**
5. **Monitor OAuth usage in Google Cloud Console**

## Production Deployment

When deploying to production:

1. Update Google Cloud Console redirect URIs
2. Update Supabase site URL and redirect URLs
3. Ensure HTTPS is enabled
4. Set up proper domain verification in Google Cloud Console
5. Consider setting up additional security measures

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers) 