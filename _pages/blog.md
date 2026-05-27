---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
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
  <a href="#" class="tab-link" data-tab="ml-basics">ML Basics</a>
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

<!-- ML Basics Tab -->
<div id="tab-ml-basics" class="tab-content" style="display:none;">
{% assign ml_posts = site.posts | where_exp: "post", "post.categories contains 'ML Basics'" %}
{% assign current_month_year = "" %}
{% for post in ml_posts %}
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
{% if ml_posts.size > 0 %}</ul>{% endif %}
{% if ml_posts.size == 0 %}<p class="text-muted mt-3">No posts yet. Stay tuned!</p>{% endif %}
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
      document.getElementById('tab-' + tab.dataset.tab).style.display = 'block';
    });
  });
})();
</script>
