# Marginalia

A personal site built with [Eleventy (11ty)](https://www.11ty.dev/). Static site,
self-hosted on GitHub Pages, no database, no infinite scroll, fully hand-editable.

## One-time setup

1. **Install dependencies** (only needed once, or after pulling changes that touch `package.json`):
   ```
   npm install
   ```

2. **Create a GitHub repo** and push this folder to it.

3. **Turn on GitHub Pages via Actions**:
   In your repo → Settings → Pages → under "Build and deployment", set **Source** to
   **GitHub Actions**. That's it — the workflow in `.github/workflows/deploy.yml`
   handles the rest on every push to `main`.

4. **Update your real URL** in two places (replace `YOUR-USERNAME` / `YOUR-REPO-NAME`):
   - `src/_data/metadata.json` → `"url"` field
   - `eleventy.config.js` → the `base` field inside the `feedPlugin` config

   If you're using a custom domain instead of the default `username.github.io/repo`,
   put that domain in both places instead.

## Daily workflow (writing a new entry)

1. Create a new file in `src/posts/`, named like `YYYY-MM-DD-a-short-slug.md`.
   The date in the filename doesn't have to match `date:` in the front matter, but
   keeping them in sync makes files easier to find later.

2. Add front matter at the top — this is the *only* required boilerplate:
   ```markdown
   ---
   title: Whatever you want to call it
   date: 2026-08-01
   tags: [posts, journal]
   ---
   Your writing goes here, in plain Markdown.
   ```
   You don't need to add `layout:` — every file in `src/posts/` already inherits
   `layout: post.njk` from `src/posts/posts.json`. You also don't need to update
   any archive page, tag list, or homepage by hand — they all regenerate from
   what's in the `tags:` field.

3. **Preview it locally** before publishing:
   ```
   npx eleventy --serve
   ```
   Open the local address it prints (usually `http://localhost:8080`). It live-reloads
   as you edit.

4. **Publish**:
   ```
   git add .
   git commit -m "new entry: whatever you called it"
   git push
   ```
   GitHub Actions rebuilds and redeploys automatically — usually live within a minute.
   You never manually run a build command for the live site; only for local preview.

## Adding photos

Drop image files into `src/images/`, then reference them in a post with normal
Markdown or HTML:
```markdown
![Description of the photo](/images/whatever.jpg)
```

## Wanting custom CSS/HTML on just one entry

You're not limited to plain Markdown. Any post file can drop into raw HTML,
including a `<style>` block scoped to that entry, right in the middle of the
Markdown — see `src/posts/2026-07-14-portrait-unfolding.md` for a working example
(a hover-triggered popup on an image). This doesn't affect any other page.

## How organization works (so you don't have to think about it later)

- **Archive** (`/archive/`): every post, newest-first, paginated at 15 per page
  (change the `size:` value in `src/archive.njk` if you want a different count).
  This is why there's no infinite scroll — pages are numbered, not endless.
- **Tags** (`/tags/`): a tag page is generated automatically for every unique
  value you use in a post's `tags:` list. Nothing to maintain by hand — add a
  new tag to a post, and its tag page appears on the next build.
- **Homepage** (`/`): shows the 8 most recent entries, with a link to the full archive.
- **RSS/Atom feed** (`/feed.xml`): anyone (including you, in a feed reader) can
  subscribe and get new entries without visiting the site.

## Project structure

```
src/
├── posts/              one file per entry — this is where you'll spend most of your time
│   └── posts.json      shared defaults (layout, base tag) for every post — don't need to touch this often
├── _layouts/
│   ├── base.njk         the overall page shell: header, nav, footer
│   └── post.njk         wraps each individual entry with title/date/tags
├── _data/
│   └── metadata.json    site title, description, URL — used in layouts and the RSS feed
├── css/
│   └── style.css        all styling lives here (plus any scoped <style> blocks inside individual posts)
├── images/              photos and other images
├── index.njk            homepage
├── archive.njk           paginated full archive
├── tags.njk              index of all tags
├── tag-page.njk          template that generates one page per tag (don't create these by hand)
└── about/
    └── index.njk         edit freely, it's just a normal page
```

## Local commands reference

| Command | What it does |
|---|---|
| `npx eleventy` | One-time build, output goes to `_site/` |
| `npx eleventy --serve` | Local preview server with live reload |
| `npx eleventy --serve --port=8081` | Same, on a different port if 8080 is busy |
