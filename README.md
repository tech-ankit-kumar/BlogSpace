<div align="center">

# BlogSpace

### A little space for big ideas.

A full-stack blogging platform to write, discover, discuss, and save stories — built with a responsive frontend and a lightweight Node.js/Express API.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=222222)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-Not%20specified-lightgrey)](#license)
[![Status](https://img.shields.io/badge/Status-Learning%20Project-7c5cdb)](#project-status)

**[Developer GitHub Profile](https://github.com/tech-ankit-kumar)**

</div>

---

## Preview

> **UI preview:** The image below is an illustrative preview of the BlogSpace visual design. Run the project locally to explore the live interface and interactions.

![BlogSpace homepage UI preview](screenshots/homepage-preview.png)

---

## Table of contents

- [About the project](#about-the-project)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Security notes](#security-notes)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Project status](#project-status)
- [License](#license)

## About the project

**BlogSpace** is a portfolio-focused full-stack web application designed around a simple idea: everyone should have a welcoming place to share what they are learning. Visitors can explore and search stories, while registered users can publish their own posts, interact with other stories, and keep a personal reading list.

The project is intentionally easy to run on a local machine. It uses **JSON-file storage**, so there is no need to install XAMPP or configure a separate MySQL server.

### Project goals

- Build a complete frontend-to-backend application.
- Practice REST API design and client/server communication.
- Implement authentication, password hashing, and authorization checks.
- Create a polished, responsive reading and writing experience.
- Document setup and technical decisions clearly for other developers.

## Features

### Reading and discovery

- Browse the seeded sample stories.
- Search stories by text and filter by topic/category.
- Sort stories by newest, oldest, or most liked.
- View estimated reading time and the current result count.
- Explore topic cards, About content, a “How it works” section, and FAQs.

### Writing and community

- Register, log in, and log out.
- Create, edit, and delete your own posts.
- Like and unlike stories.
- Bookmark stories and filter your saved reading list.
- Add comments and remove comments when authorized.
- Use responsive layouts across desktop and smaller screens.

### Backend and security foundations

- REST API powered by Express.
- Password hashing with `bcryptjs`.
- Session-based authentication using `express-session`.
- Security headers with Helmet.
- Request rate limiting with `express-rate-limit`.
- Basic input validation and ownership/authorization checks.
- Local JSON persistence for a simple development setup.

## Tech stack

<div align="center">

[![My Skills](https://skillicons.dev/icons?i=html,css,js,nodejs,express,git,github,vscode&perline=8)](https://skillicons.dev)

</div>

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript | Responsive interface and browser-side interactions |
| Backend | Node.js, Express.js | HTTP server and REST endpoints |
| Authentication | `express-session`, `bcryptjs` | Session handling and password hashing |
| Security | Helmet, Express Rate Limit | Security headers and request throttling |
| Data | JSON file (`data/db.json`) | Simple local persistence without a database server |
| Developer tools | npm, Git, GitHub, VS Code | Dependencies, version control, and development |

## Getting started

### Prerequisites

Install the following before running the project:

- **Node.js 18 or later** — [Download Node.js](https://nodejs.org/)
- **npm** — included with Node.js
- **Git** (optional) — [Download Git](https://git-scm.com/)

### 1. Get the project

Download the project ZIP from the repository or clone your repository:

```bash
git clone <your-repository-url>
cd BlogSpace-Portfolio-v2
```

If you downloaded a ZIP, extract it and open the `BlogSpace-Portfolio-v2` folder in VS Code.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables (recommended)

Create a `.env` file from the example:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

Open `.env` and set a strong, unique `SESSION_SECRET`. Keep `.env` private and never commit secrets.

### 4. Start the server

```bash
npm start
```

For development with Node's watch mode:

```bash
npm run dev
```

### 5. Open BlogSpace

Visit **http://localhost:3000** in your browser.

## Environment configuration

The project includes `.env.example`. Review it before running the server. Keep any real `.env` file out of version control. If you change the port or session secret, use your local environment file and restart the server.

## Project structure

```text
BlogSpace-Portfolio-v2/
├── data/
│   └── db.json                 # Seed data and JSON-backed records
├── public/
│   ├── app.js                  # Frontend behavior and API calls
│   ├── index.html              # Main page and content sections
│   └── styles.css              # Responsive visual design
├── screenshots/
│   └── homepage-preview.png    # Illustrative README preview
├── src/
│   └── db.js                   # JSON data access helpers
├── .env.example                # Example environment configuration
├── .gitignore
├── package.json
├── server.js                   # Express server and REST API
└── README.md
```

## API reference

All API endpoints use the `/api` prefix. Endpoints marked **Yes** require an authenticated session.

| Method | Endpoint | Auth required | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | No | Health check |
| `GET` | `/api/auth/me` | No | Return the current session user, if any |
| `POST` | `/api/auth/register` | No | Register a user |
| `POST` | `/api/auth/login` | No | Authenticate a user |
| `POST` | `/api/auth/logout` | No | End the current session |
| `GET` | `/api/posts` | No | List posts; supports search/category query parameters |
| `GET` | `/api/posts/:id` | No | Retrieve a post and its comments |
| `POST` | `/api/posts` | Yes | Create a post |
| `PUT` | `/api/posts/:id` | Yes | Update a post you own |
| `DELETE` | `/api/posts/:id` | Yes | Delete a post you own |
| `POST` | `/api/posts/:id/like` | Yes | Toggle a like on a post |
| `POST` | `/api/posts/:id/bookmark` | Yes | Toggle a bookmark on a post |
| `POST` | `/api/posts/:id/comments` | Yes | Add a comment |
| `DELETE` | `/api/comments/:id` | Yes | Delete a comment when authorized |

### Example: create a post

Send a JSON request to `POST /api/posts` with an authenticated session:

```json
{
  "title": "What I learned this week",
  "content": "A useful lesson from building and testing a small project...",
  "category": "Development"
}
```

The server validates the request and associates the post with the signed-in user.

## Security notes

BlogSpace is an **educational portfolio project**, not a production-ready publishing service. In particular:

- The default Express in-memory session store is intended for local development only. Sessions will not be durable across server restarts and this store is unsuitable for production or multiple server instances.
- JSON-file persistence is simple for demos but does not provide database-level concurrency, backup, or scaling guarantees.
- Before public deployment, review cookie settings, HTTPS, CSRF protection, input validation, logging, backups, and dependency updates.
- Use a strong session secret and never commit `.env`, credentials, or real user data.

## Roadmap

Potential next improvements:

- [ ] Add automated unit and integration tests.
- [ ] Move data to PostgreSQL or MongoDB.
- [ ] Add a persistent session store and production cookie configuration.
- [ ] Add writer profile pages and richer article detail pages.
- [ ] Add deployment instructions and a live demo link.
- [ ] Add accessibility checks and a documented mobile QA pass.

## Troubleshooting

**`npm` is not recognized**  
Install Node.js 18+ from [nodejs.org](https://nodejs.org/) and reopen your terminal.

**The page does not open**  
Confirm the server started without errors, then visit `http://localhost:3000`.

**Port 3000 is already in use**  
Stop the other process using that port or configure a different port if the server supports your chosen environment configuration.

**The styles look outdated after an update**  
Hard-refresh the page with `Ctrl + F5` on Windows.

## Project status

This is a learning and internship-portfolio project. The feature list describes the included code; production deployment and full browser-based end-to-end verification should be completed separately before presenting it as a live service.

## License

No license file is currently included. Add a `LICENSE` file and update this section if you want to publish the project under a specific open-source license.

---

<div align="center">

**Built with curiosity and a little code.**

Created by [tech-ankit-kumar](https://github.com/tech-ankit-kumar)

</div>
