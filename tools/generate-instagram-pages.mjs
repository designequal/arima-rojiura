import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "assets/data/instagram-posts.json");
const outputDir = path.join(root, "posts");

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const formatDate = (value) => {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
};

const mediaPaths = (post) => {
  const values = [];
  if (post.image) values.push(post.image);
  if (Array.isArray(post.images)) values.push(...post.images);
  return [...new Set(values.map((item) => typeof item === "string" ? item : item?.src).filter(Boolean))];
};

const assetUrl = (value) => "../" + String(value).replace(/^\.\//, "");

const styles = [
  ":root{color-scheme:light;font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Hiragino Kaku Gothic ProN\",\"Yu Gothic\",sans-serif;color:#231f1b;background:#f5f2ec}",
  "*{box-sizing:border-box}body{margin:0;background:#f5f2ec}a{color:inherit}",
  ".post-header{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px max(20px,5vw);border-bottom:1px solid rgba(35,31,27,.12);background:rgba(255,255,255,.72)}",
  ".post-header a{font-size:.9rem;text-decoration:none}.post-header a:hover{text-decoration:underline}.post-header span{color:#746d65;font-size:.75rem;letter-spacing:.16em;text-transform:uppercase}",
  "main{width:min(820px,calc(100% - 32px));margin:0 auto;padding:48px 0 72px}.post{overflow:hidden;border:1px solid rgba(35,31,27,.12);background:#fff;box-shadow:0 18px 50px rgba(35,31,27,.08)}",
  ".post__head{padding:28px 28px 22px}.post__date{margin:0 0 10px;color:#746d65;font-size:.8rem;letter-spacing:.08em}.post h1{margin:0;font-size:clamp(1.35rem,3vw,2.1rem);line-height:1.45}",
  ".post__media{display:grid;gap:2px;background:#eee9e2}.post__media img{display:block;width:100%;max-height:760px;object-fit:contain;background:#eee9e2}.post__body{padding:28px}.post__caption{margin:0;white-space:pre-wrap;line-height:1.9}",
  ".post__actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.post__button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border:1px solid #231f1b;text-decoration:none}.post__button--primary{color:#fff;background:#231f1b}.post__button:hover{opacity:.72}",
  "@media(max-width:600px){.post__head,.post__body{padding:22px 18px}main{padding-top:28px}}"
].join("");

const renderPage = (post) => {
  const id = String(post.id || "").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("投稿IDが不正です: " + id);
  const caption = String(post.caption || post.title || "Instagram投稿").trim();
  const title = String(post.title || caption.split(/\r?\n/).find((line) => line.trim()) || "Instagram投稿").trim();
  const images = mediaPaths(post).map((image) => "<img src=\"" + escapeHtml(assetUrl(image)) + "\" alt=\"" + escapeHtml(title) + "\" loading=\"lazy\">").join("");
  const original = post.permalink ? "<a class=\"post__button post__button--primary\" href=\"" + escapeHtml(post.permalink) + "\" target=\"_blank\" rel=\"noopener noreferrer\">Instagramで見る ↗</a>" : "";
  return [
    "<!doctype html>",
    "<html lang=\"ja\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<title>" + escapeHtml(title) + " | Instagram記事</title><meta name=\"description\" content=\"" + escapeHtml(title) + "\"><link rel=\"stylesheet\" href=\"post.css\"></head>",
    "<body><header class=\"post-header\"><a href=\"../posts.html\">← 記事一覧へ戻る</a><span>Instagram Journal</span></header><main><article class=\"post\">",
    "<header class=\"post__head\"><p class=\"post__date\">" + escapeHtml(formatDate(post.timestamp)) + "</p><h1>" + escapeHtml(title) + "</h1></header>",
    images ? "<div class=\"post__media\">" + images + "</div>" : "",
    "<div class=\"post__body\"><p class=\"post__caption\">" + escapeHtml(caption) + "</p><div class=\"post__actions\">" + original + "<a class=\"post__button\" href=\"../posts.html\">記事一覧へ戻る</a></div></div>",
    "</article></main></body></html>"
  ].join("\n");
};

const posts = JSON.parse(await readFile(dataPath, "utf8"));
if (!Array.isArray(posts)) throw new Error("Instagram投稿データは配列である必要があります。");
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "post.css"), styles, "utf8");

let generated = 0;
for (const post of posts) {
  const id = String(post.id || "").trim();
  if (!id) continue;
  await writeFile(path.join(outputDir, id + ".html"), renderPage(post), "utf8");
  generated += 1;
}
console.log("Instagram記事ページ生成完了: " + generated + "件");
