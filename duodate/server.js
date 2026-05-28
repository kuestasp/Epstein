require('dotenv').config();
const express          = require('express');
const session          = require('express-session');
const Database         = require('better-sqlite3');
const { OAuth2Client } = require('google-auth-library');
const path             = require('path');
const multer           = require('multer');
const fs               = require('fs');

const PORT = process.env.PORT || 3000;
const app  = express();

// ===== ensure uploads dir =====
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ===== DATABASE =====
const db = new Database(path.join(__dirname, 'data.sqlite'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    provider        TEXT NOT NULL,
    provider_id     TEXT NOT NULL,
    email           TEXT,
    name            TEXT,
    avatar          TEXT,
    bio             TEXT DEFAULT '',
    age             INTEGER,
    gender          TEXT,
    looking_for     TEXT,
    riot_id         TEXT,
    valorant_rank   TEXT,
    main_role       TEXT,
    main_agents     TEXT,
    other_games     TEXT,
    discord_tag     TEXT,
    playstyle       TEXT,
    seeking         TEXT,
    timezone        TEXT,
    created_at      INTEGER DEFAULT (strftime('%s','now')),
    UNIQUE(provider, provider_id)
  );
  CREATE TABLE IF NOT EXISTS likes (
    from_user  INTEGER NOT NULL,
    to_user    INTEGER NOT NULL,
    action     TEXT NOT NULL DEFAULT 'like',
    created_at INTEGER DEFAULT (strftime('%s','now')),
    PRIMARY KEY (from_user, to_user)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user  INTEGER NOT NULL,
    to_user    INTEGER NOT NULL,
    body       TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );
`);

// ===== MIDDLEWARE =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 }
}));
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(req.session.userId)
    : null;
  next();
});

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ===== AUTH HELPERS =====
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

function requireProfile(req, res, next) {
  const u = db.prepare('SELECT age, valorant_rank FROM users WHERE id = ?').get(req.session.userId);
  if (!u || !u.age) return res.redirect('/profile/edit?onboarding=1');
  next();
}

// ===== ROUTES: PUBLIC =====
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/browse');
  res.render('landing');
});

app.get('/login', (req, res) => res.render('login', { err: req.query.err }));

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ===== ROUTES: GOOGLE OAUTH =====
app.get('/auth/google', (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'online',
    scope: ['profile', 'email'],
    prompt: 'select_account'
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('/login?err=nocode');
    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken:  tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const p = ticket.getPayload();

    let user = db.prepare(
      'SELECT id FROM users WHERE provider = ? AND provider_id = ?'
    ).get('google', p.sub);

    if (!user) {
      const r = db.prepare(`
        INSERT INTO users (provider, provider_id, email, name, avatar)
        VALUES (?, ?, ?, ?, ?)
      `).run('google', p.sub, p.email, p.name, p.picture);
      user = { id: r.lastInsertRowid };
    }
    req.session.userId = user.id;
    res.redirect('/profile/edit?onboarding=1');
  } catch (e) {
    console.error('[oauth]', e.message);
    res.redirect('/login?err=oauth');
  }
});

// ===== ROUTES: PROFILE =====
app.get('/profile/edit', requireAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  res.render('profile_edit', { user: u, onboarding: req.query.onboarding === '1' });
});

app.post('/profile/edit', requireAuth, upload.single('photo'), (req, res) => {
  const {
    bio, age, gender, looking_for,
    riot_id, valorant_rank, main_role, main_agents,
    other_games, discord_tag, playstyle, seeking, timezone
  } = req.body;

  const fields = [
    'bio = ?', 'age = ?', 'gender = ?', 'looking_for = ?',
    'riot_id = ?', 'valorant_rank = ?', 'main_role = ?', 'main_agents = ?',
    'other_games = ?', 'discord_tag = ?', 'playstyle = ?', 'seeking = ?', 'timezone = ?'
  ];
  const vals = [
    (bio || '').slice(0, 500),
    parseInt(age) || null,
    gender || '',
    looking_for || '',
    (riot_id || '').slice(0, 40),
    valorant_rank || '',
    main_role || '',
    (main_agents || '').slice(0, 200),
    (Array.isArray(other_games) ? other_games.join(',') : (other_games || '')).slice(0, 200),
    (discord_tag || '').slice(0, 40),
    playstyle || '',
    seeking || '',
    timezone || ''
  ];

  if (req.file) {
    fields.push('avatar = ?');
    vals.push('/uploads/' + req.file.filename);
  }
  vals.push(req.session.userId);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  res.redirect('/browse');
});

// ===== ROUTES: BROWSE =====
app.get('/browse', requireAuth, requireProfile, (req, res) => {
  const me   = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const rank = req.query.rank || '';
  const role = req.query.role || '';
  const game = req.query.game || '';

  let sql = `
    SELECT * FROM users
    WHERE id != ?
      AND id NOT IN (SELECT to_user FROM likes WHERE from_user = ?)
      AND age IS NOT NULL
  `;
  const args = [me.id, me.id];
  if (rank) { sql += ' AND valorant_rank = ?'; args.push(rank); }
  if (role) { sql += ' AND main_role = ?';     args.push(role); }
  if (game) { sql += " AND other_games LIKE ?"; args.push('%' + game + '%'); }
  sql += ' ORDER BY RANDOM() LIMIT 1';

  const candidate = db.prepare(sql).get(...args);
  res.render('browse', { me, candidate, filters: { rank, role, game } });
});

app.post('/like/:id', requireAuth, (req, res) => {
  const toId   = parseInt(req.params.id);
  const fromId = req.session.userId;
  if (!toId || toId === fromId) return res.redirect('/browse');
  db.prepare(`
    INSERT OR REPLACE INTO likes (from_user, to_user, action) VALUES (?, ?, 'like')
  `).run(fromId, toId);
  const back = db.prepare(`
    SELECT 1 FROM likes WHERE from_user = ? AND to_user = ? AND action = 'like'
  `).get(toId, fromId);
  if (back) return res.redirect('/matches?new=' + toId);
  res.redirect('/browse');
});

app.post('/skip/:id', requireAuth, (req, res) => {
  const toId = parseInt(req.params.id);
  db.prepare(`
    INSERT OR REPLACE INTO likes (from_user, to_user, action) VALUES (?, ?, 'skip')
  `).run(req.session.userId, toId);
  res.redirect('/browse');
});

// ===== ROUTES: MATCHES =====
app.get('/matches', requireAuth, requireProfile, (req, res) => {
  const me = req.session.userId;
  const matches = db.prepare(`
    SELECT u.* FROM users u
    WHERE u.id IN (
      SELECT to_user FROM likes WHERE from_user = ? AND action = 'like'
        AND to_user IN (SELECT from_user FROM likes WHERE to_user = ? AND action = 'like')
    )
  `).all(me, me);
  res.render('matches', { matches, newId: req.query.new });
});

// ===== ROUTES: CHAT =====
app.get('/chat/:id', requireAuth, requireProfile, (req, res) => {
  const me   = req.session.userId;
  const them = parseInt(req.params.id);

  const a = db.prepare(`SELECT 1 FROM likes WHERE from_user = ? AND to_user = ? AND action = 'like'`).get(me, them);
  const b = db.prepare(`SELECT 1 FROM likes WHERE from_user = ? AND to_user = ? AND action = 'like'`).get(them, me);
  if (!a || !b) return res.redirect('/matches');

  const other = db.prepare('SELECT * FROM users WHERE id = ?').get(them);
  const msgs  = db.prepare(`
    SELECT * FROM messages
    WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)
    ORDER BY created_at ASC
  `).all(me, them, them, me);
  res.render('chat', { me, other, msgs });
});

app.post('/chat/:id', requireAuth, (req, res) => {
  const me   = req.session.userId;
  const them = parseInt(req.params.id);
  const body = (req.body.body || '').trim();
  if (!body) return res.redirect('/chat/' + them);

  const a = db.prepare(`SELECT 1 FROM likes WHERE from_user = ? AND to_user = ? AND action = 'like'`).get(me, them);
  const b = db.prepare(`SELECT 1 FROM likes WHERE from_user = ? AND to_user = ? AND action = 'like'`).get(them, me);
  if (a && b) {
    db.prepare('INSERT INTO messages (from_user, to_user, body) VALUES (?, ?, ?)')
      .run(me, them, body.slice(0, 1000));
  }
  res.redirect('/chat/' + them);
});

app.listen(PORT, () => {
  console.log(`╔════════════════════════════════════════╗`);
  console.log(`║  DuoDate running on port ${PORT}          ║`);
  console.log(`║  → http://localhost:${PORT}                ║`);
  console.log(`╚════════════════════════════════════════╝`);
});
