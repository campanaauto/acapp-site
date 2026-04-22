import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

const BASE = 'public/images';

/*
  HOMEPAGE V4 IMAGE SELECTION RATIONALE
  All images selected for: warm natural light, overhead/close-up product angles,
  neutral surfaces, no visible faces, no streetwear aesthetic, Kinfolk/Cereal magazine feel.
*/
const images = [
  // Homepage v4: product-first editorial photography
  // Hero right column: overhead flat-lay of folded apparel on warm surface
  ['v4/hero.webp', 'photo-1558171813-4c088753af8f', 2400],
  // Masthead: embroidered thread detail or folded product close-up
  ['v4/masthead.webp', 'photo-1620799140408-edc6dcb6d633', 1200],
  // Capability 1 (screen print): ink/squeegee detail, overhead
  ['v4/cap-screen.webp', 'photo-1565128939020-88e10500e38c', 1200],
  // Capability 2 (embroidery): thread close-up on fabric
  ['v4/cap-embroidery.webp', 'photo-1558171814-77ebc699b5c0', 1200],
  // Capability 3 (print): stack of printed cards, warm overhead
  ['v4/cap-print.webp', 'photo-1531169509526-f8f1fdab90f1', 1200],
  // Vertical: dealerships (folded polos on warm surface)
  ['v4/vert-dealers.webp', 'photo-1620799140188-3b2a02fd9a77', 1200],
  // Vertical: contractors (work apparel, canvas, hi-vis)
  ['v4/vert-contractors.webp', 'photo-1578587018452-892bacefd3f2', 1200],
  // Vertical: franchise (folded branded apron/uniform)
  ['v4/vert-franchise.webp', 'photo-1558171814-77ebc699b5c0', 1200],

  // Keep existing images for other pages
  ['homepage/craft-1.webp', 'photo-1565128939020-88e10500e38c', 1200],
  ['homepage/craft-2.webp', 'photo-1558171814-77ebc699b5c0', 1200],
  ['homepage/craft-3.webp', 'photo-1531169509526-f8f1fdab90f1', 1200],
  ['homepage/step-1.webp', 'photo-1517694712202-14dd9538aa97', 800],
  ['homepage/step-2.webp', 'photo-1454165804606-c3d57bc86b40', 800],
  ['homepage/step-3.webp', 'photo-1562408590-e32931084e23', 800],
  ['homepage/step-4.webp', 'photo-1566576912321-d58ddd7a6088', 800],
  ['homepage/vertical-1.webp', 'photo-1620799140188-3b2a02fd9a77', 1200],
  ['homepage/vertical-2.webp', 'photo-1578587018452-892bacefd3f2', 1200],
  ['homepage/vertical-3.webp', 'photo-1558171814-77ebc699b5c0', 1200],
  ['homepage/usecase-1.webp', 'photo-1540575467063-178a50c2df87', 1200],
  ['homepage/usecase-2.webp', 'photo-1489987707025-afc232f7ea0f', 1200],
  ['homepage/usecase-3.webp', 'photo-1514228742587-6b1558fcca3d', 1200],
  ['homepage/usecase-4.webp', 'photo-1559136555-9303baea8ebd', 1200],

  // Projects
  ['projects/project-1.webp', 'photo-1620799140408-edc6dcb6d633', 800],
  ['projects/project-2.webp', 'photo-1489987707025-afc232f7ea0f', 800],
  ['projects/project-3.webp', 'photo-1558171814-77ebc699b5c0', 800],
  ['projects/project-4.webp', 'photo-1540575467063-178a50c2df87', 800],
  ['projects/project-5.webp', 'photo-1514228742587-6b1558fcca3d', 800],
  ['projects/project-6.webp', 'photo-1559136555-9303baea8ebd', 800],
  ['projects/project-7.webp', 'photo-1578587018452-892bacefd3f2', 800],
  ['projects/project-8.webp', 'photo-1620799140188-3b2a02fd9a77', 800],
  ['projects/project-9.webp', 'photo-1565128939020-88e10500e38c', 800],
  ['projects/project-10.webp', 'photo-1566576912321-d58ddd7a6088', 800],
  ['projects/project-11.webp', 'photo-1531169509526-f8f1fdab90f1', 800],
  ['projects/project-12.webp', 'photo-1513885535751-8b9238bd345a', 800],

  // About
  ['about/hero.webp', 'photo-1562408590-e32931084e23', 1200],

  // Dealerships
  ['dealerships/hero.webp', 'photo-1620799140188-3b2a02fd9a77', 1920],
  ['dealerships/product-1.webp', 'photo-1620799140408-edc6dcb6d633', 800],
  ['dealerships/product-2.webp', 'photo-1513151233558-d860c5398176', 800],
  ['dealerships/product-3.webp', 'photo-1514228742587-6b1558fcca3d', 800],
  ['dealerships/product-4.webp', 'photo-1552519507-da3b142c6e3d', 800],
  ['dealerships/product-5.webp', 'photo-1540575467063-178a50c2df87', 800],
  ['dealerships/product-6.webp', 'photo-1558171813-4c088753af8f', 800],

  // Contractors
  ['contractors/hero.webp', 'photo-1578587018452-892bacefd3f2', 1920],
  ['contractors/product-1.webp', 'photo-1578768079052-aa76e52ff62e', 800],
  ['contractors/product-2.webp', 'photo-1581578731548-c64695cc6952', 800],
  ['contractors/product-3.webp', 'photo-1521369909029-2afed882baee', 800],
  ['contractors/product-4.webp', 'photo-1503342217505-b0a15ec3261c', 800],
  ['contractors/product-5.webp', 'photo-1559136555-9303baea8ebd', 800],
  ['contractors/product-6.webp', 'photo-1581578731548-c64695cc6952', 800],

  // Franchise
  ['franchise/hero.webp', 'photo-1558171814-77ebc699b5c0', 1920],
  ['franchise/product-1.webp', 'photo-1523381210434-271e8be1f52b', 800],
  ['franchise/product-2.webp', 'photo-1531482615713-2afd69097998', 800],
  ['franchise/product-3.webp', 'photo-1563906267088-b029e7101114', 800],
  ['franchise/product-4.webp', 'photo-1611532736597-de2d4265fba3', 800],
  ['franchise/product-5.webp', 'photo-1596755094514-f87e34085b2c', 800],
  ['franchise/product-6.webp', 'photo-1513885535751-8b9238bd345a', 800],

  // Thanks
  ['thanks/process-1.webp', 'photo-1562408590-e32931084e23', 800],
  ['thanks/process-2.webp', 'photo-1566576912321-d58ddd7a6088', 800],
];

