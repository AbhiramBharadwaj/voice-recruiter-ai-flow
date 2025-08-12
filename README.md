AI Recruiter Voice Agent
Revolutionizing recruitment with AI-powered voice interviews

Overview
The AI Recruiter Voice Agent is a next-generation recruitment platform that conducts AI-powered voice interviews and evaluates candidates in real time.
It streamlines the hiring process by automating interview scheduling, question generation, speech analysis, resume parsing, and candidate scoring.

This tool helps organizations reduce manual screening time, improve candidate experience, and ensure data-driven hiring decisions.

Features
🎙 AI Voice Interview – Conducts role-based interviews with real-time speech-to-text transcription and AI feedback.

📄 Resume Parser – Analyzes resumes and generates personalized interview questions.

📊 Performance Dashboard – Tracks interview results, candidate scores, and recommendations.

📚 Practice MCQs – Allows candidates to prepare for technical and behavioral questions.

📜 Interview History – Stores and retrieves past interviews for review.

Tech Stack
Frontend: React, TypeScript, Vite, TailwindCSS

Backend / Auth: Supabase

AI Integration: Speech-to-Text, NLP-powered question generation, sentiment analysis

Database: Supabase PostgreSQL

Deployment: Lovable Platform

Architecture : 

User Interface (React + TailwindCSS)
        |
        |--- Supabase Auth (Sign in / Sign up)
        |
        |--- AI Voice Processing
        |       ├── Speech-to-Text (STT)
        |       ├── AI Interview Question Engine
        |       ├── Real-time Feedback Generation
        |
        |--- Resume Parsing Module
        |       ├── NLP Resume Analysis
        |       ├── Question Personalization
        |
        └── Performance Analytics Dashboard

Installation : 

# Clone the repository
git clone https://github.com/AbhiramBharadwaj/voice-recruiter-ai-flow.git

# Navigate to the project directory
cd voice-recruiter-ai-flow

# Install dependencies
npm install

# Start the development server
npm run dev

