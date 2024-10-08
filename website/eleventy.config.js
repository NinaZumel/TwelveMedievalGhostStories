const { DateTime } = require("luxon");
const path = require('path');
const fs = require("fs");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy"); // for deploying to subdirectories
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItAttrs = require("markdown-it-attrs");
const now = new Date();
const debug = require("debug")("markllobrera");
//const pluginImages = require("./src/utils/eleventy.config.images.js"); 
const imagesResponsiver = require("eleventy-plugin-images-responsiver");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(pluginBundle);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg,jpg}"); 
  //eleventyConfig.addPlugin(pluginImages);  // me, nina

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Date filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (typeof dateObj === 'string') {
      return DateTime.fromISO(dateObj, { zone: "utc" }).toFormat(
        "LLL dd, yyyy"
      );
    } else {
      return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
        "LLL dd, yyyy"
      );
    }
  });

  eleventyConfig.addNunjucksFilter("date", function (date, format) {
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(format);
  });

  eleventyConfig.addNunjucksFilter("convertTimestampToDate", function (date) {
    return DateTime.fromMillis(date, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Map from Object filter, for Year-based custom collections
  eleventyConfig.addNunjucksFilter("createReverseYearsMapFromObject", function (obj) {
    const yearCollection = obj;
    let yearCollectionDescending = new Map();
    const keysSorted = Object.keys(yearCollection).sort(function(a,b){return Number(b)-Number(a)});
    keysSorted.forEach((key) => {
      yearCollectionDescending.set(key, yearCollection[key]);
    });
    return yearCollectionDescending;
  });


  // Limit filter
  eleventyConfig.addNunjucksFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Override original declaration: eleventyConfig.addCollection("tagList", require("./_11ty/getTagList"));
  eleventyConfig.addCollection("tagList", require("./src/utils/getTagList.js"));


      // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)


  // Copy the `img` and `css` folders to the output
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
    "./content/pages/img": "/pages/img",
    "./content/posts/images": "/posts/images"
	});
  eleventyConfig.addPassthroughCopy(
    path.join('{pages,posts}/**/*.{jpg,jpeg,png,gif,mp4}')
  );

  // Next/Previous navigation
  // See: https://brycewray.com/posts/2019/12/previous-next-eleventy/
  eleventyConfig.addCollection("posts", function (collection) {
    const coll = collection
      .getAll()
      .filter(function (item) {
        return item.data.content_type == "post";
      })
      .sort(function (a, b) {
        return a.date - b.date;
      });

    for (let i = 0; i < coll.length; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return [...coll].reverse();
  });


  // Date filters
  eleventyConfig.addFilter("isRewatch", (rewatch) => {
    return rewatch ? "Yes" : "No";
  });

  function makeDateFormatter(dateFormat) {
    return function (date) {
      // return moment(date).format(datePattern);
      return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(dateFormat);
    };
  }

  function generateItemsDateSet(items, dateFormatter) {
    const formattedDates = items.map((item) => {
      return dateFormatter(item.data.page.date);
    });
    return [...new Set(formattedDates)];
  }

  function getItemsByDate(items, date, dateFormatter) {
    return items.filter((item) => {
      return dateFormatter(item.data.page.date) === date;
    });
  }

  const contentByDateString = (items, dateFormatter) => {
    return generateItemsDateSet(items, dateFormatter).reduce(function (
      collected,
      formattedDate
    ) {
      return Object.assign({}, collected, {
        // lowercase to match month directory page.url
        [formattedDate.toLowerCase()]: getItemsByDate(
          items,
          formattedDate,
          dateFormatter
        ),
      });
    },
    {});
  };

  const contentsByYear = (collection) => {
    return contentByDateString(collection, makeDateFormatter('yyyy'));
  };

  eleventyConfig.addCollection("postsByYear", function (collection) {
    const coll = collection
      .getAll()
      .filter(function (item) {
        return item.data.content_type == "post";
      })
      .sort(function (a, b) {
        return a.date - b.date;
      });

    for (let i = 0; i < coll.length; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return contentsByYear(coll);
  });



  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: false,
    typographer: true,
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "direct-link",
        symbol: "#",
        level: [1, 2, 3, 4],
      }),
      slugify: eleventyConfig.getFilter("slug")
    })
    .use(markdownItFootnote)
    .use(markdownItAttrs);

  markdownLibrary.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
    const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf)
    const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf)
    let refid = id

    if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`

    return `<sup class="footnote-ref" id="fn-anchor-${id}"><a href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`
  }

  markdownLibrary.renderer.rules.footnote_caption = (tokens, idx) => {
    let n = Number(tokens[idx].meta.id + 1).toString();

    if (tokens[idx].meta.subId > 0) {
      n += ":" + tokens[idx].meta.subId;
    }

    return n;
  };
  eleventyConfig.setLibrary("md", markdownLibrary);

  // An image helper to generate figure markup
  eleventyConfig.addShortcode("image", require("./src/utils/image.js"));

 // Images Responsiver
 const imagesResponsiverConfig = require("./src/utils/images-responsiver-config.js");
 eleventyConfig.addPlugin(imagesResponsiver, imagesResponsiverConfig);

  eleventyConfig.addFilter("markdownInline", function (data) {
    if (data) {
      return markdownLibrary.renderInline(data);
    }
    else {
      return "";
    }
  });


  eleventyConfig.addPairedShortcode(
    "markdown",
    (data) => {
      if (data) {
        return markdownLibrary.renderInline(data);
      } else {
        return "";
      }
    }
  );

  eleventyConfig.addPairedShortcode(
    "gallery", (data) => {
      const galleryContent = markdownLibrary.render(data);
      return `<div class="gallery">${galleryContent}</div>`;
    }
  );

  eleventyConfig.addPairedShortcode(
    "vimeo", (data) => {
      const videoURL = markdownLibrary.renderInline(data.trim());
      return `<figure class="cinemascope video"><div class="video-embed"><div><iframe src="${videoURL}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script></figure>`;
    }
  );

  eleventyConfig.addPairedShortcode(
    "videoloop", (content, data, alt) => {
      const videoURL = markdownLibrary.renderInline(data.trim());
      const altText = markdownLibrary.renderInline(alt.trim());
      const divContent = markdownLibrary.renderInline(content.trim());
      return `<div class="video"><video controls loop autoplay muted playsinline aria-labelledby="video-label" src="${videoURL}"></video>${divContent}<div id="video-label" class="visually-hidden" aria-hidden="true">${altText}</div></div>`;
    }
  );

  eleventyConfig.addPairedShortcode(
    "aside", (content, aside, alignment) => {
      const asideText = markdownLibrary.render(aside.trim());
      const alignmentClass = alignment == 'left' ? 'aside-left-wrap': 'aside-right-wrap';
      const divContent = markdownLibrary.render(content.trim());
      return `<div class="${alignmentClass}"><div class="aside-content">${divContent}</div><aside>${asideText}</aside></div>`;
    }
  );


  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync("_site/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.io/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // Opt-out of pre-processing global data JSON files: (default: `liquid`)
    dataTemplateEngine: false,

    // These are all optional (defaults are shown):
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
  };
};
