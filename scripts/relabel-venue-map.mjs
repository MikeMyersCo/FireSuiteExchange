import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const inputPath = './public/images/venue-map.png';
const outputPath = './public/images/venue-map.png';

// Read the original image
const image = sharp(inputPath);
const metadata = await image.metadata();

console.log('Image dimensions:', metadata.width, 'x', metadata.height);

// V-section labels positions (left to right, top row)
// Based on the venue map, these are the small boxes at the top
// Each section is approximately 22px wide with small gaps

const vSections = [
  { num: '101', x: 128, y: 82 },
  { num: '102', x: 148, y: 82 },
  { num: '103', x: 168, y: 82 },
  { num: '104', x: 188, y: 82 },
  { num: '105', x: 208, y: 82 },
  { num: '106', x: 228, y: 82 },
  { num: '107', x: 248, y: 82 },
  { num: '108', x: 268, y: 82 },
  { num: '109', x: 288, y: 82 },
  { num: '110', x: 308, y: 82 },
  { num: '111', x: 328, y: 82 },
  { num: '112', x: 348, y: 82 },
  { num: '113', x: 368, y: 82 },
  { num: '114', x: 388, y: 82 },
  { num: '115', x: 408, y: 82 },
  { num: '116', x: 428, y: 82 },
  { num: '117', x: 448, y: 82 },
];

// Create SVG overlay with white rectangles to cover old labels and new text
let svgOverlay = `
<svg width="${metadata.width}" height="${metadata.height}">
`;

// Add white rectangles to cover old labels
for (const section of vSections) {
  svgOverlay += `
  <rect x="${section.x - 2}" y="${section.y - 10}" width="18" height="12" fill="white"/>
`;
}

// Add new text labels
for (const section of vSections) {
  svgOverlay += `
  <text x="${section.x + 7}" y="${section.y}"
        font-family="Arial, sans-serif"
        font-size="7"
        font-weight="600"
        fill="#1e3a8a"
        text-anchor="middle">${section.num}</text>
`;
}

svgOverlay += '</svg>';

// Composite the SVG overlay onto the image
await image
  .composite([{
    input: Buffer.from(svgOverlay),
    top: 0,
    left: 0,
  }])
  .toFile(outputPath + '.tmp');

// Move the temp file to replace the original
writeFileSync(outputPath, readFileSync(outputPath + '.tmp'));
// Delete temp file
import { unlinkSync } from 'fs';
unlinkSync(outputPath + '.tmp');

console.log('Successfully relabeled venue map with V101-V117');
