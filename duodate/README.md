# DuoDate

**Find your duo. Date your duo.** A gamer dating site built around Valorant + other games — real Google OAuth login, profile setup with rank/role/agents/other-games-played, filter-and-swipe browsing, mutual-like matching, in-app chat.

## What's in the box

```
duodate/
├── server.js              ← Express server, all routes, OAuth, DB
├── package.json
├── .env.example           ← copy to .env and fill in
├── public/
│   ├── styles.css         ← Valorant-themed dark UI
│   └── uploads/           ← user profile pics land here
└── views/
    ├── landing.ejs        ← landing page
    ├── login.ejs          ← Google sign-in
    ├── profile_edit.ejs   ← profile (Valorant rank, role, agents, etc)
    ├── browse.ejs         ← swipe-style browse with filter bar
    ├── matches.ejs        ← your mutual likes
    └── chat.ejs           ← in-app messaging
```

The database (`data.sqlite`) is created automatically on first run.

## Setup (5 mins)

### 1. Install Node.js

You need Node 18 or newer. Get it from https://nodejs.org if you don't have it.

### 2. Get Google OAuth credentials

1. Go to https://console.cloud.google.com
2. Click **New Project** → name it "DuoDate" (or anything)
3. Left sidebar → **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: DuoDate
   - User support email: your email
   - Save through the rest of the steps
4. Left sidebar → **Credentials** → **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
   - Click Create
5. Copy the **Client ID** and **Client Secret** — you'll paste them into `.env` next

### 3. Configure

```bash
cd duodate
cp .env.example .env
```

Open `.env` in any text editor and fill in:

```
GOOGLE_CLIENT_ID=<paste your client ID>
GOOGLE_CLIENT_SECRET=<paste your client secret>
SESSION_SECRET=<any long random string>
```

### 4. Install + run

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser. Click **Get In Queue** → **Continue with Google** → sign in with any Google account → fill in your gamer profile → start swiping.

To test the matching, sign in with a 2nd Google account in an incognito window, complete that profile, like the first user — both sides like = it shows up in **Matches** for both, and you can chat.

## Profile fields

- **Basics**: name (from Google), age, gender, looking for, timezone, photo
- **Valorant**: Riot ID, rank (Iron → Radiant), main role (Duelist/Controller/Sentinel/Initiator/Flex), main agents, playstyle
- **Other games**: League, CS2, Apex, Overwatch, Fortnite, R6, Dota, Rocket League, Minecraft, Roblox, Marvel Rivals, Deadlock
- **About**: Discord tag (shared after match), what you're looking for (duo / 5-stack / dating / open), bio

## Browse filters

- By Valorant rank
- By main role
- By other games played

## Deploy to a real domain

1. Push to GitHub
2. Connect to Render.com / Railway / Fly.io (free tiers work fine)
3. Set the env vars in the host's dashboard
4. In Google Cloud Console → Credentials → your OAuth client → add your production URL to **Authorized redirect URIs**:
   - `https://your-domain.com/auth/google/callback`
5. Update `GOOGLE_REDIRECT_URI` in production env vars to match

## Adding more login providers

The OAuth pattern in `server.js` is easy to extend. To add Discord:

```bash
npm i passport passport-discord
```

Then add ~30 lines for the route and strategy. Tell me which providers you want and I'll write the diff.

## Stack

- **Node.js** + **Express** — backend
- **EJS** — templating
- **better-sqlite3** — embedded database, zero setup
- **google-auth-library** — official Google OAuth library
- **multer** — file uploads
- **express-session** — login session cookies

No frontend framework, no build step, no Docker required to run locally. Just `npm install && npm start`.
