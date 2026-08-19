const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="#1a237e"/>
  <path d="M256 80L400 150V260C400 340 330 400 256 430C182 400 112 340 112 260V150Z" fill="none" stroke="url(#g)" stroke-width="14" stroke-linejoin="round"/>
  <path d="M220 260L248 288L296 228" fill="none" stroke="#22C55E" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const sizes = [192, 512];
const outDir = path.join(__dirname, '..', 'client-web', 'public', 'icons');

async function generate() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const size of sizes) {
    const outPath = path.join(outDir, `icon-${size}.png`);
    await sharp(Buffer.from(svgIcon)).resize(size, size).png().toFile(outPath);
    console.log(`Generated ${outPath}`);
  }
}

generate().catch(console.error);
