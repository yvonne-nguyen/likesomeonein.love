---
title: Portrait, unfolding
date: 2026-07-14
tags: [posts, poems, visual]
---
Some entries want to be more than text. This one uses raw HTML and a bit of scoped CSS
right inside the Markdown file — nothing about the site's system stops you from doing
this on any post, whenever the mood strikes.

<div class="hover-poem">
  <img src="/images/example-placeholder.svg" alt="A placeholder image" width="320">
  <span class="hover-poem-popup">the part that only shows up if you look closely</span>
</div>

<style>
  /* Scoped to this post only — doesn't affect anything else on the site */
  .hover-poem {
    position: relative;
    display: inline-block;
    margin: 1.5rem 0;
  }
  .hover-poem img {
    display: block;
    border-radius: 4px;
    filter: grayscale(0.15);
    transition: filter 0.4s ease;
  }
  .hover-poem:hover img {
    filter: grayscale(0);
  }
  .hover-poem-popup {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    background: var(--color-ink);
    color: var(--color-paper);
    padding: 0.5rem 0.9rem;
    border-radius: 3px;
    font-size: 0.85rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .hover-poem:hover .hover-poem-popup {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
</style>

Back to regular Markdown text after that. Mix and match as much as you like.
