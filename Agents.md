# Agents.md - Project Guidelines for TimeNest

This document serves as the primary source of truth for AI agents and developers working on the **TimeNest** project. It outlines the technology stack, project structure, coding standards, and architectural decisions.

## 🚀 Project Overview
TimeNest is a smart cancellation management platform designed for small businesses (e.g., salons, spas, medical clinics). It helps businesses manage appointments, handle cancellations efficiently, and communicate with customers.

## 🛠 Technology Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Database**: 
  - **Mongoose/MongoDB** (Current Primary): Used for user registration, login, and business management.
  - **Prisma/SQLite** (Ready Setup): Initialized with `schema.prisma`, but core logic currently relies on Mongoose models in `src/lib/models`.
- **Icons**: [Heroicons](https://heroicons.com/)
- **Deployment**: Configured for standard Next.js deployment.

## 📁 Project Structure
```text
/
├── prisma/             # Prisma schema and SQLite database
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router (pages and API routes)
│   │   ├── api/        # Backend functionality (Auth, Registration)
│   │   └── dashboard/  # Business-facing dashboard
│   ├── components/     # Reusable UI components
│   ├── lib/            # Shared utilities and DB configuration
│   │   ├── models/     # Mongoose schemas (User, Business)
│   │   └── db.ts       # MongoDB connection logic
│   ├── styles/         # Global styles and Tailwind imports
│   └── types/          # TypeScript definitions
├── tailwind.config.ts  # Theme and color configurations
└── Agents.md           # This file
```

## 🎨 Design System & Styling
- **Fonts**: 
  - Sans: `Poppins` (Primary UI)
  - Serif: `Playfair Display` (Headings)
  - Decorative: `Great Vibes` (Logo/Branding)
- **Colors**:
  - `primary`: `#B667F1` (Signature Purple)
  - `bg-primary`: `#FFFFFF`
  - `text-primary`: `#333333`
  - `text-secondary`: `#666666`
- **Conventions**:
  - Use Tailwind utility classes for all styling.
  - Custom component classes (e.g., `.btn-primary`, `.input-field`) are defined in `src/app/globals.css`.

## 💾 Database Guidelines
- When adding new models or fields, ensure they are added to the appropriate Mongoose schema in `src/lib/models`.
- Always use the `dbConnect` utility from `@/lib/db` before performing database operations in API routes.
- Be aware of the dual-setup: If switching to Prisma for new features, ensure consistency with existing MongoDB data if necessary.

## 🤖 Guidelines for AI Agents
1. **Consistency**: Follow the existing patterns for API routes and component architecture.
2. **Types**: Always use TypeScript and define interfaces for data structures.
3. **Responsive Design**: Ensure all UI components are mobile-friendly using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).
4. **Auth**: Use `authOptions` from `@/app/api/auth/[...nextauth]/route.ts` for session management and protected routes.
5. **Proactivity**: If a proposed change affects both the Mongoose models and the UI, update both in the same task.
6. **Database**: Use Prisma for new features, but ensure consistency with existing MongoDB data if necessary.
7. **Testing**: Create unit tests for all new features and ensure they work as expected.
8. **Testing**: Run the tests and ensure they pass before completing the task.
9. **Problem Solving**: Update this document with new guidelines if you see that beneficial for agents.

---
*Created: 2026-02-21 | Last Updated: 2026-02-21*
