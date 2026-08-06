# 🚀 URL Summarizer (Powered by AI)

**[🔴 Live Demo](https://url-summarizer-frontend-7vv3.onrender.com/)**

An asynchronous, full-stack AI web application that instantly extracts and summarizes content from any URL or PDF link. Built with a beautiful, dynamic UI and a robust queue-based backend architecture to handle long-running LLM inferences without timing out.

## ✨ Features

- **⚡ Instant AI Summaries:** Powered by Groq and the blazing-fast `llama-3.1-8b-instant` model.
- **🔄 Real-Time UI Updates:** Uses Server-Sent Events (SSE) to stream job status (Queued ➔ Fetching ➔ Extracting ➔ Summarizing) directly to the client without polling.
- **🧠 PDF & Article Parsing:** Automatically detects file types, intelligently extracts text from complex web pages using `BeautifulSoup`, and parses PDFs using `PyMuPDF`.
- **🛠️ Reliable Background Processing:** Offloads heavy processing from the API to background worker processes using `BullMQ` and `Redis`.
- **💅 Stunning Interface:** Built with Next.js, Tailwind CSS, and Lucide icons for a premium, glassmorphic dark-mode aesthetic.

## 🛠️ Technology Stack

**Frontend**
- Next.js (App Router)
- React
- Tailwind CSS
- Server-Sent Events (SSE)

**Backend**
- Python 3.11
- FastAPI (High-performance async API)
- BullMQ (Robust Redis-based job queue)
- SQLAlchemy (PostgreSQL ORM)
- PyMuPDF (PDF parsing)

**Infrastructure**
- Docker (Fully containerized)
- Render (Hosting via Blueprint)
- Upstash (Serverless Redis)
- Groq (LLM Inference)

---

## 🚀 Running Locally

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- A Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/seth1026/URL_summarizer.git
cd URL_summarizer
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@127.0.0.1:5433/url_summarizer
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start the Backend (API, Worker, DB, Redis)
```bash
docker-compose up -d
```
*(This starts the local Postgres and Redis containers)*

Activate your Python environment and start the API and Worker:
```bash
# Terminal 1: Start the FastAPI Server
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Start the Background Worker
cd backend
python -m workers.summarizer
```

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app!

---

## ☁️ Deployment (Render)

This project is configured to deploy the **entire full-stack architecture** automatically on Render using the provided `render.yaml` Blueprint.

1. Connect this GitHub repository to Render as a **Blueprint**.
2. Render will automatically provision:
   - A PostgreSQL Database
   - A Web Service for the API + Background Worker
   - A Web Service for the Next.js Frontend
3. Add your `GROQ_API_KEY` and an Upstash `REDIS_URL` in the Render dashboard.

---
*Built with ❤️ by Seth.*
