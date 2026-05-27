// Inject anchor link icons into all headings that have an id
function initHeadingAnchors() {
  document.querySelectorAll("#markdown-content h1[id], #markdown-content h2[id], #markdown-content h3[id], #markdown-content h4[id], #markdown-content h5[id], #markdown-content h6[id]").forEach(function (heading) {
    var anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = "#" + heading.id;
    anchor.setAttribute("aria-label", "Link to this section");
    anchor.innerHTML = '<i class="fa-solid fa-link fa-xs"></i>';
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      var url = window.location.origin + window.location.pathname + "#" + heading.id;
      navigator.clipboard.writeText(url).then(function () {
        anchor.classList.add("heading-anchor-copied");
        setTimeout(function () { anchor.classList.remove("heading-anchor-copied"); }, 1500);
      });
      history.pushState(null, null, "#" + heading.id);
    });
    heading.appendChild(anchor);
  });
}

$(document).ready(function () {
  initHeadingAnchors();
  // add toggle functionality to abstract and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let theme = localStorage.getItem("theme");
  if (theme == null || theme == "null") {
    const userPref = window.matchMedia;
    if (userPref && userPref("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
  }

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });
});