async function downloadAndOptimize(outputPath, photoId, width) {
  const fullPath = join(BASE, outputPath);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const urls = [
    `https://images.unsplash.com/${photoId}?w=${width}&q=80&auto=format&fit=crop`,
    `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&w=${width}&q=80&auto=format&fit=crop`,
  ];

  let buffer = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (res.ok) { buffer = Buffer.from(await res.arrayBuffer()); break; }
    } catch {}
  }

  if (!buffer) {
    console.log(`  WARN: Could not download ${photoId}, generating placeholder`);
    buffer = await sharp({ create: { width, height: Math.round(width * 0.66), channels: 3, background: { r: 250, g: 250, b: 245 } } }).webp({ quality: 80 }).toBuffer();
    await writeFile(fullPath, buffer);
    console.log(`  Placeholder saved: ${outputPath}`);
    return;
  }

  try {
    const optimized = await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    await writeFile(fullPath, optimized);
    console.log(`  OK: ${outputPath} (${(optimized.length / 1024).toFixed(0)}KB)`);
  } catch {
    console.log(`  WARN: sharp failed for ${outputPath}, saving raw`);
    await writeFile(fullPath, buffer);
  }
}

console.log(`Downloading and optimizing ${images.length} images...`);
for (let i = 0; i < images.length; i += 5) {
  const batch = images.slice(i, i + 5);
  await Promise.all(batch.map(([path, id, width]) => downloadAndOptimize(path, id, width)));
  console.log(`  Batch ${Math.floor(i/5) + 1}/${Math.ceil(images.length/5)} done`);
}
console.log('All images processed.');
