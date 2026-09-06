const sharp = require('sharp');
const { extractText } = require('../controllers/ocrController');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300">
  <rect width="900" height="300" fill="white"/>
  <text x="30" y="90" font-family="Arial" font-size="44" fill="black">JobShield Test Text 123</text>
  <text x="30" y="170" font-family="Arial" font-size="44" fill="black">Software Engineer Vacancy</text>
  <text x="30" y="250" font-family="Arial" font-size="44" fill="black">Submit Resume by Email</text>
</svg>`;

(async () => {
  let buffer;
  try {
    buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  } catch (e) {
    console.error('sharp svg render failed:', e.message);
    process.exit(1);
  }

  console.log('test image bytes:', buffer.length);

  const req = { file: { buffer, originalname: 'test.png', size: buffer.length } };
  let statusCode = null;
  const res = {
    status(c) { statusCode = c; return this; },
    json(o) {
      console.log('HTTP', statusCode);
      console.log('success:', o.success);
      if (o.success) {
        console.log('OCR text:', JSON.stringify(o.data.text));
        console.log('confidence:', o.data.confidence, '| words:', o.data.wordCount);
      } else {
        console.log('error:', o.error, '| message:', o.message);
      }
    }
  };

  await extractText(req, res);
  process.exit(0);
})().catch((e) => {
  console.error('test crashed:', e);
  process.exit(1);
});