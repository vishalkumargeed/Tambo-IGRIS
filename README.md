# Tambo Sentinel (IGRIS)

GitHub repository management and exploration web app with an integrated AI assistant powered by **Tambo AI**.  
Sign in with GitHub, browse your repositories, pull requests, and issues, and get AI help directly on top of your code and PRs.

> **What this is:** a Next.js app that acts as a smart GitHub dashboard plus an AI co-pilot for your repos.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running in Development](#running-in-development)
  - [Production Build](#production-build)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **GitHub OAuth login**
  - Secure sign‑in with your GitHub account.
  - Access to your public and (with proper scopes) private repositories.

- **Repository dashboard**
  - Paginated list of your repositories.
  - Quick access to repo details, PRs, issues, and code.

- **Pull request management**
  - View open and closed pull requests for a repository.
  - Inspect PR details and file changes.

- **Issues management**
  - List and browse repository issues.
  - See important metadata (title, status, etc.).

- **Code explorer**
  - Browse a repository’s file tree.
  - Quickly jump to files (with guidance to open in GitHub where appropriate).

- **AI assistant (Tambo AI)**
  - Collapsible chat panel integrated into repository views.
  - Ask questions about the repo, PRs, and code.
  - Keyboard shortcut: **Ctrl+I / Cmd+I** to toggle.

- **Modern UI & DX**
  - Next.js App Router, TypeScript, Tailwind, and shadcn/ui.
  - Dark mode with system preference support.
  - Optimized for GitHub content (avatars, markdown, etc.).

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI / Styling**:
  - React + Tailwind CSS
  - [shadcn/ui](https://ui.shadcn.com/) and Radix UI primitives
  - Dark/light theme support
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (GitHub OAuth)
- **AI integration**: [Tambo AI](https://tambo.ai/) (`@tambo-ai/react`, `@tambo-ai/typescript-sdk`)
- **Markdown rendering**: `react-markdown`, `remark-gfm`, `github-markdown-css`
- **Tooling**: ESLint, Next.js build pipeline

---

## Getting Started

### Prerequisites

- **Node.js** v20+
- **Package manager**: npm, yarn, pnpm, or bun
- **GitHub OAuth App** (Client ID & Client Secret)
- **Tambo AI API key**

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ihimanshu07/Tambo-IGRIS.git
cd Tambo-IGRIS

# choose one:
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
# In production, set this to your real domain:
# NEXTAUTH_URL=https://your-domain.com

# Tambo AI
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key
```

#### GitHub OAuth setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps**.
2. Create a new OAuth App.
3. Set **Authorization callback URL** to:

   ```text
   http://localhost:3000/api/auth/callback/github
   ```

4. Copy the **Client ID** and **Client Secret** into `.env.local` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

### Running in Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

This runs the **optimized production build** on the default Next.js port (3000) unless configured otherwise.

---

## Usage

1. **Start the app** using the steps above.
2. **Sign in with GitHub** when prompted.
3. On the **dashboard**, select a repository to explore.
4. Use the tabs/sections to:
   - View **pull requests** and details.
   - Browse **issues**.
   - Inspect the **code tree**.
5. Open the **Tambo AI chat** panel (Ctrl+I / Cmd+I) to:
   - Ask questions about the repository.
   - Get help understanding PRs or files.
   - Receive suggestions or explanations about the codebase.

---

## Project Structure

High‑level structure (simplified):

```text
Tambo-IGRIS/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (GitHub proxy, auth, repo data)
│   ├── dashboard/            # Main dashboard page
│   ├── repo/[id]/            # Repository-specific pages
│   │   ├── code/             # Code explorer
│   │   ├── issues/           # Issues list & details
│   │   └── pr/               # Pull request pages
│   └── page.tsx              # Landing page
├── components/               # Shared UI components
│   ├── tambo/                # Tambo AI chat components
│   └── ui/                   # shadcn/ui wrappers
├── lib/                      # Utilities and configuration
│   ├── tambo.ts              # Tambo AI configuration
│   └── utils.ts              # Helper functions
├── auth.ts                   # NextAuth configuration
├── middleware.ts             # Auth / route protection middleware
└── next.config.ts            # Next.js configuration
```

This may evolve over time; check the actual folders for the most up‑to‑date layout.

---

## Available Scripts

The following npm scripts are commonly used:

- `npm run dev` – Start the development server.
- `npm run build` – Create an optimized production build.
- `npm run start` – Start the production server (after `build`).
- `npm run lint` – Run ESLint checks.

If you use yarn or pnpm, replace `npm run` with `yarn` / `pnpm` equivalents.

---

## Deployment

This is a standard Next.js app and can be deployed to platforms like **Vercel**, **Netlify**, or your own Node.js server.

For **Vercel**:

1. Push the repository to GitHub.
2. Create a new project in Vercel and import this repo.
3. Configure the following environment variables in Vercel:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `NEXTAUTH_URL` (Vercel often sets `VERCEL_URL` automatically)
   - `NEXT_PUBLIC_TAMBO_API_KEY`
4. Deploy – Vercel will run `npm install`, `npm run build`, and then host the app.

Make sure your **GitHub OAuth callback URL** matches the production domain (e.g. `https://your-domain.com/api/auth/callback/github`).

---

## Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and run `npm run lint`.
4. Commit and push: `git push origin feature/your-feature-name`.
5. Open a pull request with a clear description of your changes.

---

## License

No explicit license has been added yet.  
If you plan to use or distribute this project, consider adding a suitable license (e.g. MIT, Apache 2.0) and updating this section.
