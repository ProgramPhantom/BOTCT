import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicIconsDir = path.join(rootDir, 'public', 'assets', 'icons');
const publicAssetsDir = path.join(rootDir, 'public', 'assets');
const dataDir = path.join(rootDir, 'src', 'data');

fs.mkdirSync(publicIconsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.statusText}`);
      return false;
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('1. Fetching roles.json...');
  const rolesUrl = 'https://raw.githubusercontent.com/bra1n/townsquare/main/src/roles.json';
  const rolesRes = await fetch(rolesUrl);
  if (!rolesRes.ok) {
    throw new Error('Failed to fetch roles.json');
  }
  const roles = await rolesRes.json();
  fs.writeFileSync(path.join(dataDir, 'roles.json'), JSON.stringify(roles, null, 2));
  console.log(`Saved ${roles.length} roles to src/data/roles.json`);

  console.log('2. Fetching extra assets (background, death token)...');
  await downloadFile('https://raw.githubusercontent.com/bra1n/townsquare/main/src/assets/death.png', path.join(publicAssetsDir, 'death.png'));
  await downloadFile('https://raw.githubusercontent.com/bra1n/townsquare/main/src/assets/background.jpg', path.join(publicAssetsDir, 'background.jpg'));

  console.log('3. Fetching tree from GitHub to get full icon list...');
  const treeUrl = 'https://api.github.com/repos/bra1n/townsquare/git/trees/main?recursive=1';
  let iconFiles = [];
  try {
    const treeRes = await fetch(treeUrl, { headers: { 'User-Agent': 'BOTCT-Agent' } });
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      iconFiles = treeData.tree
        .filter(item => item.path.startsWith('src/assets/icons/') && item.path.endsWith('.png'))
        .map(item => item.path.replace('src/assets/icons/', ''));
    }
  } catch (e) {
    console.warn('Could not fetch git tree, falling back to roles list:', e.message);
  }

  // If tree fetch was rate limited or empty, fallback to roles ids
  if (iconFiles.length === 0) {
    iconFiles = roles.map(r => `${r.id}.png`);
  }

  console.log(`Downloading ${iconFiles.length} character icons in batches...`);
  const BATCH_SIZE = 10;
  let downloaded = 0;

  for (let i = 0; i < iconFiles.length; i += BATCH_SIZE) {
    const batch = iconFiles.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async file => {
      const url = `https://raw.githubusercontent.com/bra1n/townsquare/main/src/assets/icons/${file}`;
      const dest = path.join(publicIconsDir, file);
      if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
        const success = await downloadFile(url, dest);
        if (success) downloaded++;
      } else {
        downloaded++;
      }
    }));
    process.stdout.write(`Progress: ${downloaded}/${iconFiles.length}\r`);
  }

  console.log(`\nSuccessfully downloaded/verified ${downloaded} character icons!`);
}

main().catch(err => {
  console.error('Download error:', err);
  process.exit(1);
});
