# 🔗 My Link - Project Guide & Instructions

This document integrates project intent, user scenarios, technical architecture, and development guidelines for the **My Link** project.

## 🚀 Project Overview
My Link is a "Link-in-bio" service for creators to consolidate all their links into a single shared page. It emphasizes an intuitive **WYSIWYG** management experience through inline editing.

- **Goal**: Fast profile management, modern link display, and automatic domain favicon integration.
- **URL Structure**: `mylink.com/[displayName]` (Auto-generated from Google ID, customizable).

## 🛠 Tech Stack
- **Framework**: Next.js 16.1.7 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.2+, shadcn/ui
- **Backend/Auth**: Firebase (Authentication, Firestore)
- **Icons**: Lucide-React, Google Favicon API
- **Fonts**: Geist (Sans/Mono), Playfair Display (Heading)

## 📋 Core Features (PRD Summary)
1. **Auth**: Firebase Google Social Login only. Initial `displayName` set from email prefix.
2. **Profile Management (Inline Edit)**: 
   - Instant editing via text clicks.
   - Separate management for `username` (display name) and `displayName` (URL slug).
3. **Link Management (CRUD)**: 
   - Add links with URL and title.
   - Auto-favicon generation via Google API.
4. **Public Viewer**: Mobile-optimized page for visitors.
5. **Analytics (Phase 2)**: Track and display link click counts.

## 👤 User Scenarios
- **Owner**: Login -> Check initial slug -> Inline edit profile/bio -> Add links (verify favicons) -> Share link.
- **Visitor**: Access `mylink.com/slug` -> View profile/links -> Click link (new tab) -> Increment click count.

## 📂 Project Structure
- `app/`: Next.js App Router pages (Home, Admin, Public)
- `components/`: UI & Common components (shadcn/ui in `ui/`)
- `docs/`: `@PRD.md`, `@USER_SCENARIO.md`, `@WIREFRAME.md` (Project Docs)
- `lib/`: Firebase config & Utility functions (`utils.ts`)

## 📏 Dev Guidelines
- **UI Consistency**: Maintain near-identical layout between Admin and Public views for WYSIWYG.
- **Validation**: Always verify changes via `npm run build` and `npm run typecheck`.
- **State**: Use Firebase real-time listeners or React state for instant inline feedback.

## ⌨️ Commands
- `npm run dev`: Dev server (Turbopack)
- `npm run build`: Production build
- `npm run lint`: Lint check
- `npm run format`: Prettier format
- `npm run typecheck`: TS type check
