const { DateTime } = require("luxon");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 20,
    },
    metadata: {
      language: "en",
      title: "Marginalia",
      subtitle: "A personal collection of writing, photos, and fragments.",
      base: "https://yvonne-nguyen.github.io/likesomeonein.love/",
      author: {
        name: "",
      },
    },
  });

  // Copy CSS and images straight through to the output folder untouched
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  // --- Filters ---

  // Human-readable date, e.g. "July 16, 2026"
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL d, yyyy");
  });

  // Machine-readable date for <time datetime="..."> , e.g. "2026-07-16"
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Year only, used to group the archive by year
  eleventyConfig.addFilter("year", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy");
  });

  // --- Collections ---

  // All posts, newest first. Anything you drop in src/posts/*.md
  // shows up here automatically as long as it's not marked draft: true.
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  // Every unique tag across all posts, so tag pages can be generated
  // without you ever hand-writing a tag list.
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tagSet = new Set();
    collectionApi.getFilteredByGlob("src/posts/*.md").forEach((post) => {
      if (post.data.draft) return;
      (post.data.tags || [])
        .filter((tag) => tag !== "posts") // exclude the internal grouping tag
        .forEach((tag) => tagSet.add(tag));
    });
    return [...tagSet].sort();
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
