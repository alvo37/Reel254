# Real254 – Movie Review Platform 🎬

Hey there! Welcome to **Real254**, my full-stack movie review platform. I built this using a **Next.js** frontend and a **Flask** backend to create a seamless and modern experience for movie and TV show lovers.

## ✨ What I've Built Recently: The Trailer Feed
I recently implemented a **TikTok-style infinite scrolling feed** for movie and TV show trailers! It's super immersive and comes with a bunch of cool features:

- **Endless Scrolling:** Keep swiping through an infinite feed of trailers, powered by IntersectionObserver.
- **Auto-playing Trailers:** Integrated YouTube embeds that autoplay as you snap to the next video.
- **Genre Filters:** Quickly switch between Trending, Action, Comedy, Horror, Romance, and Sci-Fi.
- **Social Features:** 
  - ❤️ **Like** your favorite movies and shows (saves to your profile).
  - 💬 **Comment** on trailers and see what others are saying in a custom modal.
  - ➕ **Watchlist** titles you want to save for later.
  - ↗️ **Share** links directly via native share or WhatsApp.
- **Authentication:** Fully secured using Clerk for user management.

---

## 🧱 Project Structure

```text
realtone/
├── client/     # Frontend - Next.js (React, TailwindCSS, Clerk)
└── server/     # Backend - Flask (Python)
```

---

## 🚀 Getting Started

If you want to run my project locally, here is how you can set it up:

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/realtone.git
cd reel254
```

---

## 🎬 Frontend Setup (Next.js)

Navigate to the client folder, install the dependencies, and start the development server:

```bash
cd client
npm install
npm run dev
```

> Access the frontend at `http://localhost:3000`

---

## 🎯 Backend Setup (Flask)

Open a new terminal, navigate to the server folder, install the Python requirements, and run the app:

```bash
cd server
pip install -r requirements.txt
python app.py  # or however you run your entry script
```

> The backend runs on `http://localhost:5000` by default.

---

## 🛠️ Notes & Tech Stack

* **Frontend:** Next.js 14+, React, Tailwind CSS, Clerk (Auth), Sonner (Toasts)
* **Backend:** Flask, Python 3.10+
* **Data:** TMDB API (`https://developer.themoviedb.org/reference/intro/getting-started`)
* Make sure to set up your `.env` files in both `client/` and `server/` with your Clerk keys and database URIs!

---

## 📬 Questions or Issues?

Feel free to open an issue or start a discussion in the GitHub repo if you want to contribute or just say hi!