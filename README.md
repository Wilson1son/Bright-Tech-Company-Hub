# Bright Technologies Company Hub

A prototype internal dashboard built for my application to Bright Technologies, an Abeokuta-based Wi-Fi, security, solar, and web solutions provider (brighttechworld.com).

## Scope, matched to their real services
Bright Technologies offers more than internet access: Wi-Fi/Hotspot, Enterprise Networks, CCTV & Security, Solar Energy, and Web Application/Website Design. The Installation Records tab reflects this, with a service type on every record instead of assuming every job is a router install.

Note: Bright Technologies already runs a customer-facing Self-Care Portal (portal.brighttechworld.com) for subscriber billing and account management. This Company Hub is intentionally internal-only and does not duplicate that, it is a staff tool, not a customer one.

## Connect it to a real database (Installations tab)
The Installation Records tab can run against a real Supabase database instead of demo data. Every other tab (Support, HR, Inventory, Sales, Finance) still runs on in-memory demo data for now.

1. Create a free project at https://supabase.com.
2. In the Supabase dashboard, open the SQL Editor and run everything inside `supabase_schema.sql` (included in this project). This creates the `installations` table and adds a few starter rows.
3. In Supabase, go to Project Settings -> API and copy the Project URL and the anon public key.
4. Copy `.env.example` to a new file named `.env`, and paste those two values in.
5. Run `npm install` then `npm run dev`. The Installations tab will show "Connected to live database" once it's working. Without a `.env` file, it falls back to demo mode automatically, so the app still works for a quick preview.

## Run it locally
```
npm install
npm run dev
```
Then open the local address it prints (usually http://localhost:5173).

## Deploy it for free (Vercel)
1. Push this folder to a new GitHub repository (the `.env` file is gitignored on purpose, never commit real keys).
2. Go to https://vercel.com, sign in with GitHub.
3. Click "New Project," select your repository, and click Deploy.
4. In the Vercel project settings, add the same two environment variables from your `.env` file (Settings -> Environment Variables), then redeploy.
5. Vercel auto-detects Vite and builds it. You'll get a live link like `bright-toolkit.vercel.app`.

## Push to GitHub from scratch
```
git init
git add .
git commit -m "Bright Technologies company hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bright-company-hub.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username, and create the empty repository on GitHub first.

## What's real vs. what's a demo
- Installations: real, once connected to Supabase using the steps above.
- Support, HR, Inventory, Sales, Finance: interface and interactions are fully functional, but the data is in-memory demo data that resets on refresh.
- Role based sign in on the landing page controls which tabs are visible. It is a demo of the concept, not real authentication or server side security.
