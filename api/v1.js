import * as cheerio from "cheerio";
import express from "express";
import axios from "axios";
import UserAgent from 'user-agents';
const userAgent = new UserAgent().toString();
const headers = {
  'User-Agent': userAgent,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
  'Referer': 'https://erisscans.com/',
};
const router = express.Router();
const _userAgent =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36";
const url = "https://erisscans.com/";

router.get("/home-items", async (req, res) => {
  const { data } = await axios.get(url, {
    headers: {
      headers,
    },
  });

  const $ = cheerio.load(data);
  function parseTags(tagsStr) {
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  }
  const spotlight = [];
  function extractBgImage(styleStr) {
    if (!styleStr) return null;
    const match = styleStr.match(/background-image:\s*url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : null;
  }

  $(".splide.series-splide .splide__list > a.splide__slide").each((i, el) => {
    spotlight.push({
      title: $(el).attr("alt") || $(el).attr("title") || null,
      slug: $(el).attr("href") || null,
      poster: extractBgImage($(el).find("> div").first().attr("style")),
    });
  });
  const popular = [];

  $("button.group").each((i, el) => {
    const $btn = $(el);
    const $container = $btn.find("> div").first();
    const $posterLink = $container.find("a").first();
    const $posterDiv = $posterLink
      .find("div[style*='background-image']")
      .first();
    const $rankDiv = $container.find(".font-bold").first();
    const $infoDiv = $container.find(".flex.flex-col").first();
    const $titleLink = $infoDiv.find("a").first();
    const $titleH3 = $titleLink.find("h3").first();
    const $genreDiv = $infoDiv.find(".flex.flex-wrap").first();

    const genres = [];
    $genreDiv.find("a[href^='/series/?genre=']").each((j, genreEl) => {
      genres.push($(genreEl).text().trim().replace(/,$/, ""));
    });

    const tags = parseTags($btn.attr("tags"));

    popular.push({
      rank: parseInt($rankDiv.text().trim()) || i + 1,
      title:
        $btn.attr("alt") ||
        $btn.attr("title") ||
        $titleH3.text().trim() ||
        "Unknown",
      slug: $posterLink.attr("href") || null,
      poster: extractBgImage($posterDiv.attr("style")) || null,
      type: $btn.attr("data-type") || null,
      status: $btn.attr("data-status") || null,
      genres: genres,
      tags: tags,
    });
  });

  const latest = [];
  $(".latest-poster").each((i, el) => {
    const $card = $(el);
    const $poster = $card.find("> a").first();
    const $info = $card.find("> div").last();

    const chapters = [];
    $info.find("a[href^='/chapter/']").each((j, ch) => {
      const $ch = $(ch);
      chapters.push({
        title: $ch.attr("alt") || $ch.attr("title"),
        slug: $ch.attr("href"),
        date: $ch.attr("d") || $ch.find("span.whitespace-nowrap").text().trim(),
        coins: $ch.find("img[alt='Coin']").length > 0,
      });
    });

    latest.push({
      title: $poster.attr("alt") || $poster.attr("title"),
      slug: $poster.attr("href"),
      poster: extractBgImage($poster.attr("style")),
      isNew: $poster.find("span:contains('New')").length > 0,
      isPinned: $poster.find("span:contains('Pinned')").length > 0,
      type: $poster.find("span.capitalize").text().trim() || null,
      chapters,
    });
  });

  const pinned = [];
  $(".latest-poster").each((i, el) => {
    const $card = $(el);
    const $poster = $card.find("> a").first();

    if ($poster.find("span:contains('Pinned')").length === 0) return;

    const $info = $card.find("> div").last();
    const chapters = [];

    $info.find("a[href^='/chapter/']").each((j, ch) => {
      const $ch = $(ch);
      chapters.push({
        title: $ch.attr("alt") || $ch.attr("title"),
        slug: $ch.attr("href"),
        date: $ch.attr("d") || $ch.find("span.whitespace-nowrap").text().trim(),
        coins: $ch.find("img[alt='Coin']").length > 0,
      });
    });

    pinned.push({
      title: $poster.attr("alt") || $poster.attr("title"),
      slug: $poster.attr("href"),
      poster: extractBgImage($poster.attr("style")),
      type: $poster.find("span.capitalize").text().trim() || null,
      chapters,
    });
  });
  const latestUpdate = [];
  $(".latest-poster").each((i, el) => {
    const $card = $(el);
    const $poster = $card.find("> a").first();
    const $info = $card.find("> div").last();

    const newChapters = [];
    $info.find("a[href^='/chapter/']").each((j, ch) => {
      const $ch = $(ch);

      if ($ch.find("span.animate-pulse").length === 0) return;

      newChapters.push({
        title: $ch.attr("alt") || $ch.attr("title"),
        slug: $ch.attr("href"),
        date: $ch.attr("d") || $ch.find("span.whitespace-nowrap").text().trim(),
        coins: $ch.find("img[alt='Coin']").length > 0,
      });
    });
    if (newChapters.length > 0) {
      latestUpdate.push({
        title: $poster.attr("alt") || $poster.attr("title"),
        slug: $poster.attr("href"),
        poster: extractBgImage($poster.attr("style")),
        type: $poster.find("span.capitalize").text().trim() || null,
        newChapters,
      });
    }
  });

  const recentlyAdded = [];
  $("button.group").each((i, el) => {
    const $btn = $(el);
    const $posterLink = $btn.find("a[href^='/series/']").first();
    const $posterDiv = $posterLink.find("> div").first();
    const $bgDiv = $posterDiv.find("div[style*='background-image']").first();
    const $infoDiv = $btn.find(".flex.flex-col").first();
    const $titleLink = $infoDiv.find("a[href^='/series/']").first();
    const $genreDiv = $infoDiv.find(".flex.flex-wrap").first();

    if ($posterDiv.find("span:contains('New')").length === 0) return;

    const genres = [];
    $genreDiv.find("a[href^='/series/?genre=']").each((j, g) => {
      genres.push($(g).text().trim().replace(/,$/, ""));
    });

    recentlyAdded.push({
      title:
        $btn.attr("alt") ||
        $btn.attr("title") ||
        $titleLink.find("h3").text().trim(),
      slug: $posterLink.attr("href"),
      poster: extractBgImage($bgDiv.attr("style")),
      type: $btn.attr("data-type") || null,
      status: $btn.attr("data-status") || null,
      genres: genres,
      tags: JSON.parse($btn.attr("tags") || "[]"),
    });
  });

  res.json({
    response: true,
    count: [
      {
        spotlight: spotlight.length,
        popular: popular.length,
        latest: latest.length,
        pinned: pinned.length,
        latestUpdate: latestUpdate.length,
        recentlyAdded: recentlyAdded.length,
      },
    ],
    data: [
      {
        spotlight: spotlight,
        trending: popular,
        latest: latest,
        pinned: pinned,
        latestUpdate: latestUpdate,
        recentlyAdded: recentlyAdded,
      },
    ],
  });
});

router.get("/series/:slug", async (req, res) => {
  const { slug } = req.params;
  const url = `https://erisscans.com/series/${slug}/`;
  const { data } = await axios.get(url, {
    headers: {
      headers,
    },
  });

  const $ = cheerio.load(data);

  function extractPhoto(style) {
    const match = style?.match(/url\((.*?)\)/);
    return match ? match[1].replace(/['"]/g, "") : null;
  }

  const info = {};

  // Poster
  info.poster = extractPhoto($("div[style*='--photoURL']").attr("style"));

  // Title
  info.title = $("h1.font-bold").first().text().trim();

  // Alternative titles
  info.alternativeTitles = [];
  $(".select-all").each((_, el) => {
    info.alternativeTitles.push($(el).text().trim());
  });

  // Description
  info.description = $("#expand_content p").text().trim();

  // Status
  info.status = $("div[title='Status'] span").text().trim();

  // Type
  info.type = $("div[title='Series Type'] span").text().trim();

  // Last Updated
  info.lastUpdated = $("div[title='Last Updated At'] span").text().trim();

  // Author
  info.author = $("div[title='Author'] span").text().trim();

  // Artist
  info.artist = $("div[title='Artist'] span").text().trim();

  // Genres
  info.genres = [];
  $("a[href^='/series/?genre=']").each((_, el) => {
    info.genres.push($(el).text().trim());
  });

  // Start Reading
  info.startReading = $("a[title='Chapter 1']").attr("href");

  // Latest Chapter
  const latest = $("a[title^='Chapter']").last();
  info.latestChapter = {
    title: latest.attr("title"),
    slug: latest.attr("href"),
  };
  function extractBgImage(style) {
    if (!style) return null;

    const match = style.match(/url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : null;
  }

  const chapters = [];

  $("#chapters > a").each((i, el) => {
    const $ch = $(el);

    chapters.push({
      chapter: $ch.attr("title") || $ch.attr("alt"),
      slug: $ch.attr("href"),
      thumbnail: extractBgImage(
        $ch.find("div[style*='background-image']").attr("style"),
      ),
      date: $ch.attr("d"),
      coin: Number($ch.attr("c")) || 0,
      locked: $ch.find("img[src*='lock']").length > 0,
      premium: Number($ch.attr("c")) > 0,
      previewId: $ch.attr("p") || null,
    });
  });

  res.json({
    response: 200,
    data: [
      {
        info,
        chapters,
      },
    ],
  });
});

router.get("/chapter/:slug", async (req, res) => {
  const { slug } = req.params;
  const url = `https://erisscans.com/chapter/${slug}/`;
  const { data } = await axios.get(url, {
    headers: {
      headers,
    },
  });

  const $ = cheerio.load(data);
  function extractBgImage(style) {
  if (!style) return null;

  const match = style.match(/url\((['"]?)(.*?)\1\)/);
  return match ? match[2] : null;
}

const chapter = {};

// Series title
chapter.series = $("#chapter_header a").text().trim();

// Chapter title
chapter.chapter = $("#chapter_header h1")
  .text()
  .replace($("#chapter_header a").text(), "")
  .replace("-", "")
  .trim();

// Images
chapter.pages = [];

$("#pages img.myImage").each((i, el) => {
  const uid = $(el).attr("uid");

  chapter.pages.push({
    page: i + 1,
    uid,
    image: `https://cdn.meowing.org/uploads/${uid}`
  });
});

const next = $("div.font-medium:contains('Next Chapter')")
  .nextAll("div")
  .find("a")
  .first();

chapter.nextChapter = next.length
  ? {
      title: next.attr("title"),
      slug: next.attr("href"),
      date: next.attr("d"),
      coin: Number(next.attr("c")),
      locked: next.find("img[src*='lock']").length > 0,
      thumbnail: extractBgImage(
        next.find("div[style*='background-image']").attr("style")
      )
    }
  : null;

res.json({
  response: "ok",
  status: "200",
  data: [{
    chapter,
  }]
})
});
router.get("/res", (req, res)=>{
  res.send("HSLKDUIGJRIJKKKKKKSOJKJIHHFGG")
})
export default router;
