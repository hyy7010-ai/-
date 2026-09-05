import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://davgzdedqhkgmydzvvcy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmd6ZGVkcWhrZ215ZHp2dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc1ODEsImV4cCI6MjA4OTYzMzU4MX0.tdJFt8l-4siMS3ljUJjBSBBDi4hJwhzMKR4ZQPXddrI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/auth/url', async (req, res) => {
    const provider = req.query.provider as string || 'google';
    
    // Construct the redirect URI dynamically based on the request host
    // This ensures it works correctly in the AI Studio preview environment
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const redirectUri = `${protocol}://${host}/auth/callback`;

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          skipBrowserRedirect: true,
          redirectTo: redirectUri
        }
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (data?.url) {
        res.json({ url: data.url });
      } else {
        res.status(500).json({ error: 'Failed to generate auth URL' });
      }
    } catch (error: any) {
      console.error('Server error generating auth URL:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Callback route to handle the redirect from the OAuth provider
  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    // We don't need to exchange the code here because Supabase's client library
    // handles the hash fragment on the client side.
    // We just need to serve a page that notifies the opener window and closes itself.
    res.send(`
      <html>
        <head>
          <title>Authentication Successful</title>
        </head>
        <body style="background-color: #050505; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <h2>Authentication Successful!</h2>
            <p>You can close this window now.</p>
            <script>
              // The Supabase client in the main window will automatically detect the session
              // from local storage once it's set.
              
              // We need to parse the hash fragment to get the session data
              // and store it in local storage so the main window can pick it up.
              const hash = window.location.hash;
              if (hash) {
                // The actual session setting is handled by the Supabase client
                // We just need to notify the parent window to check for the session
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                } else {
                  window.location.href = '/';
                }
              } else {
                // If there's no hash, maybe it was a query param error
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                }
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
