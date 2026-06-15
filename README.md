# Portopolio

## Local development

This project now uses a Vercel serverless API at `api/ratings.js`.

1. Install dependencies:
   ```bash
   npm install
   ```
2. If you have the Vercel CLI, run:
   ```bash
   npm run dev
   ```
3. Open the local preview URL shown by Vercel.

If you don't use the Vercel CLI, deploy directly to Vercel and the API will work automatically.

## Remote rating storage (external DB)

This project now requires an external Supabase database for rating storage. Local file fallback is no longer supported for the production API.

### Serverless deployment

The app includes a serverless API endpoint at `api/ratings.js`, which is compatible with Vercel.

### Environment variables

Set these variables in your host environment or Vercel dashboard:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_TABLE=ratings
```

### Supabase table schema

Create a table named `ratings` with at least these columns:

- `id` (uuid, primary key, default `gen_random_uuid()`)
- `rating` (integer)
- `created_at` (timestamp with time zone, default `now()`)

### How it works

- The serverless function requires `SUPABASE_URL` and `SUPABASE_KEY` to work.
- Local file storage is not used by the production API.
- The same API endpoints are exposed through Vercel serverless routing:
  - `GET /api/ratings`
  - `POST /api/ratings`

### Deploying to Vercel

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_TABLE=ratings`
4. Deploy.

If you want, I can also update the frontend to use a relative API path that works more cleanly on Vercel without requiring a separate Express server.
