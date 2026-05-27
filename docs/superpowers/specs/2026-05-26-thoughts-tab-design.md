# Thoughts Tab Design

## Overview

Add a "Thoughts" section to the personal site — a place for short paragraph-sized titbits, separate from long-form blog posts. Accessible via a dropdown under the blog navbar item.

## Data Storage

Thoughts are stored in per-year YAML files under `_data/thoughts/`:

```
_data/
  thoughts/
    2026.yml
    2025.yml
```

Each file is a YAML list of entries:

```yaml
- title: "Some title"
  date: 2026-05-25
  content: "The paragraph text of the thought."
```

Adding a thought = appending an entry to the current year's file. New year = new file. No Jekyll collection required.

## Thoughts Page (`_pages/thoughts.md`)

- Permalink: `/thoughts/`
- `nav: false` — not a direct navbar item
- Renders `site.data.thoughts` (a hash keyed by year filename)
- Years sorted descending; within each year, entries sorted by date descending
- Each entry displays: title (bold), date (muted, smaller), content paragraph

No pagination for now — all entries on one page.

## Navbar Changes

The "blog" nav item becomes a dropdown titled "blog" with two children:

- **Posts** → `/blog/`
- **Thoughts** → `/thoughts/`

Implementation: modify `_pages/blog.md` to use the dropdown pattern (same as `_pages/dropdown.md`), removing the standalone blog page and replacing it with a dropdown container. The existing `blog.md` page content moves to a child permalink.

## Files Changed

| File | Change |
|------|--------|
| `_data/thoughts/2026.yml` | Create — initial thoughts data file |
| `_pages/thoughts.md` | Create — thoughts listing page |
| `_pages/blog.md` | Modify — convert to dropdown nav item |