// Simple script to generate icons - requires sharp package
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// This is a placeholder - in production you'd use sharp or similar
// For now, we'll create a simple HTML file that can be used to generate icons
// Or you can use an online tool like https://realfavicongenerator.net/

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log(`
Icon generation script
======================

For production, you can:
1. Use an online tool: https://realfavicongenerator.net/
   - Upload the icon.svg file
   - Generate all sizes
   - Download and place in public/ folder

2. Or use sharp package:
   npm install sharp
   Then update this script to use sharp to convert SVG to PNG

Required icons:
- icon-192.png (192x192)
- icon-512.png (512x512)
- favicon.ico (32x32 or 16x16)

Place them in the public/ folder.
`);



