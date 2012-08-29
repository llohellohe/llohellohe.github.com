---
layout: page
title: Yangqi's Home Page
tagline: 追求自由和平等
---
{% include JB/setup %}


![hexie hero](http://2.bp.blogspot.com/-Q565razl-6g/TbfxGGYQyLI/AAAAAAAACcw/gLn9vtyU2rQ/s1600/hexie.jpg)

## 最近发表的文章

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>


