<div align="center">

# ✨ BlogSpace

### A modern, full-stack blogging platform built for sharing ideas.

**Write. Publish. Connect.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![HTML5](https://img.shields.io/badge/HTML5-Markup-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**[Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [API](#-api-overview) · [Project Structure](#-project-structure)**

</div>

---

## 📖 About the Project

**BlogSpace** is a full-stack blogging application where readers can discover posts and signed-in users can publish and manage their own content. It combines a lightweight frontend built with HTML, CSS, and vanilla JavaScript with a Node.js and Express REST API.

It demonstrates frontend interactions, server-side routing, session-based authentication, password hashing, content management, and basic API security. Local development does not require a separate database server.

> **Storage note:** BlogSpace currently uses a local JSON file for data storage. This is convenient for demos and learning, but production deployments should use a persistent database and durable storage.

## 🖼️ Screenshots

### Homepage Preview

![BlogSpace homepage preview](screenshots/homepage-preview.png)

> If the image does not appear, confirm that `screenshots/homepage-preview.png` exists in the repository and has been pushed to GitHub. File paths are case-sensitive.

## ✨ Features

### ✍️ Publishing and content
- Create blog posts with a title, content, and category.
- Edit or delete your own posts.
- Browse posts with search and category filtering.
- Sort posts and view estimated reading time.
- View comments and like counts.

### 👥 Accounts and engagement
- Register, log in, and log out.
- Comment on posts while signed in.
- Like and unlike posts.
- Bookmark and unbookmark posts.
- Enforce ownership checks for editing and deleting content.

### 🛡️ Security and reliability
- Password hashing with `bcryptjs`.
- Session-based authentication using HTTP-only cookies.
- Security headers via `helmet`.
- API rate limiting, including stricter limits for authentication endpoints.
- Input validation and JSON request-size limits.
- Production mode requires a private `SESSION_SECRET`.

### 🧰 Developer experience
- Simple setup using Node.js and npm.
- REST API routes grouped under `/api`.
- Example environment configuration in `.env.example`.
- No XAMPP or MySQL required for local development.

## 🧱 Tech Stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| Vanilla JavaScript | Frontend interactions and API requests |
| Node.js | JavaScript runtime |
| Express.js | Web server and REST API |
| `express-session` | Session management |
| `bcryptjs` | Password hashing |
| `helmet` | HTTP security headers |
| `express-rate-limit` | API rate limiting |
| JSON file storage | Lightweight local demo data |

## 🚀 Getting Started

### Prerequisites
Install **Node.js 18 or later** (npm is included).

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/tech-ankit-kumar/BlogSpace.git
cd BlogSpace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env`.

**PowerShell (Windows):**

```powershell
Copy-Item .env.example .env
```

Never commit real secrets or your `.env` file to GitHub. Before production use, configure a strong, private `SESSION_SECRET` and set `NODE_ENV=production`.

### 4. Start the server

```bash
npm start
```

Open **http://localhost:3000** in your browser.

Health endpoint: **http://localhost:3000/api/health**

A successful response looks like:

```json
{
  "status": "ok",
  "app": "BlogSpace"
}
```

## 🔌 API Overview

All API routes are served from `/api`.

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Check server health | No |
| `GET` | `/api/auth/me` | Get the current session user | No |
| `POST` | `/api/auth/register` | Create an account | No |
| `POST` | `/api/auth/login` | Sign in | No |
| `POST` | `/api/auth/logout` | Sign out | Session |
| `GET` | `/api/posts` | List posts; supports `q` and `category` query parameters | No |
| `GET` | `/api/posts/:id` | Get a post and its comments | No |
| `POST` | `/api/posts` | Create a post | Yes |
| `PUT` | `/api/posts/:id` | Update your own post | Yes |
| `DELETE` | `/api/posts/:id` | Delete your own post | Yes |
| `POST` | `/api/posts/:id/like` | Toggle a like | Yes |
| `POST` | `/api/posts/:id/bookmark` | Toggle a bookmark | Yes |
| `POST` | `/api/posts/:id/comments` | Add a comment | Yes |
| `DELETE` | `/api/comments/:id` | Delete an allowed comment | Yes |

## 📁 Project Structure

```text
BlogSpace/
├── data/
│   └── db.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── screenshots/
│   └── homepage-preview.png
├── src/
│   └── db.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## 🔐 Security Notes

- Keep `.env` private; commit only `.env.example`.
- Use a unique, strong `SESSION_SECRET` in production.
- Use HTTPS for secure production cookies.
- JSON-file storage is not suitable for concurrent writes or multi-instance production deployments.
- Before public deployment, use a persistent database and review session storage, hosting configuration, and error handling.

## 🗺️ Roadmap

- [ ] Migrate JSON storage to PostgreSQL or MongoDB.
- [ ] Add profile pages and avatars.
- [ ] Add pagination and richer sorting.
- [ ] Add image uploads for posts.
- [ ] Add automated tests and CI.
- [ ] Deploy with a managed database and persistent storage.

## 🧑‍💻 Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Make and test your changes.
4. Commit: `git commit -m "Add: your feature"`.
5. Push your branch and open a pull request.

## 🐛 Troubleshooting

**The app does not start**
- Confirm Node.js is installed with `node --version`.
- Run `npm install` to install dependencies.
- Check whether port `3000` is already in use.

**The README screenshot is broken**
- Confirm `screenshots/homepage-preview.png` exists in the repository.
- Keep the image path relative: `screenshots/homepage-preview.png`.
- Ensure the image file was committed and pushed.

**Login or post actions fail**
- Check the browser console and terminal output.
- Confirm the server is running and test `/api/health`.

## 📄 License

No license file is currently included in the repository. Add a `LICENSE` file if you want to specify how others may use, modify, and distribute this project.

## 🙌 Author

**Ankit Kumar**

- GitHub: [@tech-ankit-kumar](https://github.com/tech-ankit-kumar)
- Project: [BlogSpace repository](https://github.com/tech-ankit-kumar/BlogSpace)

---

<div align="center">

**If you find BlogSpace interesting, consider giving the repository a ⭐**

Built with ❤️ using HTML, CSS, JavaScript, Node.js, and Express.

</div>
