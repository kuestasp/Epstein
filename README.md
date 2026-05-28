# Dusk + Valorink + Kindling

Three self-contained dating site mockups in one repo. **Dusk** is the real one with logins; the other two are static mockups.

| File | What it is |
|------|------------|
| `index.html` | **Dusk** — meetup site with real auth (Google + email/password), profiles, matches, real-time chat |
| `valorink.html` | Valorant agent-select-style dating mockup (static, no login) |
| `kindling.html` | General Tinder-style dating mockup (static, no login) |
| `firebase-config.js` | Fill this in to enable real logins on Dusk |
| `netlify.toml` | Netlify deploy config |
| `dusk-site.zip` | Pre-bundled zip for Netlify Drop |

---

## Quick Deploy to Netlify

### Easiest path (works on phone)

1. Download `dusk-site.zip` from this repo.
2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop) on phone or desktop.
3. Drop the zip in — Netlify hands you a live URL in ~10 seconds.
4. The site runs in **demo mode** until you wire up Firebase (next section).

### Or connect the repo

1. [https://app.netlify.com/start](https://app.netlify.com/start) → GitHub → pick `kuestasp/Epstein`.
2. Branch: `claude/session-title-request-2rxJc`. Publish dir: `.` (auto-detected from `netlify.toml`).
3. Deploy.

---

## Enable real Google + Email login on Dusk

Without Firebase set up, Dusk works in **demo mode** — logins are simulated, data is stored in your browser only. To make it real:

### 1. Create a Firebase project (free, 5 min)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Name it whatever (e.g. "dusk-app"). Skip Google Analytics if you want.
3. In the project, click the **web icon (`</>`)** to register a web app.
4. Copy the `firebaseConfig` object Firebase shows you.

### 2. Paste config into `firebase-config.js`

Open `firebase-config.js` in this repo and replace the placeholder values with your real ones. Commit the change (or include it in the zip before uploading to Netlify Drop).

### 3. Enable Auth providers

In the Firebase console:

- **Build → Authentication → Get started.**
- **Sign-in method** tab → enable **Google** (click it, set support email, save).
- Same tab → enable **Email/Password** → save.

### 4. Create Firestore database

- **Build → Firestore Database → Create database.**
- Start in **Test mode** for now (locks open after 30 days — see security rules below).
- Pick a location near your users → Done.

### 5. Authorize your Netlify domain

- Firebase Auth **Settings → Authorized domains** → **Add domain** → paste your Netlify URL (e.g. `your-site.netlify.app`).
- Also add `localhost` if you want to test locally.

### 6. Redeploy

Drag the zip back to Netlify Drop (or push the updated `firebase-config.js`). Google login now works for real.

---

## Firestore Security Rules (production)

When you're past the 30-day test mode, paste these into Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone signed in can read profiles; only the owner can write theirs.
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // Only the swiper can read/write their own likes.
    match /likes/{uid}/sent/{otherUid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Matches: readable/writable only by the two users involved.
    match /matches/{matchId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.users;
      allow create: if request.auth != null
        && request.auth.uid in request.resource.data.users;

      match /messages/{msgId} {
        allow read: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.users;
        allow create: if request.auth != null
          && request.auth.uid == request.resource.data.from
          && request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.users;
      }
    }
  }
}
```

---

## Local preview

```bash
python3 -m http.server 8000
# then http://localhost:8000
```

Demo mode kicks in automatically until you fill in `firebase-config.js`.

---

## Mobile

All three pages are mobile-responsive — deck resizes with viewport, touch-drag swipes work on iOS/Android.
