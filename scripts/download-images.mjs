import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

const BASE = 'public/images';

// Each entry: [outputPath, unsplashPhotoId, width]
// Using known stable Unsplash photo IDs
const images = [
  // Homepage
  ['homepage/hero.webp', 'photo-1558618666-fcd25c85f82e', 1920],       // screen printing shop
  ['homepage/service-apparel.webp', 'photo-1489987707025-afc232f7ea0f', 800], // folded shirts
  ['homepage/service-promo.webp', 'photo-1577937927133-66ef06acdf18', 800],    // branded mugs/cups
  ['homepage/service-print.webp', 'photo-1586075010923-2dd4570fb338', 800],    // printed materials
  ['homepage/guarantee-bg.webp', 'photo-1553413077-190dd305871c', 1920],       // warehouse shipping
  ['homepage/step-1.webp', 'photo-1517694712202-14dd9538aa97', 800],           // laptop with code/design
  ['homepage/step-2.webp', 'photo-1454165804606-c3d57bc86b40', 800],           // reviewing document
  ['homepage/step-3.webp', 'photo-1562408590-e32931084e23', 800],              // printing machine
  ['homepage/step-4.webp', 'photo-1566576912321-d58ddd7a6088', 800],           // shipping boxes

  // Dealerships
  ['dealerships/hero.webp', 'photo-1560250097-0b93528c311a', 1920],            // business professional
  ['dealerships/product-1.webp', 'photo-1594938298603-c8148c4dae35', 800],     // polo shirt
  ['dealerships/product-2.webp', 'photo-1513151233558-d860c5398176', 800],     // flags/banners
  ['dealerships/product-3.webp', 'photo-1514228742587-6b1558fcca3d', 800],     // tumblers/cups
  ['dealerships/product-4.webp', 'photo-1549317661-bd32c8ce0afe', 800],        // car detail/frame
  ['dealerships/product-5.webp', 'photo-1540575467063-178a50c2df87', 800],     // event setup
  ['dealerships/product-6.webp', 'photo-1521791136064-7986c2920216', 800],     // business attire

  // Contractors
  ['contractors/hero.webp', 'photo-1504307651254-35680f356dfd', 800],         // construction worker
  ['contractors/product-1.webp', 'photo-1578768079052-aa76e52ff62e', 800],     // hi-vis vest
  ['contractors/product-2.webp', 'photo-1544963270-e597b0fcedb5', 800],        // jacket/outerwear
  ['contractors/product-3.webp', 'photo-1521369909029-2afed882baee', 800],     // hats/beanies
  ['contractors/product-4.webp', 'photo-1503342217505-b0a15ec3261c', 800],     // tshirts stacked
  ['contractors/product-5.webp', 'photo-1559136555-9303baea8ebd', 800],        // trade show/banner
  ['contractors/product-6.webp', 'photo-1581578731548-c64695cc6952', 800],     // work pants/gear

  // Franchise
  ['franchise/hero.webp', 'photo-1556742049-0cfed4f6a45d', 1920],             // retail/service staff
  ['franchise/product-1.webp', 'photo-1523381210434-271e8be1f52b', 800],       // branded tees
  ['franchise/product-2.webp', 'photo-1531482615713-2afd69097998', 800],       // event/swag
  ['franchise/product-3.webp', 'photo-1563906267088-b029e7101114', 800],       // signage
  ['franchise/product-4.webp', 'photo-1611532736597-de2d4265fba3', 800],       // print collateral
  ['franchise/product-5.webp', 'photo-1596755094514-f87e34085b2c', 800],       // uniform/staff
  ['franchise/product-6.webp', 'photo-1513885535751-8b9238bd345a', 800],       // giveaway items

  // Thank you page
  ['thanks/process-1.webp', 'photo-1562408590-e32931084e23', 800],             // press in motion
  ['thanks/process-2.webp', 'photo-1566576912321-d58ddd7a6088', 800],          // shipping boxes
];

async function downloadAndOptimize(outputPath, photoId, width) {
  const fullPath = join(BASE, outputPath);
  const dir = dirname(fullPath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  // Try multiple URL patterns
  const urls = [
    `https://images.unsplash.com/${photoId}?w=${width}&q=80&auto=format&fit=crop`,
    `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&w=${width}&q=80&auto=format&fit=crop`,
  ];

  let buffer = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        buffer = Buffer.from(await res.arrayBuffer());
        break;
      }
    } catch {
      // try next URL
    }
  }

  if (!buffer) {
    console.log(`  WARN: Could not download ${photoId}, generating placeholder`);
    // Generate a solid color placeholder
    buffer = await sharp({
      create: {
        width: width,
        height: Math.round(width * 0.6),
        channels: 3,
        background: { r: 51, g: 65, b: 85 }, // slate-700
      }
    }).webp({ quality: 80 }).toBuffer();

    await writeFile(fullPath, buffer);
    console.log(`  Placeholder saved: ${outputPath}`);
    return;
  }

  try {
    const optimized = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await writeFile(fullPath, optimized);
    console.log(`  OK: ${outputPath} (${(optimized.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    console.log(`  WARN: sharp failed for ${outputPath}, saving raw`);
    await writeFile(fullPath, buffer);
  }
}

console.log(`Downloading and optimizing ${images.length} images...`);

// Process in batches of 5 to avoid overwhelming the network
for (let i = 0; i < images.length; i += 5) {
  const batch = images.slice(i, i + 5);
  await Promise.all(
    batch.map(([path, id, width]) => downloadAndOptimize(path, id, width))
  );
  console.log(`  Batch ${Math.floor(i/5) + 1}/${Math.ceil(images.length/5)} done`);
}

console.log('All images processed.');
