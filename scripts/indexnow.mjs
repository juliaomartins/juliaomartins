#!/usr/bin/env node
/**
 * Tell search engines about every page, photo and clip right after a deploy:
 * `npm run indexnow`.
 *
 * IndexNow (https://www.indexnow.org) is a shared ping used by Bing, Yandex,
 * Seznam, Naver and others: one request and they recrawl the listed URLs,
 * instead of waiting days to find them. Google does not use it; for Google,
 * submit the sitemap in Search Console.
 *
 * It reads the LIVE sitemap, so run it after the deploy has finished. The key
 * is the file public/e9e9670a632d48a699a9d4f02704adc9.txt, which proves the
 * site owns the request.
 */
const SITE = "https://juliaomartins.dev";
const HOST = new URL(SITE).host;
const KEY = "e9e9670a632d48a699a9d4f02704adc9";

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [
  ...sitemap.matchAll(/<(?:loc|image:loc|video:content_loc|video:thumbnail_loc)>([^<]+)</g),
].map((match) => match[1]);
const urlList = [...new Set(urls)].filter((url) => new URL(url).host === HOST);

if (urlList.length === 0) {
  console.error("No URLs found in the live sitemap; is the site deployed?");
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});

// 200 = accepted, 202 = accepted and the key is still being checked.
console.log(`IndexNow: ${response.status} ${response.statusText} for ${urlList.length} URLs`);
if (!response.ok) process.exitCode = 1;
