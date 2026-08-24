# Biology Quiz Centre — Setup

## 1. Create the Supabase project

1. Create a new Supabase project (or reuse an existing one you want dedicated to this app).
2. Open the SQL editor and run [`schema.sql`](schema.sql) once. It creates `users`, `questions`, `question_flags`, `attempts` and enables permissive row-level security (see the note at the bottom of that file — fine for a low-stakes school tool, not a real access boundary).
3. Copy your project's **Project URL** and **anon public key** from Settings → API.

## 2. Configure the app

Copy `.env.example` to `.env` and fill in the two values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## 4. Before students use it

- Run [`admin_password_setup.sql`](admin_password_setup.sql) once in the SQL editor, then log in to Admin (password starts as `admin123`) and use **Change Password** to set your own.
- Update `SCHOOL_NAME` in `src/App.jsx` if you want your school's name in the header.
- Log in as admin → **Students** tab → add students (single or bulk paste).
- Log in as admin → **Questions** tab → pick a module + inquiry question → add questions (single or bulk JSON import). Every question is live to students immediately — there's no draft/review step, so double-check content before saving.

## How it works (quick reference)

- **One flat question bank per inquiry question** — no more manually-numbered quizzes. Students always pick how many questions they want to practise.
- Three practice scopes, all pulling a random subset from the question pool: an **inquiry question** (min 5), a **whole module** (min 20, max 100), or the **whole year** (min 20, max 100).
- Feedback is instant, question-by-question — no waiting on a teacher to "release" answers. This is a revision tool, not a test.
- Every attempt is saved permanently (`attempts` table), so students build a visible practice history and reattempt as often as they like.
- Admin → **Progress** tab shows practice volume per student (attempts, questions practised, average score) rather than single quiz grades.

## Deploying

Any static host that can run a Vite build works (Netlify, Vercel, GitHub Pages, or paste into Bolt). Set the two `VITE_SUPABASE_*` environment variables in the host's project settings, then `npm run build` and deploy the `dist/` folder (or let the host do it for you).
