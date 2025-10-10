# Protize - A Modern Portfolio Website

Protize is a modern, content-driven portfolio website built with **Astro** and **Tailwind CSS**, leveraging **Tailus UI blocks** for fast, responsive, and visually appealing design.

## 🛠️ Technology Stack

Protize is built using a modern, performant, and scalable web stack:

- **Astro** – The all-in-one web framework optimized for content-driven sites  
- **Tailwind CSS** – A utility-first CSS framework for rapid UI development  
- **Tailus Blocks** – Ready-made UI components and layouts for beautiful interfaces  
- **TypeScript** – Ensures robust, maintainable, and type-safe code  
- **Markdown & MDX** – Simple, flexible content management  
- **GitHub Pages** – For easy, fast, and reliable deployment  
- **GitHub Actions** – Automates builds and deployments for continuous delivery  

## 🚀 Setup Instructions

### 1. **Prerequisites**

Before you start, ensure you have the following installed on your system:

- **Node.js** (v22 or higher) – [Download Node.js](https://nodejs.org/)  
- **npm** (comes with Node.js) – For managing project dependencies  
- **Git** – To clone the repository and manage version control  
- **VS Code** or any code editor of your choice – Recommended for editing and development  
- **GitHub account** – To use GitHub Actions for continuous deployment  

### 2. **Installation**

Follow these steps to set up the Protize project locally:

1. **Clone the repository**
```bash
git clone git@github.com:protize/protize-website.git
cd protize-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
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

- `feat/add-contact-form`
- `fix/fix-header-layout`
- `docs/update-readme`
- `docs/readme-revision`

### Pull Requests and Merging

Title your PRs following the commit convention since they will become the commit message after squashing. When ready to merge:

1. Click "Merge" on the PR.
2. Select "Squash and merge."
3. Ensure the PR title is properly formatted, as it will be the squash commit message.
4. Confirm to merge and squash.

This keeps our main branch history linear and understandable, with each commit representing a single set of related changes.