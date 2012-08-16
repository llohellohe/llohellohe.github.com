<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd


{% for page in site.pages %}
       {% if page.title !=  'Sitemap' and page.title !=  'Atom Feed' %}
       {%assign priority=0.5 %}
       {% if page.url == '/index.html' %}
               {%assign priority=0.8 %}
       {% endif %}
       {% if page.url == '/archive.html' %}
               {%assign priority=0.4 %}
       {% endif %}
       {% if page.url == '/categories.html' %}
               {%assign priority=0.7 %}
       {% endif %}
       <url>
               <loc>{{site.production_url}}{{ page.url }}</loc>
               <priority>{{priority}}</priority>
               <changefreq>daily</changefreq>
       </url>
       {% endif %}
{% endfor %}
{% for post in site.posts %}
<url>
        <loc>{{site.production_url}}{{ post.url }}</loc>
        <priority>0.6</priority>
</url>
{% endfor %}


</urlset>
