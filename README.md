# mediExplain AI · Tech for Good 2026

**Team:** 290 - AI Rangers

**Live Demo URL:** https://medi-explain-ai-eta.vercel.app/

## Overview
mediExplain AI is a patient-friendly platform that analyzes complex medical reports and explains them in simple language. It provides an overall health summary, highlights key findings, offers personalized lifestyle recommendations, and includes an AI chat assistant (Toe) to answer patient questions about their reports in both English and Tamil.

## Architecture
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Python, FastAPI, SQLite
- **AI Integration:** Google Gemini API for medical report analysis and chat

## How to run locally

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend` folder with your Gemini API key:
   ```
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` folder to point to the local backend:
   ```
   VITE_API_URL="http://127.0.0.1:8000"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
