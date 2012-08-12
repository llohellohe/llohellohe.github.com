---
layout: page
title: Yangqi's Home Page
tagline: 追求自由和平等
---
{% include JB/setup %}


## 最近发表的文章

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>


