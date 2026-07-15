import express from "express";

const app = express();

const esc = (str) => {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

app.get("/", async (req, res) => {
  try {
    const apiUrl = "https://bunny-crholl-manga-api.vercel.app/api/v1/home-items";
    const response = await fetch(apiUrl);
    const json = await response.json();
    const data = json.data[0] || {};

    const { spotlight = [], trending = [], latest = [], pinned = [], recentlyAdded = [] } = data;

    const spotlightSlides = spotlight.map(item => `
      <div class="swiper-slide relative h-[55vh] md:h-[70vh]">
        <img src="${esc(item.poster)}" alt="${esc(item.title)}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-10">
          <h3 class="text-2xl md:text-4xl font-bold drop-shadow-lg">${esc(item.title)}</h3>
          <a href="${esc(item.slug)}" class="mt-3 inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full w-fit text-sm font-semibold transition shadow-lg">Read Now</a>
        </div>
      </div>
    `).join("");

    const trendingItems = trending.slice(0, 12).map(item => `
      <a href="${esc(item.slug)}" class="group card-hover bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800 hover:border-orange-500 transition">
        <img src="${esc(item.poster)}" alt="${esc(item.title)}" class="w-full h-52 object-cover group-hover:scale-105 transition duration-300" />
        <div class="p-3">
          <p class="text-sm font-medium truncate">${esc(item.title)}</p>
          <div class="flex justify-between items-center mt-1 text-xs text-zinc-400">
            <span>${esc(item.type) || "—"}</span>
            <span class="${item.status === "ongoing" ? "text-orange-400" : "text-zinc-500"}">${esc(item.status) || ""}</span>
          </div>
        </div>
      </a>
    `).join("");

    const latestItems = latest.slice(0, 9).map(item => `
      <div class="bg-zinc-900 rounded-xl overflow-hidden shadow-lg flex flex-col card-hover border border-zinc-800 hover:border-orange-500 transition">
        <div class="relative">
          <img src="${esc(item.poster)}" alt="${esc(item.title)}" class="w-full h-48 object-cover" />
          <div class="absolute top-2 left-2 flex gap-1">
            ${item.isNew ? '<span class="badge-new">New</span>' : ""}
            ${item.isPinned ? '<span class="badge-pinned">Pinned</span>' : ""}
          </div>
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <h4 class="font-semibold text-base truncate">${esc(item.title)}</h4>
          <div class="text-xs text-zinc-400 mt-0.5">${esc(item.type) || ""}</div>
          <div class="mt-3 flex-1">
            ${item.chapters.slice(0, 3).map(ch => `
              <div class="chapter-item flex justify-between items-center text-sm">
                <a href="${esc(ch.slug)}" class="hover:text-orange-400 transition">${esc(ch.title)}</a>
                <span class="text-xs text-zinc-500">${esc(ch.date)}</span>
              </div>
            `).join("")}
            ${item.chapters.length > 3 ? `<div class="text-xs text-zinc-500 mt-1">+ ${item.chapters.length - 3} more</div>` : ""}
          </div>
        </div>
      </div>
    `).join("");

    const pinnedItems = pinned.slice(0, 8).map(item => `
      <a href="${esc(item.slug)}" class="group card-hover bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800 hover:border-orange-500 transition">
        <img src="${esc(item.poster)}" alt="${esc(item.title)}" class="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
        <div class="p-2 text-center">
          <p class="text-sm font-medium truncate">${esc(item.title)}</p>
        </div>
      </a>
    `).join("");

    const recentlyItems = recentlyAdded.slice(0, 12).map(item => `
      <a href="${esc(item.slug)}" class="group card-hover bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800 hover:border-orange-500 transition">
        <img src="${esc(item.poster)}" alt="${esc(item.title)}" class="w-full h-52 object-cover group-hover:scale-105 transition duration-300" />
        <div class="p-3">
          <p class="text-sm font-medium truncate">${esc(item.title)}</p>
          <div class="flex flex-wrap gap-1 mt-1 text-xs text-zinc-400">
            <span>${esc(item.type) || ""}</span>
            <span>${esc(item.status) || ""}</span>
          </div>
        </div>
      </a>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BunnyCrholl – Manga 18+</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css" />
  <style>
    body { background: #0a0a0a; color: #f0f0f0; font-family: 'Roboto', sans-serif; }
    h1, h2, h3, h4 { font-family: 'Poppins', sans-serif; }
    .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 30px -10px rgba(249, 115, 22, 0.4); }
    .badge-new { background: #f97316; color: #fff; padding: 0 10px; border-radius: 999px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
    .badge-pinned { background: #3b82f6; color: #fff; padding: 0 10px; border-radius: 999px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
    .chapter-item { border-bottom: 1px solid #1f1f1f; padding: 6px 0; }
    .chapter-item:last-child { border-bottom: none; }
    .swiper-slide img { transition: transform 0.3s; }
    .swiper-slide:hover img { transform: scale(1.02); }
    .text-gradient { background: linear-gradient(135deg, #f97316, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 0; height: 2px; background: #f97316; transition: width 0.3s; }
    .nav-link:hover::after { width: 100%; }
  </style>
</head>
<body>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
  <header class="flex justify-between items-center mb-8">
    <div class="flex items-center gap-2">
      <span class="text-2xl font-bold text-gradient">BunnyCrholl</span>
      <span class="text-xs bg-orange-600/20 text-orange-300 px-2 py-0.5 rounded-full">18+</span>
    </div>
    <nav class="hidden md:flex gap-6 text-sm font-medium">
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Home</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Series</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Genres</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Latest</a>
    </nav>
    <button class="md:hidden text-white" onclick="document.querySelector('nav').classList.toggle('hidden')">
      <i data-lucide="menu" class="w-6 h-6"></i>
    </button>
  </header>

  <div id="content">
    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i data-lucide="sparkles" class="w-5 h-5 text-orange-400"></i> Spotlight
      </h2>
      <div class="swiper spotlight-swiper rounded-2xl overflow-hidden shadow-2xl">
        <div class="swiper-wrapper">${spotlightSlides}</div>
        <div class="swiper-pagination"></div>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i data-lucide="flame" class="w-5 h-5 text-orange-400"></i> Trending
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">${trendingItems}</div>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i data-lucide="clock" class="w-5 h-5 text-orange-400"></i> Latest Updates
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${latestItems}</div>
    </section>

    <section class="mb-12" id="pinned-section">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i data-lucide="pin" class="w-5 h-5 text-orange-400"></i> Picked for You
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">${pinnedItems}</div>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <i data-lucide="plus-circle" class="w-5 h-5 text-orange-400"></i> Recently Added
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">${recentlyItems}</div>
    </section>
  </div>

  <footer class="border-t border-zinc-800 pt-6 mt-12 text-center text-sm text-zinc-500">
    <p>© 2026 BunnyCrholl – All data is for demonstration purposes.</p>
  </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    new Swiper('.spotlight-swiper', {
      loop: true,
      autoplay: { delay: 4500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      effect: 'fade',
      fadeEffect: { crossFade: true }
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
</script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
});
app.get("/series/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const apiUrl = `https://bunny-crholl-manga-api.vercel.app/api/v1/series/${slug}`;
    const response = await fetch(apiUrl);
    const json = await response.json();
    const data = json.data[0] || {};
    const { info = {}, chapters = [] } = data;

    const esc = (str) => {
      if (!str) return "";
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    const chapterList = chapters.map((ch, index) => `
      <a href="${esc(ch.slug)}" class="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800 transition border border-zinc-800 hover:border-orange-500 group">
        <div class="w-16 h-20 flex-shrink-0 bg-zinc-700 rounded overflow-hidden">
          <img src="${esc(ch.thumbnail) || esc(info.poster)}" alt="${esc(ch.chapter)}" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate group-hover:text-orange-400 transition">${esc(ch.chapter)}</p>
          <div class="flex items-center gap-3 text-xs text-zinc-400">
            <span>${esc(ch.date) || "—"}</span>
            ${ch.coin ? '<span class="text-yellow-400">● Coin</span>' : ''}
            ${ch.premium ? '<span class="text-orange-400">● Premium</span>' : ''}
            ${ch.locked ? '<span class="text-red-400">● Locked</span>' : ''}
          </div>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition"></i>
      </a>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(info.title)} – BunnyCrholl</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #0a0a0a; color: #f0f0f0; font-family: 'Roboto', sans-serif; }
    h1, h2, h3, h4 { font-family: 'Poppins', sans-serif; }
    .text-gradient { background: linear-gradient(135deg, #f97316, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 0; height: 2px; background: #f97316; transition: width 0.3s; }
    .nav-link:hover::after { width: 100%; }
    .badge-genre { background: rgba(249, 115, 22, 0.15); color: #f97316; padding: 2px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 500; }
  </style>
</head>
<body>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
  <header class="flex justify-between items-center mb-8">
    <div class="flex items-center gap-2">
      <a href="/" class="text-2xl font-bold text-gradient">BunnyCrholl</a>
      <span class="text-xs bg-orange-600/20 text-orange-300 px-2 py-0.5 rounded-full">18+</span>
    </div>
    <nav class="hidden md:flex gap-6 text-sm font-medium">
      <a href="/" class="nav-link text-zinc-300 hover:text-white transition">Home</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Series</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Genres</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Latest</a>
    </nav>
    <button class="md:hidden text-white" onclick="document.querySelector('nav').classList.toggle('hidden')">
      <i data-lucide="menu" class="w-6 h-6"></i>
    </button>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- Left: Poster + Info -->
    <div class="md:col-span-1">
      <div class="rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        <img src="${esc(info.poster)}" alt="${esc(info.title)}" class="w-full object-cover" />
      </div>
      <div class="mt-6 space-y-2 text-sm text-zinc-300">
        <div><span class="font-medium text-zinc-400">Status:</span> <span class="${info.status === 'ongoing' ? 'text-orange-400' : 'text-zinc-400'}">${esc(info.status) || "—"}</span></div>
        <div><span class="font-medium text-zinc-400">Type:</span> ${esc(info.type) || "—"}</div>
        <div><span class="font-medium text-zinc-400">Last Updated:</span> ${esc(info.lastUpdated) || "—"}</div>
        <div><span class="font-medium text-zinc-400">Author:</span> ${esc(info.author) || "—"}</div>
        <div><span class="font-medium text-zinc-400">Artist:</span> ${esc(info.artist) || "—"}</div>
        <div><span class="font-medium text-zinc-400">Genres:</span> ${(info.genres || []).map(g => `<span class="badge-genre">${esc(g)}</span>`).join(" ")}</div>
      </div>
      <div class="mt-6 flex flex-wrap gap-3">
        ${info.startReading ? `<a href="${esc(info.startReading)}" class="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full text-sm font-semibold transition">Start Reading</a>` : ""}
        ${info.latestChapter?.slug ? `<a href="${esc(info.latestChapter.slug)}" class="border border-orange-500 text-orange-400 hover:bg-orange-500/10 px-6 py-2 rounded-full text-sm font-semibold transition">Latest Chapter</a>` : ""}
      </div>
    </div>

    <!-- Right: Details + Chapters -->
    <div class="md:col-span-2 space-y-6">
      <h1 class="text-3xl md:text-4xl font-bold">${esc(info.title)}</h1>
      ${info.alternativeTitles?.length ? `<p class="text-sm text-zinc-400">Also known as: ${info.alternativeTitles.map(esc).join(", ")}</p>` : ""}
      <div class="prose prose-invert prose-sm max-w-none text-zinc-300">
        <p>${esc(info.description) || "No description available."}</p>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <i data-lucide="book-open" class="w-5 h-5 text-orange-400"></i> Chapters
        </h2>
        <div class="space-y-2">
          ${chapterList || `<p class="text-zinc-500 text-sm">No chapters available.</p>`}
        </div>
      </div>
    </div>
  </div>

  <footer class="border-t border-zinc-800 pt-6 mt-12 text-center text-sm text-zinc-500">
    <p>© 2026 BunnyCrholl – All data is for demonstration purposes.</p>
  </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
</script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
});
app.get("/chapter/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const apiUrl = `https://bunny-crholl-manga-api.vercel.app/api/v1/chapter/${slug}`;
    const response = await fetch(apiUrl);
    const json = await response.json();
    const data = json.data[0] || {};
    const { chapter = {} } = data;

    const esc = (str) => {
      if (!str) return "";
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    const pagesHtml = (chapter.pages || []).map(p => `
      <div class="page-container mb-4">
        <img src="${esc(p.image)}" alt="Page ${p.page}" class="w-full max-w-3xl mx-auto rounded-lg shadow-2xl" loading="lazy" />
        <p class="text-center text-xs text-zinc-500 mt-1">Page ${p.page}</p>
      </div>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(chapter.chapter || "Chapter")} – ${esc(chapter.series || "BunnyCrholl")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #0a0a0a; color: #f0f0f0; font-family: 'Roboto', sans-serif; }
    h1, h2, h3, h4 { font-family: 'Poppins', sans-serif; }
    .text-gradient { background: linear-gradient(135deg, #f97316, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 0; height: 2px; background: #f97316; transition: width 0.3s; }
    .nav-link:hover::after { width: 100%; }
    .page-container { transition: transform 0.2s; }
    .page-container:hover { transform: scale(1.01); }
  </style>
</head>
<body>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">
  <!-- Header -->
  <header class="flex justify-between items-center mb-8">
    <div class="flex items-center gap-2">
      <a href="/" class="text-2xl font-bold text-gradient">BunnyCrholl</a>
      <span class="text-xs bg-orange-600/20 text-orange-300 px-2 py-0.5 rounded-full">18+</span>
    </div>
    <nav class="hidden md:flex gap-6 text-sm font-medium">
      <a href="/" class="nav-link text-zinc-300 hover:text-white transition">Home</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Series</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Genres</a>
      <a href="#" class="nav-link text-zinc-300 hover:text-white transition">Latest</a>
    </nav>
    <button class="md:hidden text-white" onclick="document.querySelector('nav').classList.toggle('hidden')">
      <i data-lucide="menu" class="w-6 h-6"></i>
    </button>
  </header>

  <!-- Chapter Info -->
  <div class="text-center mb-8">
    <h1 class="text-2xl md:text-3xl font-bold">${esc(chapter.chapter || "Chapter")}</h1>
    <p class="text-zinc-400 text-sm mt-1">${esc(chapter.series) || "Unknown Series"}</p>
  </div>

  <!-- Pages -->
  <div class="pages-wrapper">
    ${pagesHtml || `<p class="text-center text-zinc-500">No pages available.</p>`}
  </div>

  <!-- Navigation -->
  <div class="flex justify-between items-center mt-10 gap-4 flex-wrap">
    ${chapter.nextChapter ? `
      <a href="${esc(chapter.nextChapter.slug)}" class="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full text-sm font-semibold transition">
        <i data-lucide="chevron-left" class="w-4 h-4"></i> Next Chapter
      </a>
    ` : `
      <span class="text-zinc-500 text-sm">No next chapter</span>
    `}
    <a href="/" class="text-orange-400 hover:text-orange-300 text-sm font-medium transition">
      <i data-lucide="home" class="w-4 h-4 inline"></i> Home
    </a>
    ${chapter.prevChapter ? `
      <a href="${esc(chapter.prevChapter.slug)}" class="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full text-sm font-semibold transition">
        Previous Chapter <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </a>
    ` : `
      <span class="text-zinc-500 text-sm">No previous chapter</span>
    `}
  </div>

  <footer class="border-t border-zinc-800 pt-6 mt-12 text-center text-sm text-zinc-500">
    <p>© 2026 BunnyCrholl – All data is for demonstration purposes.</p>
  </footer>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
</script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
});

app.listen(9090, () => {
  console.log("Server running at http://localhost:9090");
});

export default app;