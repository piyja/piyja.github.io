/* Portfolio page behaviour: nav-rail scroll-spy, expandable job details,
   tag filtering, scroll reveal, and the cursor spotlight. */
(function () {
  "use strict";

  var root = document.querySelector("[data-portfolio]");
  if (!root) return;

  // Fallback for engines without CSS `:has()` — lets the stylesheet break the
  // portfolio out of the al-folio container.
  document.body.classList.add("pf-page");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Spotlight ────────────────────────────────────────────────────────── */

  var spotlight = root.querySelector(".pf-spotlight");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (spotlight && finePointer && !reduceMotion) {
    var raf = null;

    function moveSpotlight(event) {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = null;
        spotlight.style.setProperty("--pf-x", event.clientX + "px");
        spotlight.style.setProperty("--pf-y", event.clientY + "px");
        document.body.classList.add("pf-spotlight-on");
      });
    }

    window.addEventListener("pointermove", moveSpotlight, { passive: true });
  }

  /* ── Expandable job details ───────────────────────────────────────────── */

  root.querySelectorAll("[data-pf-toggle]").forEach(function (button) {
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));

      var text = button.querySelector(".pf-toggle__text");
      if (text) text.textContent = expanded ? "Details" : "Hide details";

      if (expanded) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
      }
    });
  });

  /* ── Project filtering ────────────────────────────────────────────────── */

  var filterBar = root.querySelector("#pf-filters");

  if (filterBar) {
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-pf-tags]"));
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll("[data-pf-filter]"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var wanted = button.getAttribute("data-pf-filter");

        buttons.forEach(function (other) {
          var active = other === button;
          other.classList.toggle("pf-is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });

        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-pf-tags") || "").trim().split(/\s+/);
          var match = wanted === "all" || tags.indexOf(wanted) !== -1;
          card.classList.toggle("pf-is-hidden", !match);
        });
      });
    });
  }

  /* ── Scroll reveal ────────────────────────────────────────────────────── */

  var revealables = root.querySelectorAll(".pf-reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("pf-is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("pf-is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    revealables.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ── Nav rail scroll-spy ──────────────────────────────────────────────── */

  var navLinks = Array.prototype.slice.call(root.querySelectorAll("[data-pf-nav]"));
  var sections = navLinks
    .map(function (link) {
      return document.getElementById("pf-" + link.getAttribute("data-pf-nav"));
    })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("pf-is-active", link.getAttribute("data-pf-nav") === id);
    });
  }

  if (sections.length && "IntersectionObserver" in window) {
    var visible = Object.create(null);

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });

        var best = null;
        var bestRatio = 0;
        sections.forEach(function (section) {
          if (visible[section.id] > bestRatio) {
            bestRatio = visible[section.id];
            best = section;
          }
        });

        if (best) setActive(best.id.replace(/^pf-/, ""));
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ── Smooth in-page navigation, accounting for the fixed navbar ───────── */

  root.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#pf-"]');
    if (!link) return;

    var target = document.getElementById(link.getAttribute("href").slice(1));
    if (!target) return;

    event.preventDefault();

    var isMobile = window.matchMedia("(max-width: 991.98px)").matches;
    var offset = isMobile ? 104 : 70;

    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
})();
