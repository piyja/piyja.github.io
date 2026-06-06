(function () {
  "use strict";

  const DATA_URL = "/assets/json/graph-data.json";

  const GROUP_COLORS = d3.scaleOrdinal()
    .domain(["AI Engineering", "AI Agents", "Research", "Field Notes", "ML Basics", "System Design", "Study Notes", "default"])
    .range(["#7c6af7", "#4fc3f7", "#81c784", "#f06292", "#ffb74d", "#ff8a65", "#4db6ac", "#a0a0a0"]);

  const DARK_BG = "#1a1a2e";
  const LIGHT_BG = "#f8f9fa";

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function getColors() {
    return isDark()
      ? { bg: DARK_BG, edge: "rgba(255,255,255,0.18)", label: "#ccc" }
      : { bg: LIGHT_BG, edge: "rgba(0,0,0,0.15)", label: "#444" };
  }

  let svg, simulation, linkSel, nodeSel, labelSel, gMain;
  let allNodes = [], allLinks = [];
  let initialized = false;
  const zoomBehavior = d3.zoom().scaleExtent([0.2, 4]).on("zoom", onZoom);

  function onZoom(event) {
    gMain.attr("transform", event.transform);
  }

  function nodeRadius(d) {
    return Math.max(6, Math.min(18, Math.sqrt(Math.max(d.wordCount || 100, 50)) * 0.55));
  }

  function buildGraph(data) {
    allNodes = data.nodes;
    allLinks = data.links;

    const container = document.getElementById("knowledge-graph");
    if (!container) return;

    // Wait for container to have real dimensions (it was display:none until now)
    const width = container.clientWidth || 700;
    const height = Math.max(window.innerHeight - 280, 420);

    container.innerHTML = "";
    const colors = getColors();

    svg = d3.select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .style("background", colors.bg)
      .call(zoomBehavior)
      .on("click", () => closeNotePanel());

    svg.append("defs").append("marker")
      .attr("id", "kg-arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", colors.edge);

    gMain = svg.append("g");

    simulation = d3.forceSimulation(allNodes)
      .force("link", d3.forceLink(allLinks).id(d => d.id).distance(110).strength(0.7))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => nodeRadius(d) + 12))
      .on("tick", ticked);

    linkSel = gMain.append("g")
      .selectAll("line")
      .data(allLinks)
      .join("line")
      .attr("stroke", colors.edge)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#kg-arrow)");

    nodeSel = gMain.append("g")
      .selectAll("circle")
      .data(allNodes)
      .join("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => d.kind === "post" ? "none" : GROUP_COLORS(d.group))
      .attr("stroke", d => GROUP_COLORS(d.group))
      .attr("stroke-width", d => d.kind === "post" ? 2 : d.kind === "study" ? 2.5 : 1.5)
      .attr("stroke-dasharray", d => d.kind === "post" ? "4,2" : d.kind === "study" ? "6,2" : null)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end",   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }))
      .on("mouseover", onNodeHover)
      .on("mouseout", onNodeOut)
      .on("click", (e, d) => { e.stopPropagation(); openNotePanel(d); });

    labelSel = gMain.append("g")
      .selectAll("text")
      .data(allNodes)
      .join("text")
      .text(d => d.title)
      .attr("text-anchor", "middle")
      .attr("dy", d => nodeRadius(d) + 13)
      .attr("fill", colors.label)
      .attr("font-size", "10px")
      .attr("font-family", "inherit")
      .style("pointer-events", "none")
      .style("user-select", "none");
  }

  function ticked() {
    linkSel
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nodeSel.attr("cx", d => d.x).attr("cy", d => d.y);
    labelSel.attr("x", d => d.x).attr("y", d => d.y);
  }

  function getConnected(d) {
    const ids = new Set([d.id]);
    allLinks.forEach(l => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      if (s === d.id) ids.add(t);
      if (t === d.id) ids.add(s);
    });
    return ids;
  }

  function onNodeHover(event, d) {
    const connected = getConnected(d);
    nodeSel.style("opacity", n => connected.has(n.id) ? 1 : 0.12);
    linkSel.style("opacity", l => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      return s === d.id || t === d.id ? 1 : 0.05;
    });
    labelSel.style("opacity", n => connected.has(n.id) ? 1 : 0.08);
    d3.select(event.currentTarget).attr("r", nodeRadius(d) * 1.45).attr("stroke-width", 2.5);
  }

  function onNodeOut() {
    nodeSel.style("opacity", 1);
    linkSel.style("opacity", 1);
    labelSel.style("opacity", 1);
    nodeSel.attr("r", nodeRadius).attr("stroke-width", 1.5);
  }

  // ── Note panel ───────────────────────────────────────────────────────────────

  function openNotePanel(d) {
    const panel = document.getElementById("note-panel");
    if (!panel) return;
    document.getElementById("note-panel-title").textContent = d.title;
    document.getElementById("note-panel-link").href = d.url;
    document.getElementById("note-panel-tags").innerHTML =
      (Array.isArray(d.tags) ? d.tags : [])
        .map(t => `<span class="kg-tag">${t}</span>`).join(" ");
    document.getElementById("note-panel-body").innerHTML =
      `<p class="kg-description">${d.description || ""}</p><p class="kg-loading">Loading…</p>`;
    panel.classList.add("open");

    fetch(d.url)
      .then(r => r.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const article = doc.querySelector("article.post-content")
          || doc.querySelector("#markdown-content")
          || doc.querySelector(".post-content")
          || doc.querySelector("article");
        document.getElementById("note-panel-body").innerHTML =
          `<p class="kg-description">${d.description || ""}</p>` +
          (article ? article.innerHTML : "<p class='kg-loading'>Could not load content.</p>");
      })
      .catch(() => {
        document.getElementById("note-panel-body").innerHTML =
          `<p class="kg-description">${d.description || ""}</p><p class="kg-loading">Could not load content.</p>`;
      });
  }

  function closeNotePanel() {
    const panel = document.getElementById("note-panel");
    if (panel) panel.classList.remove("open");
  }

  // ── Controls ─────────────────────────────────────────────────────────────────

  function wireControls() {
    const searchInput = document.getElementById("graph-search");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const q = this.value.trim().toLowerCase();
        if (!nodeSel) return;
        if (!q) { nodeSel.style("opacity", 1); labelSel.style("opacity", 1); return; }
        nodeSel.style("opacity", d =>
          d.title.toLowerCase().includes(q) || (d.description || "").toLowerCase().includes(q) ? 1 : 0.1);
        labelSel.style("opacity", d => d.title.toLowerCase().includes(q) ? 1 : 0.1);
      });
    }

    const zoomIn    = document.getElementById("zoom-in");
    const zoomOut   = document.getElementById("zoom-out");
    const zoomReset = document.getElementById("zoom-reset");
    if (zoomIn)    zoomIn.addEventListener("click",    () => svg && svg.transition().call(zoomBehavior.scaleBy, 1.4));
    if (zoomOut)   zoomOut.addEventListener("click",   () => svg && svg.transition().call(zoomBehavior.scaleBy, 0.7));
    if (zoomReset) zoomReset.addEventListener("click", () => svg && svg.transition().call(zoomBehavior.transform, d3.zoomIdentity));

    const panelClose = document.getElementById("note-panel-close");
    if (panelClose) panelClose.addEventListener("click", closeNotePanel);
  }

  // ── Dark mode reactivity ──────────────────────────────────────────────────────

  new MutationObserver(() => {
    if (!svg) return;
    const colors = getColors();
    svg.style("background", colors.bg);
    linkSel && linkSel.attr("stroke", colors.edge);
    labelSel && labelSel.attr("fill", colors.label);
    nodeSel && nodeSel.attr("stroke", d => GROUP_COLORS(d.group));
    svg.select("#kg-arrow path").attr("fill", colors.edge);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // ── Resize ────────────────────────────────────────────────────────────────────

  window.addEventListener("resize", () => {
    if (!svg || !simulation) return;
    const container = document.getElementById("knowledge-graph");
    if (!container || container.closest('[style*="display: none"]')) return;
    const w = container.clientWidth || 700;
    const h = Math.max(window.innerHeight - 280, 420);
    svg.attr("height", h);
    simulation.force("center", d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
  });

  // ── Init (lazy — called when the tab is clicked) ──────────────────────────────

  function extractWikiLinks(data) {
    const knownSlugs = new Set(data.nodes.map(n => n.id));
    // [[slug]] pattern anywhere in the raw content
    const wikiPattern = /\[\[([^\]]+)\]\]/g;

    // build a set of existing edges so we don't add duplicates
    const existingEdges = new Set(
      data.links.map(l => `${l.source}|||${l.target}`)
    );

    const extraLinks = [];
    data.nodes.forEach(node => {
      if (!node.rawContent) return;
      let match;
      while ((match = wikiPattern.exec(node.rawContent)) !== null) {
        const target = match[1].trim();
        if (knownSlugs.has(target) && target !== node.id) {
          const key = `${node.id}|||${target}`;
          if (!existingEdges.has(key)) {
            existingEdges.add(key);
            extraLinks.push({ source: node.id, target });
          }
        }
      }
    });

    return { ...data, links: [...data.links, ...extraLinks] };
  }

  window.__kgInit = function () {
    if (initialized) return;
    initialized = true;
    wireControls();
    fetch(DATA_URL)
      .then(r => r.json())
      .then(data => buildGraph(extractWikiLinks(data)))
      .catch(() => {
        const c = document.getElementById("knowledge-graph");
        if (c) c.innerHTML = `<p style="padding:2rem;color:#888;">Could not load graph data.</p>`;
      });
  };
})();
