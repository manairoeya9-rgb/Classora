# Classora — School Management Platform

A modern school management platform designed to simplify communication, organization, and administrative workflows within educational institutions.

## Overview

Classora is a web application that brings together the different members of a school community through dedicated interfaces and role-based access.

The platform aims to provide a centralized environment for managing school-related activities and improving collaboration between administrators, teachers, parents, students, and administrative staff.

## User Spaces

Classora is organized into five dedicated spaces:

- **Administration:** Centralized school administration and platform management.
- **Teachers:** A dedicated workspace for teaching staff.
- **Parents:** Access to information related to their children's school life.
- **Students:** A student-oriented interface.
- **Secretariat:** Administrative and school-office workspace.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development and build tooling |
| Tailwind CSS | Interface styling |
| React Router | Application navigation |
| Supabase | Backend services and database |

## Architecture

The application follows a feature-oriented structure to organize its code and facilitate maintenance.

```text
src/
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── fees/
│   ├── messages/
│   └── settings/
├── lib/
└── types/
```

## Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase project

### Installation

1. Clone the repository:

```bash
git clone https://github.com/OunaiesEya/Classora.git
```

2. Navigate to the project directory:

```bash
cd Classora
```

3. Install dependencies:

```bash
npm install
```

4. Configure environment variables.

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Replace the placeholders with your own Supabase project configuration.

**Never commit your `.env` file or private service-role credentials.**

5. Start the development server:

```bash
npm run dev
```

6. Build the application:

```bash
npm run build
```

## Security

- Environment variables are excluded from version control.
- Supabase access policies should be configured to protect application data.
- User permissions should be enforced through secure backend authorization.
- Private credentials must never be exposed in the frontend.

## Project Status

Classora is an ongoing development project. Features, interfaces, and backend integrations may evolve as development progresses.

## Author

**Eya Ounaies**

Business Intelligence Student | Aspiring Data Analyst | Web Development Enthusiast

GitHub: [@OunaiesEya](https://github.com/OunaiesEya)

---

*Classora — Connecting the school community through technology.*
