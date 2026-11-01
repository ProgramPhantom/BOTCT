import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const iconsDir = path.resolve('public/assets/icons');
const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

console.log(`Centering ${files.length} icons to their painted view...`);

let count = 0;
for (const file of files) {
  const filePath = path.join(iconsDir, file);
  try {
    // 1. Trim all empty transparent borders so we isolate the painted pixels
    const trimmed = await sharp(filePath)
      .trim()
      .toBuffer({ resolveWithObject: true });

    const tw = trimmed.info.width;
    const th = trimmed.info.height;

    // 2. Compute a balanced square canvas with 6% padding around the painted artwork
    const maxDim = Math.max(tw, th);
    const padding = Math.max(4, Math.round(maxDim * 0.06));
    const canvasSize = maxDim + padding * 2;

    const left = Math.round((canvasSize - tw) / 2);
    const top = Math.round((canvasSize - th) / 2);

    // 3. Composite the painted artwork dead-center on the transparent square canvas
    const centeredBuffer = await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: trimmed.data,
      left,
      top
    }])
    .png()
    .toBuffer();

    fs.writeFileSync(filePath, centeredBuffer);
    count++;
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}

console.log(`Successfully centered ${count}/${files.length} character icons!`);
