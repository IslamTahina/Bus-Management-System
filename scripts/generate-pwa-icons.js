import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const sizes = [192, 512];
const publicDir = path.join(process.cwd(), 'public');

async function generateIcons() {
  const svgBuffer = await fs.readFile(path.join(publicDir, 'icon.svg'));
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `pwa-${size}x${size}.png`));
    
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error); 