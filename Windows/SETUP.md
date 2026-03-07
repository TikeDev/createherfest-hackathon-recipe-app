# Simmer — Windows Setup Guide

Follow these steps in order. Each section tells you exactly what to do and what to expect.

---

## Before You Start — What You Need to Install

| Tool | Why | Required? |
|------|-----|-----------|
| Node.js 20+ | Runs the app and build tools | Yes |
| pnpm | Installs JavaScript packages | Yes |
| Python 3.10+ | Runs the recipe scraper API | Yes (for URL import) |

---

## Step 1 — Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the button on the left)
3. Run the installer — click **Next** through all the defaults
4. When it finishes, open **Command Prompt** (`Win + R` → type `cmd` → Enter)
5. Type this and press Enter:

```
node --version
```

You should see something like `v20.x.x`. If you do, Node is installed.

---

## Step 2 — Install pnpm

In the same Command Prompt window, paste this and press Enter:

```
npm install -g pnpm
```

Then confirm it worked:

```
pnpm --version
```

You should see a version number like `9.x.x`.

---

## Step 3 — Install Python

1. Go to [https://www.python.org/downloads/windows](https://www.python.org/downloads/windows)
2. Click **Download Python 3.x.x** (the yellow button at the top)
3. Run the installer
4. **Important:** On the first screen, check the box that says **"Add Python to PATH"** before clicking Install
5. Click **Install Now**
6. When done, open a **new** Command Prompt window and type:

```
python --version
```

You should see `Python 3.x.x`.

---

## Step 4 — Navigate to the Project Folder

In Command Prompt, type:

```
cd C:\Projects\simmer
```

(Replace `C:\Projects\simmer` with wherever you cloned the repository.)

Press Enter. Your prompt should now show that path.

---

## Step 5 — Install JavaScript Dependencies

```
pnpm install
```

This downloads all the React/Vite/Tailwind packages. It takes about 30–60 seconds. When it finishes you should see something like `Done in Xs`.

---

## Step 6 — Install Python Dependencies

```
pip install -r requirements.txt
```

This installs `recipe-scrapers` and `requests` — used by the recipe URL importer. Takes about 10–20 seconds.

---

## Step 7 — Set Up Your API Key

1. In File Explorer, go to your project folder (e.g., `C:\Projects\simmer`)
2. Find the file named `.env.example`
3. Make a copy of it in the same folder and rename the copy to `.env`
   - Right-click → Copy, then right-click → Paste, then rename the new file
4. Open `.env` in Notepad (right-click → Open with → Notepad)
5. Replace `sk-...` with your actual OpenAI API key:

```
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

6. Save and close the file

> **Where do I get an API key?** Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys), sign in, and click **Create new secret key**.

---

## Step 8 — Start the App

```
pnpm dev
```

After a few seconds you'll see output like:

```
  VITE v6.x.x  ready in xxx ms

  Local:   http://localhost:5173/
```

Open your browser and go to **http://localhost:5173**. You should see the Simmer landing page.

---

## All Done

To stop the app at any time, press `Ctrl + C` in the Command Prompt window.

---

## Quick Reference — Commands You'll Use

| What | Command |
|------|---------|
| Start the app | `pnpm dev` |
| Build for deployment | `pnpm build` |
| Run linter | `pnpm lint` |
| Preview production build locally | `pnpm preview` |
