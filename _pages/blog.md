---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
knowledge_graph: true
---

<div class="post">

{% assign blog_name_size = site.blog_name | size %}
{% assign blog_description_size = site.blog_description | size %}

{% if blog_name_size > 0 or blog_description_size > 0 %}
  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <h2>{{ site.blog_description }}</h2>
  </div>
{% endif %}

<div class="tab-nav-ml" id="blog-tabs">
  <a href="#" class="tab-link active-tab" data-tab="my-titbits">Field Notes</a>
  <a href="#" class="tab-link" data-tab="study-notes">Study Notes</a>
  <a href="#" class="tab-link tab-right" data-tab="graph-view">Graph view</a>
</div>

{% assign featured_posts = site.posts | where: "featured", "true" %}
{% if featured_posts.size > 0 %}
<br>
<div class="container featured-posts">
{% assign is_even = featured_posts.size | modulo: 2 %}
<div class="row row-cols-{% if featured_posts.size <= 2 or is_even == 0 %}2{% else %}3{% endif %}">
{% for post in featured_posts %}
<div class="card-item col">
  <a href="{{ post.url | relative_url }}">
    <div class="card hoverable">
      <div class="row g-0">
        <div class="col-md-12">
          <div class="card-body">
            <div class="float-right"><i class="fa-solid fa-thumbtack fa-xs"></i></div>
            <h3 class="card-title text-lowercase">{{ post.title }}</h3>
            <p class="card-text">{{ post.description }}</p>
            {% if post.external_source == blank %}
              {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
            {% else %}
              {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
            {% endif %}
            {% assign year = post.date | date: "%Y" %}
            <p class="post-meta">
              {{ read_time }} min read &nbsp; &middot; &nbsp;
              <a href="{{ year | prepend: '/blog/' | prepend: site.baseurl}}">
                <i class="fa-solid fa-calendar fa-sm"></i> {{ year }}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>
{% endfor %}
</div>
</div>
<hr>
{% endif %}

<!-- Field Notes Tab -->
<div id="tab-my-titbits" class="tab-content">
{% assign titbits_posts = site.posts | where_exp: "post", "post.categories contains 'Field Notes'" %}
{% assign current_month_year = "" %}
{% for post in titbits_posts %}
  {% assign post_month_year = post.date | date: "%B %Y" %}
  {% if post_month_year != current_month_year %}
    {% unless forloop.first %}</ul>{% endunless %}
    <h4 class="mt-4 mb-2" style="border-bottom: 1px solid var(--global-divider-color); padding-bottom: 0.3rem;">
      <i class="fa-solid fa-calendar-days fa-sm"></i> &nbsp; {{ post_month_year }}
    </h4>
    <ul class="post-list">
    {% assign current_month_year = post_month_year %}
  {% endif %}
  {% if post.external_source == blank %}
    {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
  {% else %}
    {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
  {% endif %}
  {% assign year = post.date | date: "%Y" %}
  {% assign tags = post.tags | join: "" %}
  {% assign categories = post.categories | join: "" %}
  <li>
    {% if post.thumbnail %}<div class="row"><div class="col-sm-9">{% endif %}
    <h3>
      {% if post.redirect == blank %}
        <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
      {% elsif post.redirect contains '://' %}
        <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
        <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      {% else %}
        <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
      {% endif %}
    </h3>
    <p>{{ post.description }}</p>
    <p class="post-meta">
      {{ read_time }} min read &nbsp; &middot; &nbsp;
      {{ post.date | date: '%B %d, %Y' }}
      {% if post.external_source %}&nbsp; &middot; &nbsp; {{ post.external_source }}{% endif %}
    </p>
    <p class="post-tags">
      <a href="{{ year | prepend: '/blog/' | prepend: site.baseurl}}">
        <i class="fa-solid fa-calendar fa-sm"></i> {{ year }}
      </a>
      {% if tags != "" %}
        &nbsp; &middot; &nbsp;
        {% for tag in post.tags %}
          <a href="{{ tag | slugify | prepend: '/blog/tag/' | prepend: site.baseurl}}">
            <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}</a> &nbsp;
        {% endfor %}
      {% endif %}
      {% if categories != "" %}
        &nbsp; &middot; &nbsp;
        {% for category in post.categories %}
          <a href="{{ category | slugify | prepend: '/blog/category/' | prepend: site.baseurl}}">
            <i class="fa-solid fa-tag fa-sm"></i> {{ category }}</a> &nbsp;
        {% endfor %}
      {% endif %}
    </p>
    {% if post.thumbnail %}
      </div>
      <div class="col-sm-3">
        <img class="card-img" src="{{post.thumbnail | relative_url}}" style="object-fit: cover; height: 90%" alt="image">
      </div>
    </div>
    {% endif %}
  </li>
{% endfor %}
{% if titbits_posts.size > 0 %}</ul>{% endif %}
{% if titbits_posts.size == 0 %}<p class="text-muted mt-3">No posts yet. Stay tuned!</p>{% endif %}
</div>

<div id="tab-study-notes" class="tab-content" style="display:none;">
  <div class="sub-tab-nav mb-3">
    <button class="btn btn-sm btn-outline-primary sub-tab-link active" data-sub-tab="ml-basics">ML Basics</button>
    <button class="btn btn-sm btn-outline-primary sub-tab-link" data-sub-tab="ai-engineering">AI Engineering</button>
    <button class="btn btn-sm btn-outline-primary sub-tab-link" data-sub-tab="dsa">DSA</button>
    <button class="btn btn-sm btn-outline-primary sub-tab-link" data-sub-tab="system-design">System Design</button>
    <button class="btn btn-sm btn-outline-primary sub-tab-link" data-sub-tab="web">Web</button>
  </div>


  <div id="sub-tab-ai-engineering" class="sub-tab-content" style="display:none;">
    {% assign ai_notes = site['study-notes'] | where: "category", "ai-engineering" %}
    {% if ai_notes.size > 0 %}
    <ul class="post-list">
    {% for note in ai_notes %}
      {% assign read_time = note.content | number_of_words | divided_by: 180 | plus: 1 %}
      <li>
        {% if note.thumbnail %}<div class="row"><div class="col-sm-9">{% endif %}
        <h3><a class="post-title" href="{{ note.url | relative_url }}">{{ note.title | default: note.slug | replace: '-', ' ' | capitalize }}</a></h3>
        {% if note.description %}<p>{{ note.description }}</p>{% endif %}
        <p class="post-meta">
          {{ read_time }} min read
          {% if note.tags %}
            &nbsp; &middot; &nbsp;
            {% for tag in note.tags %}
              <span style="font-size:0.8rem; color:var(--global-text-color-light);">#{{ tag }}</span> &nbsp;
            {% endfor %}
          {% endif %}
        </p>
        {% if note.thumbnail %}
          </div>
          <div class="col-sm-3">
            <img class="card-img" src="{{note.thumbnail | relative_url}}" style="object-fit: cover; height: 90%" alt="image">
          </div>
        </div>
        {% endif %}
      </li>
    {% endfor %}
    </ul>
    {% else %}
    {% endif %}
  </div>

  <div id="sub-tab-ml-basics" class="sub-tab-content">
    {% assign ml_study_posts = site['study-notes'] | where: "category", "ml-basics" %}
    {% if ml_study_posts.size > 0 %}
    <ul class="post-list">
    {% for post in ml_study_posts %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      <li>
        <h3><a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        {% if post.description %}<p>{{ post.description }}</p>{% endif %}
        <p class="post-meta">
          {{ read_time }} min read &nbsp; &middot; &nbsp; {{ post.date | date: '%B %d, %Y' }}
          {% if post.tags %}
            &nbsp; &middot; &nbsp;
            {% for tag in post.tags %}
              <span style="font-size:0.8rem; color:var(--global-text-color-light);">#{{ tag }}</span> &nbsp;
            {% endfor %}
          {% endif %}
        </p>
      </li>
    {% endfor %}
    </ul>
    {% else %}
    <p class="text-muted mt-3">No ML Basics posts yet.</p>
    {% endif %}
  </div>

  <div id="sub-tab-dsa" class="sub-tab-content" style="display:none;">
    {% assign dsa_notes = site['study-notes'] | where: "category", "dsa" %}
    {% if dsa_notes.size > 0 %}
    <ul class="post-list">
    {% for note in dsa_notes %}
      {% assign read_time = note.content | number_of_words | divided_by: 180 | plus: 1 %}
      <li>
        {% if note.thumbnail %}<div class="row"><div class="col-sm-9">{% endif %}
        <h3><a class="post-title" href="{{ note.url | relative_url }}">{{ note.title | default: note.slug | replace: '-', ' ' | capitalize }}</a></h3>
        {% if note.description %}<p>{{ note.description }}</p>{% endif %}
        <p class="post-meta">
          {{ read_time }} min read
          {% if note.tags %}
            &nbsp; &middot; &nbsp;
            {% for tag in note.tags %}
              <span style="font-size:0.8rem; color:var(--global-text-color-light);">#{{ tag }}</span> &nbsp;
            {% endfor %}
          {% endif %}
        </p>
        {% if note.thumbnail %}
          </div>
          <div class="col-sm-3">
            <img class="card-img" src="{{note.thumbnail | relative_url}}" style="object-fit: cover; height: 90%" alt="image">
          </div>
        </div>
        {% endif %}
      </li>
    {% endfor %}
    </ul>
    {% else %}
    <p class="text-danger">DEBUG: DSA notes count is 0 for category "DSA"</p>
    {% endif %}
  </div>

  <div id="sub-tab-system-design" class="sub-tab-content" style="display:none;">
    {% assign sd_notes = site['study-notes'] | where: "category", "system-design" %}
    {% if sd_notes.size > 0 %}
    <ul class="post-list">
    {% for note in sd_notes %}
      {% assign read_time = note.content | number_of_words | divided_by: 180 | plus: 1 %}
      <li>
        {% if note.thumbnail %}<div class="row"><div class="col-sm-9">{% endif %}
        <h3><a class="post-title" href="{{ note.url | relative_url }}">{{ note.title | default: note.slug | replace: '-', ' ' | capitalize }}</a></h3>
        {% if note.description %}<p>{{ note.description }}</p>{% endif %}
        <p class="post-meta">
          {{ read_time }} min read
          {% if note.tags %}
            &nbsp; &middot; &nbsp;
            {% for tag in note.tags %}
              <span style="font-size:0.8rem; color:var(--global-text-color-light);">#{{ tag }}</span> &nbsp;
            {% endfor %}
          {% endif %}
        </p>
        {% if note.thumbnail %}
          </div>
          <div class="col-sm-3">
            <img class="card-img" src="{{note.thumbnail | relative_url}}" style="object-fit: cover; height: 90%" alt="image">
          </div>
        </div>
        {% endif %}
      </li>
    {% endfor %}
    </ul>
    {% else %}
    <p class="text-danger">DEBUG: SD notes count is 0 for category "System Design"</p>
    {% endif %}
  </div>

  <div id="sub-tab-web" class="sub-tab-content" style="display:none;">
    {% assign web_notes = site['study-notes'] | where: "category", "web" %}
    {% if web_notes.size > 0 %}
    <ul class="post-list">
    {% for note in web_notes %}
      {% assign read_time = note.content | number_of_words | divided_by: 180 | plus: 1 %}
      <li>
        {% if note.thumbnail %}<div class="row"><div class="col-sm-9">{% endif %}
        <h3><a class="post-title" href="{{ note.url | relative_url }}">{{ note.title | default: note.slug | replace: '-', ' ' | capitalize }}</a></h3>
        {% if note.description %}<p>{{ note.description }}</p>{% endif %}
        <p class="post-meta">
          {{ read_time }} min read
          {% if note.tags %}
            &nbsp; &middot; &nbsp;
            {% for tag in note.tags %}
              <span style="font-size:0.8rem; color:var(--global-text-color-light);">#{{ tag }}</span> &nbsp;
            {% endfor %}
          {% endif %}
        </p>
        {% if note.thumbnail %}
          </div>
          <div class="col-sm-3">
            <img class="card-img" src="{{note.thumbnail | relative_url}}" style="object-fit: cover; height: 90%" alt="image">
          </div>
        </div>
        {% endif %}
      </li>
    {% endfor %}
    </ul>
    {% else %}
    <p class="text-danger">DEBUG: Web notes count is 0 for category "Web"</p>
    {% endif %}
  </div>
</div>

<script>
(function() {
  var subTabs = document.querySelectorAll('.sub-tab-link');
  subTabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      subTabs.forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.sub-tab-content').forEach(function(c) { c.style.display = 'none'; });
      tab.classList.add('active');
      var target = document.getElementById('sub-tab-' + tab.dataset.subTab);
      if (target) target.style.display = 'block';
    });
  });
})();
</script>

