require("dotenv").config();
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const { readDb, writeDb } = require("./src/db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const production = process.env.NODE_ENV === "production";
if (production && !process.env.SESSION_SECRET) throw new Error("Set SESSION_SECRET in production.");

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "blogspace.sid",
  secret: process.env.SESSION_SECRET || "local-development-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: production, maxAge: 86400000 }
}));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 60 }));
app.use(express.static(path.join(__dirname, "public")));

const clean = (v, n) => typeof v === "string" ? v.trim().slice(0, n) : "";
const id = () => crypto.randomUUID();
const userOf = req => req.session.user || null;
const safeUser = u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });
function auth(req, res, next) {
  if (!userOf(req)) return res.status(401).json({ error: "Please log in to continue." });
  next();
}
function missing(res, msg = "Resource not found.") { return res.status(404).json({ error: msg }); }
function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "BlogSpace" }));
app.get("/api/auth/me", (req, res) => res.json({ user: userOf(req) }));

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = clean(req.body.name, 40);
    const email = clean(req.body.email, 120).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (name.length < 2) return res.status(400).json({ error: "Name must be at least 2 characters." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email." });
    if (password.length < 8 || password.length > 100) return res.status(400).json({ error: "Password must be 8–100 characters." });
    const db = await readDb();
    if (db.users.some(u => u.email === email)) return res.status(409).json({ error: "This email already has an account." });
    const user = { id: id(), name, email, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date().toISOString() };
    db.users.push(user);
    await writeDb(db);
    req.session.user = safeUser(user);
    res.status(201).json({ message: "Account created.", user: req.session.user });
  } catch (e) { next(e); }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = clean(req.body.email, 120).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const db = await readDb();
    const user = db.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Email or password is incorrect." });
    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.user = safeUser(user);
      res.json({ message: "Logged in.", user: req.session.user });
    });
  } catch (e) { next(e); }
});

app.post("/api/auth/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie("blogspace.sid", { httpOnly: true, sameSite: "lax", secure: production });
    res.json({ message: "Logged out." });
  });
});

app.get("/api/posts", async (req, res, next) => {
  try {
    const db = await readDb();
    const q = clean(req.query.q, 100).toLowerCase();
    const category = clean(req.query.category, 40).toLowerCase();
    const currentUser = userOf(req);
    let posts = db.posts.map(p => ({
      ...p,
      commentCount: db.comments.filter(c => c.postId === p.id).length,
      likeCount: db.likes.filter(l => l.postId === p.id).length,
      likedByMe: !!currentUser && db.likes.some(l => l.postId === p.id && l.userId === currentUser.id),
      bookmarkedByMe: !!currentUser && db.bookmarks.some(b => b.postId === p.id && b.userId === currentUser.id)
    }));
    if (q) posts = posts.filter(p => `${p.title} ${p.content} ${p.authorName} ${p.category}`.toLowerCase().includes(q));
    if (category && category !== "all") posts = posts.filter(p => p.category.toLowerCase() === category);
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ posts });
  } catch (e) { next(e); }
});

app.get("/api/posts/:id", async (req, res, next) => {
  try {
    const db = await readDb();
    const rawPost = db.posts.find(p => p.id === req.params.id);
    if (!rawPost) return missing(res, "Blog post not found.");
    const currentUser = userOf(req);
    const post = {
      ...rawPost,
      likeCount: db.likes.filter(l => l.postId === rawPost.id).length,
      likedByMe: !!currentUser && db.likes.some(l => l.postId === rawPost.id && l.userId === currentUser.id),
      bookmarkedByMe: !!currentUser && db.bookmarks.some(b => b.postId === rawPost.id && b.userId === currentUser.id)
    };
    const comments = db.comments.filter(c => c.postId === post.id).sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
    res.json({ post, comments });
  } catch (e) { next(e); }
});

app.post("/api/posts", auth, async (req, res, next) => {
  try {
    const title = clean(req.body.title, 100), content = clean(req.body.content, 10000);
    const category = clean(req.body.category || "General", 40) || "General";
    if (title.length < 5) return res.status(400).json({ error: "Title must be at least 5 characters." });
    if (content.length < 20) return res.status(400).json({ error: "Content must be at least 20 characters." });
    const u = userOf(req), now = new Date().toISOString();
    const post = { id: id(), title, content, category, authorId: u.id, authorName: u.name, createdAt: now, updatedAt: now };
    const db = await readDb(); db.posts.push(post); await writeDb(db);
    res.status(201).json({ message: "Post published.", post });
  } catch (e) { next(e); }
});

