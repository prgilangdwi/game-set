# Game Set — Product Requirements Document

---

# Product Vision

Game Set is a modern tennis event operating system that enables organizers to automate tournament management and live match operations.

The platform focuses on:
- Americano tournaments
- Mixed doubles
- Round robin tournaments
- Team cups
- Ladder systems
- Community tennis operations

Game Set replaces:
- spreadsheets
- WhatsApp coordination
- handwritten schedules
- manual standings tracking

with:
- automated scheduling
- live standings
- realtime scoring
- optimized player balancing
- court management

---

# Target Users

## Primary
- Tennis clubs
- Community organizers
- Tennis academies
- Amateur leagues

## Secondary
- Casual tennis communities
- Recreational players

---

# Core Features

## Authentication
- Supabase Auth
- Google login
- Email login
- Guest player join
- Organizer/admin permissions

---

# Tournament Formats

Supported formats:
- Americano
- Mexicano
- Round Robin
- Single Elimination
- Double Elimination
- Mixed Doubles
- Team Cup
- Ladder

---

# Tournament Creation

Fields:
- tournament name
- description
- date/time
- location
- number of courts
- player capacity
- match duration
- scoring rules
- tournament visibility

---

# Player Management

Features:
- registration
- player ratings
- attendance check-in
- profile picture
- gender balancing
- statistics

---

# Scheduling Engine

Requirements:
- automatic pairing
- automatic court assignment
- teammate duplication prevention
- opponent duplication minimization
- skill balancing
- mixed doubles balancing

---

# Americano Engine

Core Rules:
- rotate teammates every round
- cumulative scoring
- balanced court rotation
- fair opponent distribution

Optimization Goals:
1. minimize repeated teammates
2. minimize repeated opponents
3. balance skill averages
4. equalize court usage

---

# Live Match Operations

Features:
- realtime score updates
- match timers
- active court monitoring
- completed match tracking
- walkovers

---

# Leaderboard System

Metrics:
- points
- wins/losses
- differential
- live rankings
- ranking movement

---

# Public Tournament Pages

Features:
- live standings
- schedules
- live scoring
- shareable links

---

# Notifications

- WhatsApp share links
- match reminders
- score updates

---

# Analytics

Features:
- player performance
- win rates
- participation history
- court utilization

---

# Database Architecture

## users
- id
- name
- email
- avatar_url
- role

## tournaments
- id
- organizer_id
- name
- format
- location
- courts
- match_duration
- status

## players
- id
- tournament_id
- user_id
- rating
- gender

## rounds
- id
- tournament_id
- round_number

## matches
- id
- round_id
- court_number
- scores
- status

## standings
- id
- tournament_id
- player_id
- points
- differential

---

# Tech Stack

Frontend:
- Streamlit

Backend:
- FastAPI

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth

Realtime:
- Supabase Realtime

Storage:
- Supabase Storage

Deployment:
- Railway

---

# Deployment Architecture

Railway
    ↓
FastAPI + Streamlit
    ↓
Supabase Backend Services

---

# Security

- Row-level security
- JWT authentication
- secure API routes
- role-based permissions

---

# Future Features

- AI scheduling optimization
- QR check-in
- Elo rankings
- Stripe subscriptions
- mobile apps
- season rankings

---

# Monetization

## Free
- 1 active tournament

## Pro
- unlimited tournaments
- analytics
- exports

## Club
- memberships
- custom branding
- advanced analytics

---

# Success Metrics

- tournament creation <3 minutes
- instant schedule generation
- realtime standings sync
- reduced manual coordination
