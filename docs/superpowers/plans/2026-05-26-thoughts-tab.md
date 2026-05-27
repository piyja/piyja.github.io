# Thoughts Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Thoughts" section — short paragraph titbits stored in per-year YAML files — accessible via a dropdown under the blog navbar item.

**Architecture:** Thoughts are stored in `_data/thoughts/YYYY.yml` files (one per year). A new `_pages/thoughts.md` page renders them all in reverse-chronological order using Liquid. The existing blog nav item is converted to a dropdown with "Posts" and "Thoughts" children.

**Tech Stack:** Jekyll, Liquid templates, YAML data files, al-folio theme (Bootstrap-based)

---

### Task 1: Create the thoughts data structure

**Files:**
- Create: `_data/thoughts/2026.yml`

- [ ] **Step 1: Create the 2026 thoughts data file**

Create `_data/thoughts/2026.yml` with two sample entries so the page has content to render:

```yaml
- title: "Why constraints breed creativity"
  date: 2026-05-26
  content: "The best ideas I've had didn't come from unlimited time and resources — they came from tight deadlines and limited tools. Constraints force you to think laterally, to strip away everything non-essential, and to find elegance in simplicity. The next time you feel boxed in, consider that the box might be the point."

- title: "On writing to think"
  date: 2026-05-20
  content: "I've noticed I don't fully understand something until I try to write it down. Writing forces precision — you can't hide behind a vague mental model when you have to commit words to a page. It's less about the output and more about what the act of writing reveals about the gaps in your thinking."
```

- [ ] **Step 2: Commit**

```bash
git add _data/thoughts/2026.yml
git commit -m "feat: add thoughts data structure with sample entries"
```

---

### Task 2: Create the thoughts listing page

**Files:**
- Create: `_pages/thoughts.md`

- [ ] **Step 1: Create `_pages/thoughts.md`**

```markdown
---
layout: default
permalink: /thoughts/
title: thoughts
nav: false
---

<div class="post">
  <div class="header-bar">
    <h1>Thoughts</h1>
  </div>

  {% assign thought_years = site.data.thoughts | sort | reverse %}

  {% for year_data in thought_years %}
    {% assign year = year_data[0] %}
    {% assign entries = year_data[1] | sort: "date" | reverse %}

    <h4 class="mt-4 mb-2" style="border-bottom: 1px solid var(--global-divider-color); padding-bottom: 0.3rem;">
      <i class="fa-solid fa-calendar-days fa-sm"></i> &nbsp; {{ year }}
    </h4>

    {% for thought in entries %}
      <div class="thought-entry mb-4">
        <h5 class="mb-1">{{ thought.title }}</h5>
        <p class="post-meta mb-2" style="font-size: 0.85rem;">
          <i class="fa-solid fa-calendar fa-sm"></i>
          {{ thought.date | date: "%B %d, %Y" }}
        </p>
        <p>{{ thought.content }}</p>
      </div>
    {% endfor %}

  {% endfor %}
</div>
```

- [ ] **Step 2: Verify Jekyll builds without error**

```bash
cd /Users/JADHAPI/personal/piyja.github.io
bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds` with no errors.

- [ ] **Step 3: Commit**

```bash
git add _pages/thoughts.md
git commit -m "feat: add thoughts listing page at /thoughts/"
```

---

### Task 3: Convert blog nav item to dropdown

**Files:**
- Modify: `_pages/blog.md`

The current `_pages/blog.md` has `nav: true` and `nav_order: 1`. We'll convert it to a dropdown container. The blog listing content stays at `/blog/` — only the nav entry changes.

- [ ] **Step 1: Replace the front matter in `_pages/blog.md`**

The current file starts with:
```yaml
---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
---
```

Replace only the front matter (lines 1–7) with:
```yaml
---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
dropdown: true
children:
  - title: posts
    permalink: /blog/
  - title: thoughts
    permalink: /thoughts/
---
```

Leave the rest of the file (the Liquid content) exactly as-is.

- [ ] **Step 2: Verify Jekyll builds without error**

```bash
bundle exec jekyll build 2>&1 | tail -20
```

Expected: `done in X seconds` with no errors.

- [ ] **Step 3: Serve locally and verify the dropdown appears**

```bash
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000` in a browser. Confirm:
- "blog" navbar item shows a dropdown arrow
- Clicking it reveals "posts" and "thoughts"
- "posts" links to `/blog/` and shows the existing post list
- "thoughts" links to `/thoughts/` and shows the two sample entries grouped under "2026"

- [ ] **Step 4: Commit**

```bash
git add _pages/blog.md
git commit -m "feat: convert blog nav to dropdown with posts and thoughts children"
```

---

### Task 4: Wire up `_config.yml` collection (if needed)

Jekyll auto-exposes `_data/` files as `site.data` — no config changes are needed for YAML data files. This task is a verification step only.

- [ ] **Step 1: Confirm `site.data.thoughts` is accessible**

After `bundle exec jekyll serve`, open `http://localhost:4000/thoughts/` and confirm entries render. If the page is blank (no entries show), add this to `_config.yml` under the `collections:` key:

```yaml
collections:
  thoughts:
    output: false
```

Otherwise skip — no change needed.

---

### Task 5: Add a sample thought for a second year (optional smoke test)

This validates the multi-year sorting logic.

**Files:**
- Create: `_data/thoughts/2025.yml`

- [ ] **Step 1: Create `_data/thoughts/2025.yml`**

```yaml
- title: "The hidden cost of optionality"
  date: 2025-11-10
  content: "Keeping options open feels prudent, but it has a real cost: deferred decisions accumulate as unresolved tension. The more options you maintain, the more mental overhead you carry. Sometimes the most productive thing you can do is close a door deliberately, so you can fully walk through the one you've chosen."
```

- [ ] **Step 2: Verify the thoughts page shows two year sections**

Open `http://localhost:4000/thoughts/`. Confirm:
- "2026" section appears first with two entries
- "2025" section appears below with one entry

- [ ] **Step 3: Commit**

```bash
git add _data/thoughts/2025.yml
git commit -m "test: add 2025 sample thought to verify multi-year rendering"
```