<!-- Graph View Tab -->
<div id="tab-graph-view" class="tab-content" style="display:none;">
  <p class="graph-subtitle" style="color:var(--global-text-color-light);font-size:0.9rem;margin-bottom:0.5rem;">
    All posts and study notes as a connected graph. Click a node to read it.
    <span class="kg-legend">
      <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#7c6af7"/></svg> note &nbsp;
      <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="#f06292" stroke-width="2" stroke-dasharray="3,1.5"/></svg> post &nbsp;
      <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="#ff8a65" stroke-width="2.5" stroke-dasharray="5,2"/></svg> study
    </span>
  </p>
  <div class="graph-controls">
    <input type="text" id="graph-search" placeholder="Search nodes…" autocomplete="off" />
    <div class="graph-zoom-btns">
      <button id="zoom-in" title="Zoom in">+</button>
      <button id="zoom-reset" title="Reset view">⊙</button>
      <button id="zoom-out" title="Zoom out">−</button>
    </div>
  </div>
  <div id="knowledge-graph"></div>
  <div id="note-panel" class="note-panel">
    <div class="note-panel-header">
      <span id="note-panel-title"></span>
      <button id="note-panel-close" title="Close">✕</button>
    </div>
    <div id="note-panel-tags"></div>
    <div id="note-panel-body"></div>
    <div class="note-panel-footer">
      <a id="note-panel-link" href="#" target="_self">Open full page →</a>
    </div>
  </div>
</div>

</div>

{% include subscribe.liquid %}

<script>
(function() {
  var tabs = document.querySelectorAll('.tab-link');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      tabs.forEach(function(t) { t.classList.remove('active-tab'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.style.display = 'none'; });
      tab.classList.add('active-tab');
      var target = document.getElementById('tab-' + tab.dataset.tab);
      target.style.display = 'block';
      if (tab.dataset.tab === 'graph-view' && window.__kgInit) {
        window.__kgInit();
      }
    });
  });
})();
</script>
