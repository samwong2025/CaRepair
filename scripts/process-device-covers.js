#!/usr/bin/env node
/* eslint-disable */
/**
 * 將 public/device-covers/src/*.png 的純白背景轉成透明，並按內容裁切＋縮放
 * 輸出到 public/device-covers/*.png
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, '..', 'public', 'device-covers', 'src');
const OUT_DIR = path.join(__dirname, '..', 'public', 'device-covers');

const MAP = {
  iPhone: 'Product_render_of_an_iPhone_17_2026-08-10T14-39-48.png',
  iPad: 'Product_render_of_an_iPad_Pro__2026-08-10T14-39-49.png',
  Watch: 'Product_render_of_an_Apple_Wat_2026-08-10T14-39-49.png',
  MacBook: 'Product_render_of_a_MacBook_Pr_2026-08-10T14-39-52.png',
};

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [label, filename] of Object.entries(MAP)) {
    const inPath = path.join(SRC_DIR, filename);
    if (!fs.existsSync(inPath)) {
      console.warn('skip', inPath);
      continue;
    }
    const outName = `device-${label.toLowerCase()}.png`;
    const outPath = path.join(OUT_DIR, outName);

    const img = sharp(inPath);
    const meta = await img.metadata();
    const W = meta.width || 1024;
    const H = meta.height || 1024;

    // 1) 先做軟白底 → 透明（near-white 視為透明）
    const raw = await img
      .clone()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = raw;
    const { width, height, channels } = info;
    const thresh = 245; // R/G/B 都 >= thresh 視為白
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r >= thresh && g >= thresh && b >= thresh) {
        // 漸層淡白也去掉（以距離 255 的最小距離作為 alpha 權重）
        const d = Math.min(255 - r, 255 - g, 255 - b);
        if (d <= 6) {
          data[i + 3] = 0;
        } else {
          data[i + 3] = Math.round((d / 10) * 255);
        }
      }
    }

    // 2) 用處理後的 buffer 重新組合，自動 trim 透明邊
    const processed = await sharp(data, { raw: { width, height, channels } })
      .png()
      .trim()
      .toBuffer({ resolveWithObject: true });

    // 3) 最終縮放到寬度 600、保留縱橫比
    await sharp(processed.data, {
      raw: {
        width: processed.info.width,
        height: processed.info.height,
        channels: 4,
      },
    })
      .resize({ width: 600, withoutEnlargement: true })
      .png()
      .toFile(outPath);

    const outMeta = await sharp(outPath).metadata();
    console.log(
      `[${label}] ${W}x${H} -> ${outMeta.width}x${outMeta.height} → ${outPath}`
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
