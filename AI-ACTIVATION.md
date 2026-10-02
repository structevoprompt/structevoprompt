# Structevo AI Image Generation Activation

The website UI and Vercel API route are included. To activate live image generation in Vercel, add these Environment Variables to the project:

- `STRUCTEVO_IMAGE_API_ENABLED` = `true`
- `OPENAI_API_KEY` = your server-side OpenAI API key
- `STRUCTEVO_ALLOWED_ORIGIN` = `https://structevo.com`
- `STRUCTEVO_IMAGE_MODEL` = `gpt-image-2` (optional; this is the package default)

For protected generation with real user accounts, also add:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The browser never receives `OPENAI_API_KEY`; it stays inside the Vercel Function.

The public frontend file `auth-config.js` should contain the Supabase project URL and publishable key once the Supabase project is created.

## Safe test mode
For a short private test only, you can set `STRUCTEVO_ALLOW_UNAUTHENTICATED=true`. Do **not** leave that enabled on a public site because anyone could call the paid image endpoint. The recommended public setup is Supabase authentication plus server-side usage limits before billing is activated.
