# devConnect 🌐

devConnect is a premium, developer-centric project-showcasing and social networking platform built specifically for software engineers. It enables developers to showcase their work, document technical features, connect with peers, and collaborate on open-source or commercial products.

---

## 🚀 Key Features

### 1. Developer-Centric Profile Page (Portfolio-First)
*   **Featured Projects Showcase**: Pinned showcases displaying the developer's top-3 projects based on popularity and engagement (likes + comments) automatically.
*   **Technical Details Sidebar**: Organizes developer credentials into current position, location, web presence (GitHub, LinkedIn, Portfolio), and visual skills badges.
*   **Education Log**: Chronological timeline rendering schools, degrees, and academic backgrounds.
*   **Interactive About & Bio**: Clean multi-line summaries describing developers' interests and expertise.

### 2. Network & Developer Discovery
*   **Spacious Discovery Grid**: A clean 3-column developer discovery layout built to browse curated professionals without sidebar clutter.
*   **Recommended Developers**: Dynamic connection recommendations of profiles on the network who aren't currently followed.
*   **Premium Developer Cards**: Cards featuring online indicator status lights, verification checkmarks, 2-line bios, technology stack tags with brand icons, and quick connection metrics.
*   **LinkedIn-Style Unified Search**: Global search input in the Navbar. Typing in search parameters from any page dynamically routes the user to the Network page, filtering profiles by name, username, or skills instantly.

### 3. Developer Feed & Project Showcases
*   **Rich Project Documentation**: Post project outlines using a robust Markdown editor and custom renderer.
*   **Asset Pipeline**: Pasting or dropping images into the editor uploads them automatically to Cloudinary, rendering direct inline markdown image references.
*   **Interactive Tech Stack Badges**: Autocomplete suggestions (triggered by typing `@`) instantly render custom technology badges with brand icons.
*   **Like & Comment System**: Project engagement features supporting likes and multi-level discussion threads on posts.
*   **Feed Scoring Algorithm**: A personalized feed that ranks posts dynamically based on engagement (likes + comments), recency, matching tech skills/interests, and follow connections.

### 4. Secure Private Messaging
*   **Private Chat Channel**: Encrypted messaging between connections.
*   **Auto-Scroll & Sync**: High-fidelity messaging panel with automatic scroll synchronization and messaging history.
*   **Deep Link Connect**: "Message" button on profiles deep-links directly to the target user's pre-selected chat conversation thread.

---

## 🛠 Technical Breakdown

### Frontend (`client/`)
*   **Framework**: Next.js 16 (Turbopack, App Router)
*   **Library**: React 19
*   **State Management**: Redux Toolkit (Authentication state, session storage)
*   **Data Fetching & Cache**: React Query (`@tanstack/react-query`) & Axios
*   **Styling**: Tailwind CSS 4 & Vanilla CSS Custom Tokens
*   **Utilities**: HTML5 image compression before Cloudinary upload pipelines.

### Backend (`server/`)
*   **Framework**: Node.js & Express
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JWT (Access/Refresh Token rotation in secure HttpOnly cookies)
*   **Security**: CSRF token validation, Helmet headers protection, and express-rate-limit bounds
*   **Storage**: Multer & Cloudinary CDN integration

---

## 📂 Project Structure

```bash
devConnect/
├── client/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router (dashboard, pages)
│   │   ├── features/           # Modular domain features (feed, profile, components)
│   │   ├── services/           # Data fetching client endpoints (auth, follow, posts)
│   │   ├── shared/             # Common layouts, utility helpers, design tokens
│   │   └── store/              # Redux slices and setup
│   └── tests/                  # Frontend smoke test suites
│
└── server/                     # Node.js Express API Backend
    ├── src/
    │   ├── config/             # Cloudinary & database initialization configurations
    │   ├── middlewares/        # Access verification, CSRF, rate limits
    │   ├── modules/            # Backend domains (auth, comment, follow, post, user)
    │   ├── routes/             # Global API endpoints routing index
    │   └── utils/              # Helper utilities (async handlers, cookie controls)
    └── tests/                  # Backend unit test suites
```

---

## ⚙️ Get Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance
*   Cloudinary Account API credentials

### Installation

1. Set up backend environment variables:
   Create a `.env` file under the `server` directory:
   ```env
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_ACCESS_TOKEN=your_jwt_access_secret
   JWT_REFRESH_TOKEN=your_jwt_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_ORIGIN=http://localhost:3000
   ```

2. Start the services:

   *   **Backend**:
       ```bash
       cd server
       npm install
       npm run dev
       ```
   *   **Frontend**:
       ```bash
       cd client
       npm install
       npm run dev
       ```

---

## 🧪 Testing

### Running Server Tests
Runs backend validation checks for Cloudinary asset parsing:
```bash
cd server
npm test
```

### Running Client Tests
Runs frontend markdown parser checks:
```bash
cd client
npm run test:smoke
```
