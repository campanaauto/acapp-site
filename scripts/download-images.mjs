import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

const BASE = 'public/images';

// Each entry: [outputPath, unsplashPhotoId, width]
const images = [
  // Homepage — Hero
  ['homepage/hero.webp', 'photo-1558618666-fcd25c85f82e', 1920],       // screen printing shop editorial

  // Homepage — Craft detail shots
  ['homepage/craft-1.webp', 'photo-1503342394128-c104d54dba01', 1200],  // screen printing action
  ['homepage/craft-2.webp', 'photo-1594938298603-c8148c4dae35', 1200],  // embroidery / polo close-up
  ['homepage/craft-3.webp', 'photo-1586075010923-2dd4570fb338', 1200],  // printing press / print materials

  // Homepage — Use-case tiles
  ['homepage/usecase-1.webp', 'photo-1540575467063-178a50c2df87', 1200], // event setup / grand opening
  ['homepage/usecase-2.webp', 'photo-1489987707025-afc232f7ea0f', 1200], // folded uniforms / onboarding
  ['homepage/usecase-3.webp', 'photo-1514228742587-6b1558fcca3d', 1200], // tumblers / gift set
  ['homepage/usecase-4.webp', 'photo-1559136555-9303baea8ebd', 1200],   // trade show / banner booth

  // Homepage — How it Works steps
  ['homepage/step-1.webp', 'photo-1517694712202-14dd9538aa97', 800],     // laptop with design file
  ['homepage/step-2.webp', 'photo-1454165804606-c3d57bc86b40', 800],     // reviewing document
  ['homepage/step-3.webp', 'photo-1562408590-e32931084e23', 800],        // printing machine
  ['homepage/step-4.webp', 'photo-1566576912321-d58ddd7a6088', 800],     // shipping boxes

  // Homepage — Vertical feature images
  ['homepage/vertical-1.webp', 'photo-1560250097-0b93528c311a', 1200],   // dealership professional
  ['homepage/vertical-2.webp', 'photo-1504307651254-35680f356dfd', 1200], // contractor on site
  ['homepage/vertical-3.webp', 'photo-1556742049-0cfed4f6a45d', 1200],   // franchise / retail staff

  // Dealerships
  ['dealerships/hero.webp', 'photo-1560250097-0b93528c311a', 1920],
  ['dealerships/product-1.webp', 'photo-1594938298603-c8148c4dae35', 800],
  ['dealerships/product-2.webp', 'photo-1513151233558-d860c5398176', 800],
  ['dealerships/product-3.webp', 'photo-1514228742587-6b1558fcca3d', 800],
  ['dealerships/product-4.webp', 'photo-1549317661-bd32c8ce0afe', 800],
  ['dealerships/product-5.webp', 'photo-1540575467063-178a50c2df87', 800],
  ['dealerships/product-6.webp', 'photo-1521791136064-7986c2920216', 800],

  // Contractors
  ['contractors/hero.webp', 'photo-1504307651254-35680f356dfd', 1920],
  ['contractors/product-1.webp', 'photo-1578768079052-aa76e52ff62e', 800],
  ['contractors/product-2.webp', 'photo-1544963270-e597b0fcedb5', 800],
  ['contractors/product-3.webp', 'photo-1521369909029-2afed882baee', 800],
  ['contractors/product-4.webp', 'photo-1503342217505-b0a15ec3261c', 800],
  ['contractors/product-5.webp', 'photo-1559136555-9303baea8ebd', 800],
  ['contractors/product-6.webp', 'photo-1581578731548-c64695cc6952', 800],

  // Franchise
  ['franchise/hero.webp', 'photo-1556742049-0cfed4f6a45d', 1920],
  ['franchise/product-1.webp', 'photo-1523381210434-271e8be1f52b', 800],
  ['franchise/product-2.webp', 'photo-1531482615713-2afd69097998', 800],
  ['franchise/product-3.webp', 'photo-1563906267088-b029e7101114', 800],
  ['franchise/product-4.webp', 'photo-1611532736597-de2d4265fba3', 800],
  ['franchise/product-5.webp', 'photo-1596755094514-f87e34085b2c', 800],
  ['franchise/product-6.webp', 'photo-1513885535751-8b9238bd345a', 800],

  // Thank you page
  ['thanks/process-1.webp', 'photo-1562408590-e32931084e23', 800],
  ['thanks/process-2.webp', 'photo-1566576912321-d58ddd7a6088', 800],
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
    buffer = await sharp({
      create: {
        width: width,
        height: Math.round(width * 0.6),
        channels: 3,
        background: { r: 26, g: 26, b: 26 }, // charcoal placeholder
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
