import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const brandDir = 'client/public/brand';
const iconSource = `${brandDir}/icon-shield.png`;
const logoSource = `${brandDir}/logo-main.png`;

async function generateAssets() {
  const sizes = [
    { name: 'favicon-16', size: 16, src: iconSource, dir: 'favicons' },
    { name: 'favicon-32', size: 32, src: iconSource, dir: 'favicons' },
    { name: 'favicon-48', size: 48, src: iconSource, dir: 'favicons' },
    { name: 'favicon-64', size: 64, src: iconSource, dir: 'favicons' },
    { name: 'favicon-96', size: 96, src: iconSource, dir: 'favicons' },
    { name: 'favicon-128', size: 128, src: iconSource, dir: 'favicons' },
    { name: 'favicon-256', size: 256, src: iconSource, dir: 'favicons' },
    { name: 'apple-touch-icon-57', size: 57, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-60', size: 60, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-72', size: 72, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-76', size: 76, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-114', size: 114, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-120', size: 120, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-144', size: 144, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-152', size: 152, src: iconSource, dir: 'app-icons' },
    { name: 'apple-touch-icon-180', size: 180, src: iconSource, dir: 'app-icons' },
    { name: 'android-icon-192', size: 192, src: iconSource, dir: 'app-icons' },
    { name: 'android-icon-384', size: 384, src: iconSource, dir: 'app-icons' },
    { name: 'android-icon-512', size: 512, src: iconSource, dir: 'app-icons' },
    { name: 'ms-icon-70', size: 70, src: iconSource, dir: 'app-icons' },
    { name: 'ms-icon-150', size: 150, src: iconSource, dir: 'app-icons' },
    { name: 'ms-icon-310', size: 310, src: iconSource, dir: 'app-icons' },
    { name: 'icon-sidebar', size: 200, src: logoSource, dir: '.' },
    { name: 'icon-header', size: 120, src: logoSource, dir: '.' },
  ];

  for (const { name, size, src, dir } of sizes) {
    const outDir = dir === '.' ? brandDir : `${brandDir}/${dir}`;
    mkdirSync(outDir, { recursive: true });
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(`${outDir}/${name}.png`);
    console.log(`Generated: ${outDir}/${name}.png (${size}x${size})`);
  }

  await sharp(iconSource)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('client/public/favicon.png');
  console.log('Generated: client/public/favicon.png (32x32)');

  console.log('\n--- Social Media Assets ---');

  const ogWidth = 1200;
  const ogHeight = 630;
  const logoResized = await sharp(logoSource)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const ogBg = await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 255 }
    }
  }).png().toBuffer();

  await sharp(ogBg)
    .composite([{
      input: logoResized,
      top: Math.round((ogHeight - 400) / 2),
      left: Math.round((ogWidth - 400) / 2),
    }])
    .png()
    .toFile(`${brandDir}/social/og-image.png`);
  console.log(`Generated: ${brandDir}/social/og-image.png (${ogWidth}x${ogHeight})`);

  const twitterWidth = 1500;
  const twitterHeight = 500;
  const twitterLogo = await sharp(logoSource)
    .resize(350, 350, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const twitterBg = await sharp({
    create: {
      width: twitterWidth,
      height: twitterHeight,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 255 }
    }
  }).png().toBuffer();

  await sharp(twitterBg)
    .composite([{
      input: twitterLogo,
      top: Math.round((twitterHeight - 350) / 2),
      left: Math.round((twitterWidth - 350) / 2),
    }])
    .png()
    .toFile(`${brandDir}/social/twitter-header.png`);
  console.log(`Generated: ${brandDir}/social/twitter-header.png (${twitterWidth}x${twitterHeight})`);

  console.log('\n--- Email & Print ---');

  const emailWidth = 600;
  const emailHeight = 150;
  const emailLogo = await sharp(logoSource)
    .resize(130, 130, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const emailBg = await sharp({
    create: {
      width: emailWidth,
      height: emailHeight,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 255 }
    }
  }).png().toBuffer();

  await sharp(emailBg)
    .composite([{
      input: emailLogo,
      top: 10,
      left: Math.round((emailWidth - 130) / 2),
    }])
    .png()
    .toFile(`${brandDir}/social/email-header.png`);
  console.log(`Generated: ${brandDir}/social/email-header.png (${emailWidth}x${emailHeight})`);

  const letterWidth = 2550;
  const letterHeight = 400;
  const letterLogo = await sharp(logoSource)
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const letterBg = await sharp({
    create: {
      width: letterWidth,
      height: letterHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 }
    }
  }).png().toBuffer();

  await sharp(letterBg)
    .composite([{
      input: letterLogo,
      top: 50,
      left: 100,
    }])
    .png()
    .toFile(`${brandDir}/social/pdf-letterhead.png`);
  console.log(`Generated: ${brandDir}/social/pdf-letterhead.png (${letterWidth}x${letterHeight})`);

  console.log('\nAll brand assets generated successfully!');
}

generateAssets().catch(console.error);
