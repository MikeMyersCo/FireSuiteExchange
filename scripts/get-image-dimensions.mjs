import sharp from 'sharp';

const image = sharp('./public/images/venue-map.png');
const metadata = await image.metadata();

console.log('Image dimensions:', metadata.width, 'x', metadata.height);
