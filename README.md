<div align="center">

  <img src="client/public/dev.connect.png" alt="dev.connect logo" width="84" height="84" style="border-radius: 20px; margin-bottom: 12px;" />

  # dev.connect 🌐
  
  **The developer-first platform to showcase architecture, get peer-rated, and build a living engineering portfolio.**

  [![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-v4_Realtime-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-00ff66?style=for-the-badge)](LICENSE)

  <br/>

  <p align="center">
    <a href="#-why-devconnect">Why dev.connect?</a> •
    <a href="#-feature-highlights">Feature Highlights</a> •
    <a href="#-architecture--engineering-deep-dive">Architecture</a> •
    <a href="#-quickstart">Quickstart</a> •
    <a href="#-api-overview">API</a> •
    <a href="#-contributing">Contributing</a>
  </p>

</div>

---

## 💡 Why dev.connect?

Most developers build incredible software, only for their projects to gather dust in GitHub repositories or get lost in noisy generic feeds. 

**dev.connect** was built to solve a simple problem: **Give software engineers a dedicated space to document their system architectures, receive genuine peer reviews, and turn their public work into a verified technical portfolio.**

No vanity metrics. No fluff. Just clean write-ups, architecture breakdowns, live feedback, and real-time collaboration.

```
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │   1. Document   │  ──▶  │   2. Get Rated  │  ──▶  │ 3. Living Proof │
  │ Architecture &  │       │  1–10 Peer Star │       │ Top 3 Auto-Pin  │
  │ Markdown Stacks │       │ Reviews (No-Bias)│       │ Portfolio Page  │
  └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## ✨ Feature Highlights

### 📝 1. Deep Project Write-Ups & Asset Pipeline
* **Block-based Markdown Editor**: Clean inline toolbar supporting code blocks, headers, bulleted specs, and blockquotes.
* **Instant Clipboard / Drop Media**: Paste or drop screenshots directly into the editor — files upload automatically to Cloudinary temporary storage and are atomically promoted to permanent storage on post publish.
* **Branded `@` Tech Tags**: Mention technologies using `@` (e.g. `@[React]`, `@[Docker]`, `@[Node.js]`) to render branded badges with verified Font Awesome 7 icons.

### ⭐ 2. Transparent 1–10 Peer Rating Engine
* **Honest Evaluation**: Score projects from 1 to 10 with instant atomic recalculations.
* **Zero Self-Rating Bias**: Authors cannot rate their own creations.
* **Toggleable & Dynamic**: Tap the same score to revoke a rating or switch scores with seamless delta-based counter updates.

### 💼 3. Developer-First Living Portfolio
* **Frictionless Onboarding**: Jumpstart your profile right away with custom avatars, banners, roles, locations, social links, and tech stacks.
* **Auto-Pinned Top 3 Showcases**: Your profile automatically computes and pins your top 3 projects ranked by community rating score (`totalPoints`).
* **Chronological Experience Timeline**: Education, company history, and past work with structured verification.

### ⚡ 4. Real-Time Networking & WebSocket Chat
* **Direct Messaging**: 1-on-1 private messaging powered by JWT-authenticated Socket.io channels with multi-tab broadcast synchronization.
* **15-Minute Message Grace Window**: Edit or revoke sent messages within a 15-minute window.
* **Discovery Grid**: Discover fellow engineers, filter by shared tech stacks, and start collaborating in one click.

### 🧠 5. Quality-Driven Feed Algorithm
The personalised feed algorithm calculates engagement and relevance dynamically:
$$\text{Score} = 3 \cdot \ln(1 + \text{Points}) + 2 \cdot \text{AvgRating} + 3 \cdot \ln(1 + \text{Comments}) + \frac{1}{1 + \frac{\text{AgeHours}}{6}} + 5 \cdot |\text{Skills} \cap \text{TechStack}| + \text{FollowBoost}$$

---

## 🔒 Security Architecture

| Security Layer | Implementation Detail |
|---|---|
| **Authentication** | Dual-token mechanism: short-lived JWT access tokens (60m) + refresh tokens (7d) stored in `HttpOnly`, `SameSite`, `Secure` cookies. |
| **Token Rotation** | Cryptographically hashed refresh tokens (`SHA-256`) verified in database upon rotation. Prevents replay attacks. |
| **CSRF Defense** | Double-submit cookie strategy with server-side `crypto.timingSafeEqual` comparison on all mutation routes. |
| **Input Sanitization** | `rehype-sanitize` AST filtering on client markdown, regex whitelisting for usernames (`^[a-z0-9_]{3,30}$`), and strict URL scheme enforcement (`https://`). |
| **Rate Limiting** | Multi-tier rate limiting for Auth (40/15m), API (400/15m), Media Uploads (30/15m), and Rating Engine (60/15m). |
| **Security Headers** | Helmet.js integration with strict CSP, `X-Content-Type-Options`, and origin verification against `CLIENT_ORIGIN`. |

---

## 🛠 Tech Stack

<div align="center">

