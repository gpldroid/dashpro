# DashPro

DashPro is a Next.js application for building Blogger XML templates and modern static websites.

## Stack

- Next.js App Router + TypeScript
- React
- Tailwind CSS v4
- Supabase SSR/Auth/PostgreSQL
- Monaco Editor
- dnd-kit
- Lucide React

## Local setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local`.
3. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Install dependencies with `npm install`.
5. Start the development server with `npm run dev`.

The application uses separate browser/server Supabase clients under `src/lib/supabase/`, following the current `@supabase/ssr` approach for Next.js.

## Security

Only the Supabase URL and publishable key belong in client configuration. Never expose a Supabase secret/service_role key in source control, browser code, or `NEXT_PUBLIC_*` variables.
