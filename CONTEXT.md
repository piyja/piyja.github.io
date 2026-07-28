# Project Context

Jekyll academic portfolio site (al-folio theme) hosted at piyja.github.io.

## Stack
- Jekyll + Liquid templating, GitHub Pages via GitHub Actions
- Bootstrap 4 + MDB v4.20.0, jQuery 3.6, D3.js v7
- SCSS (`_sass/`), PurgeCSS post-build

## Blog Tab Structure (`_pages/blog.md`)
Four sub-tabs on the `/blog/` page, implemented with custom JS + `.tab-nav-ml` CSS:
| Tab | data-tab | Content source |
|-----|----------|----------------|
| Field Notes | `my-titbits` | `site.posts` where `categories contains 'Field Notes'` |
| ML Basics | `ml-basics` | `site.posts` where `categories contains 'ML Basics'` |
| Study Notes | `study-notes` | `site.study_notes` collection, grouped by `category` |
| Graph view | `graph-view` | D3 force graph, right-aligned via `margin-left:auto` |

## Collections
- `_posts/` — standard Jekyll posts (layout: post)
- `_notes/` — knowledge graph notes (layout: note, permalink `/notes/:slug/`)
- `_study-notes/` — study documents (layout: post, permalink `/study-notes/:path/`)

## Knowledge Graph Feature
**Entry point:** `Graph view` tab in blog page (lazy-initialized via `window.__kgInit()`).

**Data pipeline:**
1. `assets/json/graph-data.json` — Liquid template; merges all three collections via `concat`, outputs nodes + links JSON at build time
2. `_includes/scripts/knowledgeGraph.liquid` — conditionally loads D3 + graph script when `page.knowledge_graph: true`
3. `assets/js/knowledge-graph.js` — D3 v7 force-directed graph (IIFE, strict mode)

**Node types (visual):**
- `note` — solid filled circle
- `post` — hollow, short-dashed stroke (`4,2`)
- `study` — hollow, long-dashed stroke (`6,2`)

**Node colors by group:** AI Engineering `#7c6af7`, AI Agents `#4fc3f7`, Research `#81c784`, Field Notes `#f06292`, ML Basics `#ffb74d`, System Design `#ff8a65`, Study Notes `#4db6ac`

**Edge sources (merged before D3 renders):**
1. Frontmatter `links:` array in `_notes/*.md` (explicit, build-time)
2. `[[slug]]` wiki-links in note body text (auto-detected at runtime via regex)

**Side panel:** clicking a node fetches the page HTML, parses with `DOMParser`, extracts content via `article.post-content` → `#markdown-content` → `.post-content` → `article` selector chain.

## Key Files
| File | Purpose |
|------|---------|
| `_pages/blog.md` | All four tabs + graph HTML |
| `assets/js/knowledge-graph.js` | D3 graph, wiki-link parser, panel logic |
| `assets/json/graph-data.json` | Build-time node/edge JSON |
| `_sass/_knowledge-graph.scss` | Graph + panel styles |
| `assets/css/main.scss` | Imports `_knowledge-graph` |
| `_layouts/note.liquid` | Individual note page layout |
| `purgecss.config.js` | Safelist: `/^graph-/`, `/^kg-/`, `note-panel`, `open` |

## Notes Frontmatter Schema
```yaml
title, slug, description, tags: [], links: [other-slug], group: "Group Name"
```

## Study Notes Frontmatter Schema
```yaml
title, description, tags: [], category: "System Design"
```

## Known Gotchas
- JSON trailing comma bug: always use `concat` + single loop with `forloop.last` guard — never separate loops with hardcoded commas
- Graph must lazy-init (`window.__kgInit`) — container is `display:none` until tab click, so D3 width measurement would return 0 otherwise
- Post content lives in `#markdown-content` (post.liquid:66), not `article.post-content` (that's only the custom note layout)
