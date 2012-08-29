---
layout: page
title: Yangqi's Home Page
tagline: 追求自由和平等
---
{% include JB/setup %}


![hexie hero](http://farm9.staticflickr.com/8169/7887357802_01a7acd0c1_b.jpg)

## 最近发表的文章

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>


