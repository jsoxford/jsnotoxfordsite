const socialImages = require("@11tyrocks/eleventy-plugin-social-images");
const emojiRegex = require("emoji-regex");
const slugify = require("slugify");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const packageVersion = require("./package.json").version;

let ytEmbed = /https?:\/\/www\.youtube\.com\/embed\/([\w-]{11})/i
let ytNoCookieEmbed = /https?:\/\/www\.youtube\-nocookie\.com\/embed\/([\w-]{11})/i
let ytWatch = /https?:\/\/www\.youtube\.com\/watch\?vi?=([\w-]{11})/i
let ytShort = /https?:\/\/youtu\.be\/([\w-]{11})/i

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(socialImages);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addWatchTarget("./src/sass/");

  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/favicon.png");

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addShortcode("packageVersion", () => `v${packageVersion}`);

  // Make it easier to remember layout names
  ['base', 'event', 'page'].forEach(layout => {
    eleventyConfig.addLayoutAlias(layout, `layouts/${layout}.njk`);
  });
  
  // Turn a date into "MM-YYYY"
  eleventyConfig.addFilter("mmyyyy", (date) => {
    let [month, day, year]    = new Date(date).toLocaleDateString("en-US").split("/");
    return `${("0"+month).substr(-2)}/${year}`;
  });
  // Get items from an array starting at an offset
  eleventyConfig.addFilter("from", (array, from) => {
    return array.slice(from, array.length);
  });
  // Check if a date has occured
  eleventyConfig.addFilter("occured", (date) => {
    let dateToCheck = new Date(date);
    let today = new Date();
    return dateToCheck < today;
  });

  eleventyConfig.addFilter("slug", (str) => {
    if (!str) {
      return;
    }

    const regex = emojiRegex();
    // Remove Emoji first
    let string = str.replace(regex, "");

    return slugify(string, {
      lower: true,
      replacement: "-",
      remove: /[*+~·,()'"`´%!?¿:@\/]/g,
    });
  });

  // Turn any kind of youtube sharing link into a video wrapped iframe embed link pointing at
  // the nocookie version.
  eleventyConfig.addShortcode("yt", (str) => {
    let id = ""
    if ((match = str.match(ytNoCookieEmbed)) !== null) {
      // is it a nocookie youtube embed link? like https://www.youtube-nocookie.com/embed/ps_UUldWqHY
      id = match[1];
    } else if ((match = str.match(ytEmbed)) !== null) {
      // is this an embed link without the nocookie part? like https://www.youtube.com/embed/ps_UUldWqHY
      id = match[1];
    } else if ((match = str.match(ytWatch)) !== null) {
      // is it a youtube watch link? like https://www.youtube.com/?v=ps_UUldWqHY
      id = match[1];
    } else if ((match = str.match(ytShort)) !== null) {
      // is it a short youtube link? like https://youtu.be/ps_UUldWqHY
      id = match[1];
    } else {
      return "";
    }

    return `<div class="videoWrapper">
      <iframe width="1120" height="630" src="https://www.youtube-nocookie.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>`
  });

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "public",
    },
  };
};
