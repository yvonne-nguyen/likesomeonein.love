const { DateTime } = require("luxon");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");

// The site deploys to yvonne-nguyen.github.io/likesomeonein.love/ (a
// subpath, not a domain root). GitHub Pages automatically serves whatever's
// in the build output under this prefix — we don't nest files under it
// ourselves, we just need generated URLs to include it. (Eleventy's own
// built-in pathPrefix + `url` filter mis-renders with this particular
// prefix — it triples up — so this is applied manually via global data
// instead of Eleventy's pathPrefix config option.)
//
// Only applied for real builds, though — `npx eleventy --serve` serves
// everything at the root of localhost with no subpath, so baking the
// prefix in during local preview would break every stylesheet/link there.
// Eleventy sets ELEVENTY_RUN_MODE to "serve" automatically for --serve.
const PREFIX = process.env.ELEVENTY_RUN_MODE === "serve" ? "" : "/likesomeonein.love";

module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("prefix", PREFIX);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      // Uses "feedPosts" rather than "posts" — the feed plugin resolves
      // item links against `metadata.base` in a way that drops any path
      // on base when the item URL starts with "/" (standard URL-resolution
      // behavior), which would silently strip the /likesomeonein.love
      // prefix from every link in the feed. "feedPosts" is the same
      // collection with that prefix already baked into each item's url.
      name: "feedPosts",
      limit: 20,
    },
    metadata: {
      language: "en",
      title: "likesomeonein.love",
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
      urlPath: PREFIX + "/img/",
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

  // Human-readable date, e.g. "July 16, 2026" — used by the archive, which
  // intentionally shows date only, no time.
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL d, yyyy");
  });

  // Same, plus hour:minute — used on the homepage. Note: a post's time
  // comes from its `date:` front matter; if that's just a date with no
  // time (e.g. `date: 2026-07-14`), Eleventy defaults it to midnight, so
  // it'll show 12:00 AM until you add a time (e.g. `date: 2026-07-14T15:30`).
  eleventyConfig.addFilter("readableDateTime", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL d, yyyy 'at' h:mm a");
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

  // Same as "posts", but with the site's subpath baked into each item's
  // `.url` — used only by the RSS/Atom feed (see feedPlugin config above).
  // A Proxy is used (rather than spreading the object) so lazily-computed
  // properties like `.templateContent` aren't evaluated before Eleventy is
  // ready for them.
  eleventyConfig.addCollection("feedPosts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.date - a.date)
      .map((post) => new Proxy(post, {
        get(target, prop, receiver) {
          if (prop === "url") return PREFIX + target.url;
          return Reflect.get(target, prop, receiver);
        },
      }));
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
