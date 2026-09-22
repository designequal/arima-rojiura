import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const configPath = path.join(root, 'config/instagram-journal.json');
const dataPath = path.join(root, 'assets/data/instagram-posts.json');
const imageDir = path.join(root, 'assets/images/instagram-feed');
const token = process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;

if (!token) {
  throw new Error('INSTAGRAM_GRAPH_ACCESS_TOKEN が設定されていません。');
}

const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const {
  apiVersion,
  sourceInstagramUserId,
  targetUsername,
  syncLimit = 100,
  imageMaxWidth = 1600
} = config;

if (!apiVersion || !sourceInstagramUserId || !targetUsername) {
  throw new Error('config/instagram-journal.json の必須項目が不足しています。');
}
if (!/^[A-Za-z0-9._]+$/.test(targetUsername)) {
  throw new Error('targetUsername の形式が不正です。@なしのユーザーネームを指定してください。');
}
if (!/^\d+$/.test(String(sourceInstagramUserId))) {
  throw new Error('sourceInstagramUserId を実際のInstagramプロアカウントIDへ設定してください。');
}

const fields = [
  'id',
  'caption',
  'media_type',
  'media_url',
  'thumbnail_url',
  'permalink',
  'timestamp',
  'children{id,media_type,media_url,thumbnail_url}'
].join(',');

const requestedLimit = Math.min(Math.max(Number(process.env.INSTAGRAM_SYNC_LIMIT || syncLimit) || 100, 1), 100);
const pageSize = Math.min(requestedLimit, 25);
const fetchMediaPage = async (after) => {
  const pagination = after ? `.after(${after})` : '';
  const discoveryField = `business_discovery.username(${targetUsername}){id,username,media.limit(${pageSize})${pagination}{${fields}}}`;
  const apiUrl = new URL(`https://graph.facebook.com/${apiVersion}/${sourceInstagramUserId}`);
  apiUrl.searchParams.set('fields', discoveryField);
  apiUrl.searchParams.set('access_token', token);
  const apiResponse = await fetch(apiUrl, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
  const apiJson = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok || apiJson?.error) {
    const error = apiJson?.error;
    const detail = error
      ? `${error.type ?? 'Graph API error'}: ${error.message ?? 'unknown'} (code=${error.code ?? '?'})`
      : `${apiResponse.status} ${apiResponse.statusText}`;
    throw new Error(`Instagram Graph API error: ${detail}`);
  }
  return apiJson?.business_discovery?.media;
};

const media = [];
let after;
while (media.length < requestedLimit) {
  const page = await fetchMediaPage(after);
  const pageItems = Array.isArray(page?.data) ? page.data : [];
  media.push(...pageItems);
  const nextAfter = page?.paging?.cursors?.after;
  if (!nextAfter || pageItems.length < pageSize) break;
  after = nextAfter;
}
if (!Array.isArray(media) || media.length === 0) {
  throw new Error('Business Discoveryのmediaデータを取得できませんでした。対象が公開プロアカウントか確認してください。');
}

const existing = await fs.readFile(dataPath, 'utf8')
  .then((value) => JSON.parse(value))
  .catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
if (!Array.isArray(existing)) {
  throw new Error('assets/data/instagram-posts.json は配列である必要があります。');
}

const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'instagram-sync-'));
const staged = [];

const imageSource = (mediaItem) => mediaItem?.media_type === 'VIDEO'
  ? mediaItem.thumbnail_url || mediaItem.media_url
  : mediaItem.media_url || mediaItem.thumbnail_url;

const downloadAsWebp = async (url, filename) => {
  if (!url) throw new Error(`画像URLがありません: ${filename}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`画像取得失敗 ${response.status}: ${filename}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const output = path.join(tmpDir, filename);
  await sharp(buffer)
    .rotate()
    .resize({ width: Number(imageMaxWidth), height: Number(imageMaxWidth), fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(output);
  staged.push({ from: output, to: path.join(imageDir, filename) });
  return `assets/images/instagram-feed/${filename}`;
};

const normalizeTitle = (caption = '') => {
  const firstLine = caption.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || 'Instagram投稿';
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}…` : firstLine;
};

const incoming = [];
for (const item of media) {
  const children = Array.isArray(item?.children?.data) ? item.children.data : [];
  const imageSources = children.length
    ? children.map(imageSource).filter(Boolean)
    : [imageSource(item)].filter(Boolean);

  const images = [];
  for (let index = 0; index < imageSources.length; index += 1) {
    const suffix = imageSources.length > 1 ? `-${String(index + 1).padStart(2, '0')}` : '';
    images.push(await downloadAsWebp(imageSources[index], `${item.id}${suffix}.webp`));
  }

  const caption = item.caption || '';
  const post = {
    id: String(item.id),
    source: 'business-discovery',
    title: normalizeTitle(caption),
    caption,
    timestamp: item.timestamp || '',
    mediaType: item.media_type || '',
    permalink: item.permalink || '',
    syncedAt: new Date().toISOString()
  };

  if (images.length > 1) post.images = images;
  else if (images.length === 1) post.image = images[0];

  incoming.push(post);
}

const byId = new Map(existing.map((post) => [String(post.id), post]));
for (const post of incoming) byId.set(String(post.id), post);
const merged = [...byId.values()].sort((a, b) => {
  const aTime = Date.parse(a.timestamp || 0) || 0;
  const bTime = Date.parse(b.timestamp || 0) || 0;
  return bTime - aTime;
});

await fs.mkdir(imageDir, { recursive: true });
for (const file of staged) {
  await fs.copyFile(file.from, file.to);
}
await fs.mkdir(path.dirname(dataPath), { recursive: true });
await fs.writeFile(dataPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
await fs.rm(tmpDir, { recursive: true, force: true });

console.log(`Instagram同期完了: API取得 ${incoming.length} 件 / 保存済み合計 ${merged.length} 件`);
