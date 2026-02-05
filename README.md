# Protize Website – Modern Content-Driven Tech Platform

Protize Website is a modern, content-driven company site built with **Astro** and **Tailwind CSS**, using **Tailus UI blocks** for fast, responsive, and premium UI delivery.  
It is designed for service companies, product studios, SaaS brands, and tech consultancies that need performance, flexibility, and easy content updates.

![Protize Light Theme](./public/protize-light.png)
![Protize Dark Theme](./public/protize-dark.png)

---

## 🛠️ Technology Stack

Protize Website is built with a modern, scalable stack:

- **Astro** – High-performance framework for content-first websites  
- **Tailwind CSS** – Utility-first CSS framework for rapid UI development  
- **Tailus Blocks** – Reusable UI blocks for modern layouts  
- **TypeScript** – Type safety and maintainable codebase  
- **Markdown & MDX** – Flexible content authoring  
- **GitHub Pages / Vercel / Netlify** – Fast deployment options  
- **GitHub Actions** – Automated CI/CD workflows  

---

## 🚀 Setup Instructions

### 1) Prerequisites

Make sure the following are installed:

- **Node.js** (v18 or higher) – [Download Node.js](https://nodejs.org/)  
- **npm** (bundled with Node.js) or **Yarn / pnpm**  
- **Git** – for version control  
- **VS Code** (recommended)  
- **GitHub account** (if deploying through GitHub Actions / Pages)

---

### 2) Installation

1. **Clone the repository**
```bash
git clone https://github.com/<your-username>/protize-website.git
cd protize-website

```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                             |
| :--------------------- | :------------------------------------------------- |
| `npm install`          | Installs dependencies                              |
| `npm run dev`          | Starts local dev server at `localhost:3000`        |
| `npm run build`        | Build your production site to `./dist/`            |
| `npm run preview`      | Preview your build locally, before deploying       |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro preview` |
| `npm run astro --help` | Get help using the Astro CLI                       |


## 📘 Commit and PR Title Convention

We apply a standard for commit messages and PR titles to keep our history readable. Upon merging, PR titles are used as the squash commit message, so they should clearly describe the changes using the following types:

- `feat`: Introducing new features.
- `fix`: Bug fixes.
- `improve`: Improvements or changes.
- `docs`: Documentation updates.
- `refactor`: Code refactoring.
- `test`: Adding or updating tests.
- `chore`: Routine tasks and maintenance.

## 🌿 Branch Naming and PR Merging

### Branch Naming

Create branches with descriptive names encapsulating the purpose of the changes:

```
[type]/[short-description]
```

Examples:

- `feat/checkout-process`
- `fix/payment-timeout`
- `docs/readme-revision`

### Pull Requests and Merging

Title your PRs following the commit convention since they will become the commit message after squashing. When ready to merge:

1. Click "Merge" on the PR.
2. Select "Squash and merge."
3. Ensure the PR title is properly formatted, as it will be the squash commit message.
4. Confirm to merge and squash.

This keeps our main branch history linear and understandable, with each commit representing a single set of related changes.