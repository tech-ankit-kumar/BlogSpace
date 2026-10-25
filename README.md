::: {align="center"}
# ✨ BlogSpace

### A modern, full-stack blogging platform built for sharing ideas.

**Write. Publish. Connect.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![HTML5](https://img.shields.io/badge/HTML5-Markup-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

`<br />`{=html}

[Features](#-features) · [Screenshots](#-screenshots) · [Getting
Started](#-getting-started) · [API](#-api-overview) · [Project
Structure](#-project-structure)
:::

------------------------------------------------------------------------

## 📖 About the Project

**BlogSpace** is a full-stack blogging application where readers can
discover posts and signed-in users can publish and manage their own
content. It combines a lightweight frontend built with HTML, CSS, and
vanilla JavaScript with a Node.js and Express REST API.

The project is designed as a clear, approachable portfolio project: it
demonstrates frontend interactions, server-side routing, session-based
authentication, password hashing, content management, and basic API
security without requiring a separate database server for local
development.

> **Storage note:** BlogSpace currently uses a local JSON file for data
> storage. This is convenient for demos and learning, but a production
> deployment should use a persistent database and durable storage.

## 🖼️ Screenshots

### Homepage preview

![BlogSpace homepage preview](screenshots/homepage-preview.png)

`<sub>`{=html}If the image does not appear, make sure the
`<code>`{=html}screenshots/homepage-preview.png`</code>`{=html} file
exists in the repository at that exact path. GitHub paths are
case-sensitive.`</sub>`{=html}

## ✨ Features

### ✍️ Publishing and content

-   Create blog posts with a title, content, and category.
-   Edit or delete your own posts.
-   Browse posts with search and category filtering.
-   Sort the feed by newest posts.
-   See comment and like counts, plus estimated reading time in the
    interface.

### 👥 Accounts and engagement

-   Register, log in, and log out.
-   Add comments to posts while signed in.
-   Like and unlike posts.
-   Bookmark and unbookmark posts.
-   Enforce ownership checks for editing and deleting content.

### 🛡️ Security and reliability

-   Passwords are hashed using `bcryptjs`.
-   Session-based authentication with HTTP-only cookies.
-   Security headers via `helmet`.
-   API rate limiting, including tighter limits for authentication
    endpoints.
-   Input length checks and JSON request-size limits.
-   Production mode requires a `SESSION_SECRET`.

### 🧰 Developer experience

-   Simple local setup using Node.js and npm.
-   REST endpoints grouped under `/api`.
-   Example environment configuration in `.env.example`.
-   No XAMPP or MySQL setup required for local development.

## 🧱 Tech Stack

  Technology             Purpose
  ---------------------- ----------------------------------------------
  HTML5                  Page structure
  CSS3                   Layout, styling, and responsive presentation
  Vanilla JavaScript     Frontend interactions and API requests
  Node.js                JavaScript runtime
  Express.js             Web server and REST API
  `express-session`      Session management
  `bcryptjs`             Password hashing
  `helmet`               HTTP security headers
  `express-rate-limit`   API rate limiting
  JSON file storage      Lightweight local demo data

## 🚀 Getting Started

### Prerequisites

Install **Node.js 18 or later** (npm is included).

-   Node.js: https://nodejs.org/
-   Git: https://git-scm.com/

### 1. Clone the repository

``` bash
git clone https://github.com/tech-ankit-kumar/BlogSpace.git
cd BlogSpace
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and set values as needed.

**PowerShell (Windows):**

``` powershell
Copy-Item .env.example .env
```

For local development, the app has a fallback session secret. Before
running in production, set a strong, private `SESSION_SECRET` and
`NODE_ENV=production`. Never commit your real `.env` file or secrets to
GitHub.

### 4. Start the server

``` bash
npm start
```

Open **http://localhost:3000** in your browser.

To check the API health endpoint, visit
**http://localhost:3000/api/health**. A successful response looks like:

``` json
{
  "status": "ok",
  "app": "BlogSpace"
}
```

## 🔌 API Overview

All API routes are served from `/api`.

  ---------------------------------------------------------------------------------
  Method            Endpoint                    Purpose           Authentication
  ----------------- --------------------------- ----------------- -----------------
  `GET`             `/api/health`               Check server      No
                                                health            

  `GET`             `/api/auth/me`              Get current       No
                                                session user      

  `POST`            `/api/auth/register`        Create an account No

  `POST`            `/api/auth/login`           Sign in           No

  `POST`            `/api/auth/logout`          Sign out          Session

  `GET`             `/api/posts`                List posts;       No
                                                supports `q` and  
                                                `category` query  
                                                parameters        

  `GET`             `/api/posts/:id`            Get a post and    No
                                                its comments      

  `POST`            `/api/posts`                Create a post     Yes

  `PUT`             `/api/posts/:id`            Update your own   Yes
                                                post              

  `DELETE`          `/api/posts/:id`            Delete your own   Yes
                                                post              

  `POST`            `/api/posts/:id/like`       Toggle a like     Yes

  `POST`            `/api/posts/:id/bookmark`   Toggle a bookmark Yes

  `POST`            `/api/posts/:id/comments`   Add a comment     Yes

  `DELETE`          `/api/comments/:id`         Delete an allowed Yes
                                                comment           
  ---------------------------------------------------------------------------------

Authenticated endpoints use the session cookie created by login or
registration. The API returns JSON responses and uses standard HTTP
status codes for validation and authorization errors.

## 📁 Project Structure

``` text
BlogSpace/
├── data/
│   └── db.json                 # Local JSON data store
├── public/
│   ├── app.js                  # Frontend application logic
│   ├── index.html              # Main page
│   └── styles.css              # Styles and responsive layout
├── screenshots/
│   └── homepage-preview.png    # README homepage screenshot
├── src/
│   └── db.js                   # JSON database helpers
├── .env.example                # Example environment configuration
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js                   # Express server and API routes
```

## 🔐 Security Notes

-   Keep `.env` private; commit only `.env.example`.
-   Use a unique, strong `SESSION_SECRET` in production.
-   HTTPS is required for secure cookies in production.
-   JSON-file storage is not suitable for concurrent writes or
    multi-instance production deployments.
-   Before deploying publicly, use a persistent database, review session
    storage, configure your hosting environment, and test the
    application's security and error handling.

## 🗺️ Roadmap

Possible future improvements:

-   [ ] Migrate JSON storage to PostgreSQL or MongoDB.
-   [ ] Add profile pages and avatars.
-   [ ] Add pagination and richer sorting options.
-   [ ] Add image uploads for posts.
-   [ ] Add automated tests and a CI workflow.
-   [ ] Deploy with a managed database and persistent storage.

## 🧑‍💻 Contributing

Suggestions and improvements are welcome.

1.  Fork the repository.
2.  Create a branch: `git checkout -b feature/your-feature`.
3.  Make and test your changes.
4.  Commit: `git commit -m "Add: your feature"`.
5.  Push your branch and open a pull request.

## 🐛 Troubleshooting

**The app does not start** - Confirm Node.js is installed:
`node --version`. - Install dependencies again with `npm install`. -
Check whether port `3000` is already in use.

**The README screenshot is broken** - Confirm
`screenshots/homepage-preview.png` exists in the repository. - Keep the
image path relative: `screenshots/homepage-preview.png`. - Ensure the
image file was committed and pushed along with the README.

**Login or post actions fail** - Check the browser console and terminal
output. - Confirm the server is running and try the health endpoint at
`/api/health`.

## 📄 License

No license file is currently included in the repository. Add a `LICENSE`
file if you want to specify how others may use, modify, and distribute
this project.

## 🙌 Author

**Ankit Kumar**

-   GitHub: [@tech-ankit-kumar](https://github.com/tech-ankit-kumar)
-   Project: [BlogSpace
    repository](https://github.com/tech-ankit-kumar/BlogSpace)

------------------------------------------------------------------------

::: {align="center"}
**If you find BlogSpace interesting, consider giving the repository a
⭐**

Built with ❤️ using HTML, CSS, JavaScript, Node.js, and Express.
:::