app.put("/api/posts/:id", auth, async (req, res, next) => {
  try {
    const db = await readDb(), post = db.posts.find(p => p.id === req.params.id);
    if (!post) return missing(res, "Blog post not found.");
    if (post.authorId !== userOf(req).id) return res.status(403).json({ error: "You can only edit your own posts." });
    const title = clean(req.body.title, 100), content = clean(req.body.content, 10000);
    const category = clean(req.body.category || "General", 40) || "General";
    if (title.length < 5) return res.status(400).json({ error: "Title must be at least 5 characters." });
    if (content.length < 20) return res.status(400).json({ error: "Content must be at least 20 characters." });
    Object.assign(post, { title, content, category, updatedAt: new Date().toISOString() });
    await writeDb(db); res.json({ message: "Post updated.", post });
  } catch (e) { next(e); }
});

app.delete("/api/posts/:id", auth, async (req, res, next) => {
  try {
    const db = await readDb(), post = db.posts.find(p => p.id === req.params.id);
    if (!post) return missing(res, "Blog post not found.");
    if (post.authorId !== userOf(req).id) return res.status(403).json({ error: "You can only delete your own posts." });
    db.posts = db.posts.filter(p => p.id !== post.id);
    db.comments = db.comments.filter(c => c.postId !== post.id);
    await writeDb(db); res.json({ message: "Post deleted." });
  } catch (e) { next(e); }
});

app.post("/api/posts/:id/like", auth, async (req, res, next) => {
  try {
    const db = await readDb();
    if (!db.posts.some(p => p.id === req.params.id)) return missing(res, "Blog post not found.");
    const userId = userOf(req).id;
    const existing = db.likes.findIndex(l => l.postId === req.params.id && l.userId === userId);
    let liked;
    if (existing >= 0) { db.likes.splice(existing, 1); liked = false; }
    else { db.likes.push({ postId: req.params.id, userId, createdAt: new Date().toISOString() }); liked = true; }
    await writeDb(db);
    res.json({ liked, likeCount: db.likes.filter(l => l.postId === req.params.id).length });
  } catch (e) { next(e); }
});

app.post("/api/posts/:id/bookmark", auth, async (req, res, next) => {
  try {
    const db = await readDb();
    if (!db.posts.some(p => p.id === req.params.id)) return missing(res, "Blog post not found.");
    const userId = userOf(req).id;
    const existing = db.bookmarks.findIndex(b => b.postId === req.params.id && b.userId === userId);
    let bookmarked;
    if (existing >= 0) { db.bookmarks.splice(existing, 1); bookmarked = false; }
    else { db.bookmarks.push({ postId: req.params.id, userId, createdAt: new Date().toISOString() }); bookmarked = true; }
    await writeDb(db);
    res.json({ bookmarked });
  } catch (e) { next(e); }
});

app.post("/api/posts/:id/comments", auth, async (req, res, next) => {
  try {
    const text = clean(req.body.text, 1000);
    if (text.length < 2) return res.status(400).json({ error: "Comment must be at least 2 characters." });
    const db = await readDb();
    if (!db.posts.some(p => p.id === req.params.id)) return missing(res, "Blog post not found.");
    const u = userOf(req);
    const comment = { id: id(), postId: req.params.id, userId: u.id, authorName: u.name, text, createdAt: new Date().toISOString() };
    db.comments.push(comment); await writeDb(db);
    res.status(201).json({ message: "Comment added.", comment });
  } catch (e) { next(e); }
});

app.delete("/api/comments/:id", auth, async (req, res, next) => {
  try {
    const db = await readDb(), comment = db.comments.find(c => c.id === req.params.id);
    if (!comment) return missing(res, "Comment not found.");
    const post = db.posts.find(p => p.id === comment.postId), u = userOf(req);
    if (comment.userId !== u.id && (!post || post.authorId !== u.id)) return res.status(403).json({ error: "You cannot delete this comment." });
    db.comments = db.comments.filter(c => c.id !== comment.id);
    await writeDb(db); res.json({ message: "Comment deleted." });
  } catch (e) { next(e); }
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use(errorHandler);
app.listen(PORT, () => console.log(`BlogSpace running at http://localhost:${PORT}`));
