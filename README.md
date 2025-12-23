# Second London

A micro-opportunity network for London. Connect with your community through short-lived moments - needs, offers, free items, and skill swaps.

## Features

- **Time-Limited Moments**: Posts expire in 2-12 hours for urgency
- **Feed-Based Discovery**: Browse nearby, ending soon, verified, free, and swap feeds
- **Trust & Safety**: Trust levels, verified badges, quiet mode, and reporting
- **Secure Messaging**: Real-time chat unlocks after application acceptance
- **Location Privacy**: Shows approximate areas and distance bands, not exact coordinates
- **Reviews & Ratings**: Build reputation through completed moments

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + PostGIS, Auth, Realtime, Storage, Edge Functions)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Design**: BeReal-inspired minimal, dark-first UI

## Prerequisites

- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))

## Setup Instructions

### 1. Clone and Install

```bash
cd "d:/Projects/2nd London"
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migrations

In your Supabase project dashboard, go to the SQL Editor and run each migration file in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates tables and indexes
2. `supabase/migrations/002_rls_policies.sql` - Sets up Row Level Security
3. `supabase/migrations/003_views.sql` - Creates public views
4. `supabase/migrations/004_triggers.sql` - Adds database triggers
5. `supabase/migrations/005_rpc_functions.sql` - Creates RPC functions

**Important**: Make sure PostGIS extension is enabled. If you get errors about PostGIS, run this first:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 5. Configure Authentication

In Supabase Dashboard > Authentication > Providers:

1. Enable **Email** provider
2. Configure email templates (optional but recommended)
3. Set up email redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/app/feed`

### 6. Deploy Edge Function (Optional but Recommended)

Install Supabase CLI:

```bash
npm install -g supabase
```

Login and link your project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

Deploy the expire-moments function:

```bash
supabase functions deploy expire-moments
```

Set up a cron job in Supabase Dashboard > Database > Cron Jobs:

```sql
SELECT cron.schedule(
  'expire-moments-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/expire-moments',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── (marketing)/         # Landing page
│   ├── auth/                # Authentication
│   ├── onboarding/          # User onboarding
│   └── app/                 # Main application
│       ├── feed/            # Nearby feed
│       ├── ending-soon/     # Ending soon feed
│       ├── verified/        # Verified-only feed
│       ├── free/            # Free stuff feed
│       ├── swaps/           # Skill swaps feed
│       ├── moments/         # Moment creation & detail
│       ├── inbox/           # Messaging
│       ├── profile/         # User profile
│       ├── safety/          # Safety center
│       └── admin/           # Admin dashboard
├── components/              # React components
│   ├── layout/             # Navigation & app shell
│   ├── moments/            # Moment cards
│   └── providers/          # Context providers
├── lib/                    # Utilities & hooks
│   ├── supabase/          # Supabase clients
│   ├── hooks/             # React hooks
│   └── utils/             # Helper functions
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── functions/         # Edge Functions
└── types/                 # TypeScript types
```

## Key Features Implementation

### Feeds

All feeds use the `get_feed()` RPC function which:
- Filters by mode (nearby, ending_soon, free, swaps, verified)
- Calculates distance bands from user location
- Sorts appropriately (distance, expiry, etc.)
- Returns safe public data only

### Quiet Mode

- Applicants can only send a 240-character message
- Full chat unlocks only after creator accepts application
- Prevents spam and unwanted messages

### Trust & Safety

- **Trust Levels (0-5)**: Built through completed moments and reviews
- **Rate Limiting**: New users limited to 3 moments/hour, 10 applications/hour
- **Verified Badge**: Identity confirmation (manual process)
- **Reports**: Users can report moments, messages, or other users
- **Admin Dashboard**: Moderators review and action reports

### Location Privacy

- Exact lat/lng stored in database but never exposed to clients
- Public views exclude location data
- Distance bands shown: "< 1 mi", "1-2 mi", "2-3 mi", "3+ mi"
- Approximate area labels: "Near Stratford", "Camden area"

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Update Supabase redirect URLs to include your production domain.

### Production Checklist

- [ ] Set up custom domain
- [ ] Configure email provider (SendGrid, etc.)
- [ ] Set up Supabase cron job for expiry automation
- [ ] Enable Supabase database backups
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure rate limiting in Supabase
- [ ] Review and test all RLS policies
- [ ] Set up admin user roles
- [ ] Test email flows
- [ ] Enable Supabase Storage for avatars

## Database Schema

### Core Tables

- **profiles**: User profiles with trust levels and ratings
- **moments**: Time-limited posts (needs/offers/free/swap)
- **applications**: User applications to moments
- **conversations**: Chat sessions between users
- **messages**: Real-time messages
- **reviews**: Ratings after completion
- **reports**: User-generated safety reports
- **notifications**: In-app notifications
- **roles**: User role management (user/admin)

### Security

All tables have Row Level Security (RLS) enabled:
- Users can only read/write their own data
- Public data accessed via secure views
- Admin-only tables protected by role checks

## API Reference

### RPC Functions

#### `get_feed(user_lat, user_lng, mode, feed_limit, feed_offset, verified_only)`

Returns filtered and sorted moments.

**Modes**: 'nearby', 'ending_soon', 'free', 'swaps', 'verified'

#### `can_create_moment(user_id)`

Checks if user can create a moment (rate limiting).

#### `can_apply(user_id)`

Checks if user can apply to moments (rate limiting).

#### `get_distance_band(lat1, lng1, lat2, lng2)`

Returns distance category label.

## Contributing

This is a demonstration project. For production use:

1. Implement proper geocoding for location input
2. Add image upload for moments and profiles
3. Implement push notifications
4. Add comprehensive testing
5. Set up proper monitoring and analytics
6. Implement verification flow
7. Add payment processing if needed

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the London community.
