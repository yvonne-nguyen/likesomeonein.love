const { DateTime } = require("luxon");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");

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

  // --- Image shortcode ---
  // Resizes + converts photos to modern formats (webp/jpeg) at build time,
  // with a responsive srcset and lazy loading built in. Processed files are
  // cached in .cache/ so rebuilds stay fast.
  //
  // Usage in a post: {% image "src/images/my-photo.jpg", "Alt text describing it" %}
  //
  // This is separate from the raw src/images passthrough above — plain files
  // (like SVGs, or anything you don't want resized) still work fine as
  // regular <img src="/images/whatever.svg"> tags.
  async function imageShortcode(src, alt, sizes = "100vw") {
    if (!alt) {
      throw new Error(`Missing \`alt\` text for image: ${src}`);
    }

    let metadata = await Image(src, {
      widths: [400, 800, 1200, null], // null keeps one full-size original
      formats: ["webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/",
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    // Returns a <picture> element with the generated <source>/<img> tags.
    // Wrap the shortcode call in your own container (e.g. for the
    // hover-reveal effect used in "Portrait, unfolding") and target the
    // nested <img> with CSS exactly as you would a normal image.
    return Image.generateHTML(metadata, imageAttributes);
  }

  eleventyConfig.addAsyncShortcode("image", imageShortcode);

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