| Frontend (`client/`) | Backend (`server/`) | Infrastructure & Security |
|:---:|:---:|:---:|
| Next.js 16 (App Router) | Node.js (Express 5 ESM) | Cloudinary CDN Storage Engine |
| React 19 + Redux Toolkit | MongoDB + Mongoose 9 ODM | Socket.io v4 WebSockets |
| TanStack React Query v5 | JWT + SHA-256 Token Store | Helmet & Double-Submit CSRF |
| Tailwind CSS 4 + PostCSS | Express Rate Limiter | Bcrypt Password Hashing |
| Font Awesome 7 Icons | Multer File Streams | Browser Image Pre-compression |

</div>

---

## 📂 Repository Map

```text
devConnect/
├── client/                               # Next.js 16 Client (App Router)
│   ├── src/
│   │   ├── app/                          # Next.js pages & layouts
│   │   │   ├── (dashboard)/              # Authenticated feeds, profiles, chat, notifications
│   │   │   ├── auth/                     # Unified Login & Signup wizard
│   │   │   ├── onboarding/               # 5-step profile customizer
│   │   │   └── page.js                   # Landing page showcase
│   │   ├── features/                     # Domain modules (auth, feed, messages, network, profile, onboarding)
│   │   ├── services/                     # Central Axios client with CSRF & token refresh queue
│   │   ├── shared/                       # Global hooks, navbar, tech icon registry, socket context
│   │   └── store/                        # Redux toolkit store & auth slice
│   └── tests/                            # Local unit & smoke test suites
│
├── server/                               # Node.js Express 5 API Server
│   ├── src/
│   │   ├── config/                       # Cloudinary engine, DB connection, Socket server
│   │   ├── middlewares/                  # Auth verify, CSRF guards, role checks, rate limits
│   │   ├── modules/                      # Domain micro-modules (auth, user, post, comment, like, rating, feed, follow, message)
│   │   ├── routes/                       # Central API router (/api/*)
│   │   └── utils/                        # AsyncHandler, cookie helpers, temp asset garbage collector
│   └── tests/                            # Server unit tests
│
├── .gitignore                            # Root repository ignore rules
└── README.md                             # Project documentation
```

---

## 🚀 Quickstart

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **MongoDB**: Local daemon or MongoDB Atlas URI
* **Cloudinary**: Free account credentials for media management

### 1. Clone & Setup
```bash
git clone https://github.com/Sanjay067/DevConnect.git
cd DevConnect
```

### 2. Configure Backend Environment
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/devconnect
JWT_ACCESS_TOKEN=your_jwt_access_secret_key_32_chars_min
JWT_REFRESH_TOKEN=your_jwt_refresh_secret_key_32_chars_min
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start Development Servers

**Backend**:
```bash
cd server
npm install
npm run dev
```

**Frontend** *(in a new terminal)*:
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Running Tests

Unit tests validate edge cases, security regexes, rating calculations, and markdown sanitation:

```bash
# Run client unit tests
cd client
npm test

# Run server unit tests
cd server
npm test
```

---

## 🔌 API Overview

All API endpoints are mounted under `/api`.

<details>
<summary><b>Click to expand Endpoints Table</b></summary>

<br/>

| Domain | Method | Path | Description |
|---|---|---|---|
| **Auth** | `GET` | `/api/auth/csrf-token` | Issue CSRF token |
| | `POST` | `/api/auth/signup` | Register new user |
| | `POST` | `/api/auth/login` | Log in user |
| | `POST` | `/api/auth/logout` | Log out and clear cookies |
| | `POST` | `/api/auth/refresh-token` | Rotate JWT token pair |
| **Users** | `GET` | `/api/users/profiles/me` | Fetch authenticated profile |
| | `PATCH` | `/api/users/profiles/me` | Update bio, social links, work, education |
| | `PATCH` | `/api/users/profiles/me/avatar` | Upload profile photo |
| | `PATCH` | `/api/users/profiles/me/banner` | Upload banner image |
| | `GET` | `/api/users/profiles` | Discover developers (`?q=`) |
| **Posts** | `GET` | `/api/feed` | Personalised feed stream |
| | `POST` | `/api/posts` | Create new post |
| | `GET` | `/api/posts/:postId` | Get single post details |
| | `PATCH` | `/api/posts/:postId/rate` | Rate 1–10 or un-rate |
| | `POST` | `/api/posts/:postId/like` | Toggle post like |
| | `POST` | `/api/posts/upload-asset` | Upload temporary editor asset |
| **Comments** | `GET` | `/api/posts/:postId/comments` | Fetch threaded comments |
| | `POST` | `/api/posts/:postId/comments` | Add new comment / reply |
| | `DELETE` | `/api/posts/:postId/comments/:commentId` | Soft-delete comment |
| **Messages**| `GET` | `/api/messages/conversations` | List conversation threads |
| | `POST` | `/api/messages/:peerId` | Send direct message |
| | `DELETE`| `/api/messages/delete/:messageId` | Delete message (≤ 15 min) |

</details>

---

## 🤝 Contributing

Contributions are what make the open-source developer community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Open Source

This project is open source and licensed under the [MIT License](LICENSE). Anyone is welcome to contribute, collaborate, report issues, or build new features.

