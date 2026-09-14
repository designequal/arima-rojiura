import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, 'config/instagram-journal.json');
const token = process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;

function fail(message) {
  console.error(`Instagram接続チェック失敗: ${message}`);
  process.exitCode = 1;
}

if (!token) {
  fail('INSTAGRAM_GRAPH_ACCESS_TOKEN が設定されていません。対象リポジトリのActions Secretを再保存してください。');
} else {
  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const { apiVersion, sourceInstagramUserId, targetUsername, syncLimit = 100 } = config;

    if (!apiVersion || !sourceInstagramUserId || !targetUsername) {
      throw new Error('config/instagram-journal.json の必須項目が不足しています。');
    }
    if (!/^\d+$/.test(String(sourceInstagramUserId))) {
      throw new Error('sourceInstagramUserId は運営側Instagramプロアカウントの数値IDで指定してください。');
    }
    if (!/^[A-Za-z0-9._]+$/.test(targetUsername) || targetUsername.startsWith('SET_')) {
      throw new Error('targetUsername は @なしの実在するInstagramユーザーネームへ置き換えてください。');
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const endpoint = new URL(`https://graph.facebook.com/${apiVersion}/${sourceInstagramUserId}`);
    endpoint.searchParams.set('fields', `business_discovery.username(${targetUsername}){id,username,media.limit(${Number(syncLimit)}){${fields}}}`);
    endpoint.searchParams.set('access_token', token);

    console.log(`接続先: ${apiVersion} / Business Discovery / @${targetUsername}`);
    const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.error) {
      const error = payload?.error;
      const detail = error ? `${error.type ?? 'Graph API error'}: ${error.message ?? 'unknown'} (code=${error.code ?? '?'})` : `${response.status} ${response.statusText}`;
      throw new Error(`${detail}。トークン、source ID、対象アカウントの公開設定を確認してください。`);
    }

    const media = payload?.business_discovery?.media?.data;
    if (!Array.isArray(media)) {
      throw new Error('Business Discoveryのmediaデータを取得できませんでした。');
    }
    console.log(`接続成功: 投稿 ${media.length}件`);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}
