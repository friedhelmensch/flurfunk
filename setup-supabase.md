# Supabase Setup Guide

## Method 1: CLI Setup (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to remote project (after creating in dashboard)
supabase link --project-ref YOUR_PROJECT_ID

# Push schema
supabase db push
```

## Method 2: Manual Setup (Recommended)

1. **Create Project:**
   - Visit https://supabase.com/dashboard
   - New Project → Name: "flurfunk"
   - Choose region & password

2. **Run Schema:**
   - Go to SQL Editor in dashboard
   - Copy/paste content from `api/db/schema.sql`
   - Click "Run"

3. **Get Credentials:**
   - Settings → API
   - Copy Project URL and anon key

4. **Test Database:**
   ```sql
   -- Test the function works
   SELECT * FROM get_nearby_messages(37.7749, -122.4194, 5);
   ```

## Environment Variables

Create `.env.local`:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

For Vercel deployment, add these in Vercel dashboard under Environment Variables.